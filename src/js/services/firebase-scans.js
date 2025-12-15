import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
  enableIndexedDbPersistence,
  writeBatch,
  updateDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase-config.js';
import { getUserId } from './firebase-auth.js';
import { log } from '../utils/log.js';
import { getHistory, setHistory } from './storage.js';

const SCANS_COLLECTION = 'scans';

/**
 * Initialize Firestore with offline persistence
 */
export async function initFirestore() {
  if (!isFirebaseConfigured() || !db) {
    log.warn('Firestore not configured. Running in local-only mode.');
    return { error: null };
  }

  try {
    await enableIndexedDbPersistence(db);
    log.info('Firestore offline persistence enabled');
    return { error: null };
  } catch (error) {
    if (error.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      log.warn('Firestore persistence failed: Multiple tabs open');
    } else if (error.code === 'unimplemented') {
      // The current browser doesn't support persistence
      log.warn('Firestore persistence not supported in this browser');
    } else {
      log.error('Error enabling Firestore persistence:', error);
    }
    return { error };
  }
}

/**
 * Creates a standardized scan object for local storage.
 * @param {object} scanData - The raw scan data.
 * @param {object} extras - Extra properties like firestoreId or pendingSync.
 * @returns {object} A consistent scan object.
 */
function createLocalScanObject(scanData, extras = {}) {
  return {
    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Stable local ID
    value: scanData.value,
    addedAt: Date.now(),
    title: scanData.title || '',
    brand: scanData.brand || '',
    description: scanData.description || '',
    format: scanData.format || '',
    expirationDate: scanData.expirationDate || null,
    metadata: scanData.metadata || {},
    ...extras
  };
}
/**
 * Save a scan to Firestore
 * @param {object} scanData - The scan data to save
 * @param {string} scanData.value - The barcode value
 * @param {string} [scanData.format] - The barcode format (e.g., 'qr_code', 'ean_13')
 * @param {string} [scanData.title] - Product title from API
 * @param {string} [scanData.brand] - Product brand from API
 * @param {string} [scanData.description] - Product description from API
 * @param {object} [scanData.metadata] - Additional metadata
 * @returns {Promise<{error: null|Error, scanId: string|null}>}
 */
export async function saveScan(scanData) {
  const userId = getUserId();
  let localScan;
  let firestoreError = null;
  let scanId = null;

  const isOnline = isFirebaseConfigured() && db && userId;

  if (isOnline) {
    // Online: try to save to Firestore first
    try {
      const firestoreScan = {
        userId,
        value: scanData.value,
        format: scanData.format || '',
        title: scanData.title || '',
        brand: scanData.brand || '',
        description: scanData.description || '',
        expirationDate: scanData.expirationDate || null,
        metadata: scanData.metadata || {},
        scannedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, SCANS_COLLECTION), firestoreScan);
      log.info('Scan saved to Firestore:', docRef.id);
      scanId = docRef.id;
      // Create local copy with the new Firestore ID
      localScan = createLocalScanObject(scanData, { firestoreId: docRef.id });
    } catch (error) {
      log.error('Error saving scan to Firestore, falling back to local:', error);
      firestoreError = error;
      // Mark for sync since Firestore failed
      localScan = createLocalScanObject(scanData, { pendingSync: true });
    }
  } else {
    // Offline or not authenticated
    log.info('Saving scan locally (Firebase not available or user not authenticated)');
    // Mark for sync only if a user is logged in but offline
    const shouldSync = !!userId;
    localScan = createLocalScanObject(scanData, { pendingSync: shouldSync });
  }

  // Always save the determined localScan object to local storage
  try {
    const [, history = []] = await getHistory();
    await setHistory([...history, localScan]);
  } catch (localError) {
    log.error('CRITICAL: Failed to save scan to local storage:', localError);
    // This is a more critical error, so we return it.
    return { error: localError, scanId: null };
  }

  return { error: firestoreError, scanId };
}

/**
 * Update expiration date for a scan
 * @param {string} barcodeValue - The barcode value to find the scan
 * @param {string} expirationDate - The expiration date in YYYY-MM-DD format
 * @returns {Promise<{error: null|Error, success: boolean}>}
 */
export async function updateScanExpiration(barcodeValue, expirationDate) {
  const userId = getUserId();

  if (!isFirebaseConfigured() || !db || !userId) {
    // Update local storage
    try {
      const [, history = []] = await getHistory();
      const updatedHistory = history.map(item => {
        if (item.value === barcodeValue) {
          return {
            ...item,
            expirationDate: expirationDate
          };
        }
        return item;
      });
      await setHistory(updatedHistory);
      return { error: null, success: true };
    } catch (err) {
      log.error('Error updating expiration date in local storage:', err);
      return { error: err, success: false };
    }
  }

  // Update Firestore
  try {
    const scansQuery = query(
      collection(db, SCANS_COLLECTION),
      where('userId', '==', userId),
      where('value', '==', barcodeValue)
    );
    const querySnapshot = await getDocs(scansQuery);

    if (!querySnapshot.empty) {
      // Update the most recent scan with this barcode
      const docs = querySnapshot.docs;
      const mostRecentDoc = docs.reduce((latest, current) => {
        const latestTime = latest.data().scannedAt?.toMillis() || 0;
        const currentTime = current.data().scannedAt?.toMillis() || 0;
        return currentTime > latestTime ? current : latest;
      }, docs[0]);

      await updateDoc(doc(db, SCANS_COLLECTION, mostRecentDoc.id), {
        expirationDate: expirationDate,
        updatedAt: Timestamp.now()
      });

      // Also update local storage
      const [, history = []] = await getHistory();
      const updatedHistory = history.map(item => {
        if (item.value === barcodeValue || item.firestoreId === mostRecentDoc.id) {
          return {
            ...item,
            expirationDate: expirationDate
          };
        }
        return item;
      });
      await setHistory(updatedHistory);

      log.info('Expiration date updated for scan:', mostRecentDoc.id);
      return { error: null, success: true };
    } else {
      log.warn('No scan found with barcode:', barcodeValue);
      return { error: new Error('Scan not found'), success: false };
    }
  } catch (err) {
    log.error('Error updating expiration date:', err);
    return { error: err, success: false };
  }
}

/**
 * Get all scans for the current user
 * @param {number} [maxResults=100] - Maximum number of results to return
 * @returns {Promise<{error: null|Error, scans: Array}>}
 */
export async function getUserScans(maxResults = 100) {
  const userId = getUserId();

  // If Firebase is not configured or user is not authenticated, return local storage
  if (!isFirebaseConfigured() || !db || !userId) {
    log.info('Getting scans from local storage (Firebase not available or user not authenticated)');

    try {
      const [error, history = []] = await getHistory();
      if (error) {
        return { error, scans: [] };
      }

      // Transform local storage format to match Firestore format
      const scans = history.map(item => ({
        id: item.firestoreId || item.id, // Use firestoreId or the stable local ID
        value: item.value,
        title: item.title || '',
        brand: item.brand || '',
        description: item.description || '',
        format: item.format || '',
        scannedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
        metadata: item.metadata || {}
      }));

      return { error: null, scans };
    } catch (localError) {
      log.error('Error getting scans from local storage:', localError);
      return { error: localError, scans: [] };
    }
  }

  try {
    // Query without orderBy to avoid requiring a composite index
    // We'll sort in JavaScript instead
    const scansQuery = query(collection(db, SCANS_COLLECTION), where('userId', '==', userId));

    const querySnapshot = await getDocs(scansQuery);
    const scans = [];

    querySnapshot.forEach(doc => {
      scans.push({
        id: doc.id,
        ...doc.data(),
        scannedAt: doc.data().scannedAt?.toDate() || new Date()
      });
    });

    // Sort by scannedAt descending in JavaScript (no index required)
    scans.sort((a, b) => {
      const dateA = a.scannedAt instanceof Date ? a.scannedAt : new Date(a.scannedAt);
      const dateB = b.scannedAt instanceof Date ? b.scannedAt : new Date(b.scannedAt);
      return dateB.getTime() - dateA.getTime(); // Descending order
    });

    // Apply limit after sorting
    const limitedScans = scans.slice(0, maxResults);

    log.info(`Retrieved ${limitedScans.length} scans from Firestore`);
    return { error: null, scans: limitedScans };
  } catch (error) {
    // Check if it's an index error - provide helpful message
    if (error.code === 'failed-precondition' && error.message?.includes('index')) {
      log.warn(
        'Firestore query requires an index. Falling back to local storage. The app will still work, but you may want to create the index for better performance.'
      );
    } else {
      log.error('Error getting scans from Firestore:', error);
    }

    // Fallback: try to get from local storage
    try {
      const [localError, history = []] = await getHistory();
      if (!localError) {
        const scans = history.map(item => ({
          id: item.firestoreId || item.id, // Use firestoreId or the stable local ID
          value: item.value,
          title: item.title || '',
          brand: item.brand || '',
          description: item.description || '',
          format: item.format || '',
          scannedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
          metadata: item.metadata || {}
        }));

        // Sort by scannedAt descending (same as Firestore query would)
        scans.sort((a, b) => {
          const dateA = a.scannedAt instanceof Date ? a.scannedAt : new Date(a.scannedAt);
          const dateB = b.scannedAt instanceof Date ? b.scannedAt : new Date(b.scannedAt);
          return dateB.getTime() - dateA.getTime(); // Descending order
        });

        // Apply limit
        const limitedScans = scans.slice(0, maxResults);

        log.info(
          `Returning ${limitedScans.length} scans from local storage (Firestore unavailable)`
        );
        return { error: null, scans: limitedScans };
      }
    } catch (localError) {
      log.error('Error getting scans from local storage:', localError);
    }

    // Return the error but don't throw - let the caller handle it
    return { error, scans: [] };
  }
}

/**
 * Delete a scan from Firestore
 * @param {string} scanId - The ID of the scan to delete
 * @returns {Promise<{error: null|Error}>}
 */
export async function deleteScan(scanId) {
  const userId = getUserId();

  if (!isFirebaseConfigured() || !db || !userId || !scanId) {
    log.info('Deleting scan from local storage only');
    return { error: null };
  }

  try {
    await deleteDoc(doc(db, SCANS_COLLECTION, scanId));
    log.info('Scan deleted from Firestore:', scanId);
    return { error: null };
  } catch (error) {
    log.error('Error deleting scan from Firestore:', error);
    return { error };
  }
}

/**
 * Delete all scans for the current user
 * @returns {Promise<{error: null|Error, deletedCount: number}>}
 */
export async function deleteAllUserScans() {
  const userId = getUserId();

  if (!isFirebaseConfigured() || !db || !userId) {
    log.info('Deleting all scans from local storage only');

    try {
      await setHistory([]);
      return { error: null, deletedCount: 0 };
    } catch (error) {
      return { error, deletedCount: 0 };
    }
  }

  try {
    const scansQuery = query(collection(db, SCANS_COLLECTION), where('userId', '==', userId));

    const querySnapshot = await getDocs(scansQuery);
    const batch = writeBatch(db);
    let count = 0;

    querySnapshot.forEach(doc => {
      batch.delete(doc.ref);
      count++;
    });

    await batch.commit();
    log.info(`Deleted ${count} scans from Firestore`);

    // Also clear local storage
    try {
      await setHistory([]);
    } catch (localError) {
      log.warn('Error clearing local storage:', localError);
    }

    return { error: null, deletedCount: count };
  } catch (error) {
    log.error('Error deleting all scans from Firestore:', error);
    return { error, deletedCount: 0 };
  }
}

/**
 * Sync pending scans from local storage to Firestore
 * This is called when the user comes back online
 * @returns {Promise<{error: null|Error, syncedCount: number}>}
 */
export async function syncPendingScans() {
  const userId = getUserId();

  if (!isFirebaseConfigured() || !db || !userId) {
    return {
      error: new Error('Firebase not configured or user not authenticated'),
      syncedCount: 0
    };
  }

  try {
    const [error, history = []] = await getHistory();
    if (error) {
      return { error, syncedCount: 0 };
    }

    const pendingScans = history.filter(item => item.pendingSync === true && !item.firestoreId);

    if (pendingScans.length === 0) {
      log.info('No pending scans to sync.');
      return { error: null, syncedCount: 0 };
    }

    const batch = writeBatch(db);
    const scansToUpdateLocally = [];

    for (const localScan of pendingScans) {
      const newScanRef = doc(collection(db, SCANS_COLLECTION));
      const firestoreScan = {
        userId,
        value: localScan.value,
        format: localScan.format || '',
        title: localScan.title || '',
        brand: localScan.brand || '',
        description: localScan.description || '',
        metadata: localScan.metadata || {},
        // Use the original scan time if available, otherwise now.
        scannedAt: localScan.addedAt
          ? Timestamp.fromDate(new Date(localScan.addedAt))
          : Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      batch.set(newScanRef, firestoreScan);

      // Keep track of the original local scan and the new firestoreId
      scansToUpdateLocally.push({ localScan, firestoreId: newScanRef.id });
    }

    await batch.commit();
    log.info(`Successfully committed batch of ${scansToUpdateLocally.length} scans to Firestore.`);

    // Now, update the local history
    const updatedHistory = history.map(histItem => {
      const updateInfo = scansToUpdateLocally.find(u => u.localScan === histItem);
      if (updateInfo) {
        // This was a pending scan that just got synced. Update it.
        return {
          ...histItem,
          pendingSync: false, // or just remove the property
          firestoreId: updateInfo.firestoreId
        };
      }
      return histItem; // Return other items unchanged
    });

    await setHistory(updatedHistory);
    log.info(`Synced ${scansToUpdateLocally.length} pending scans and updated local storage.`);

    return { error: null, syncedCount: scansToUpdateLocally.length };
  } catch (error) {
    log.error('Error syncing pending scans:', error);
    return { error, syncedCount: 0 };
  }
}
