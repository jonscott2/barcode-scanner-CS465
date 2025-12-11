import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  enableIndexedDbPersistence,
  writeBatch,
  onSnapshot,
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
 * Save a scan to Firestore
 * @param {object} scanData - The scan data to save
 * @param {string} scanData.value - The barcode value
 * @param {string} [scanData.format] - The barcode format (e.g., 'qr_code', 'ean_13')
 * @param {string} [scanData.title] - Product title from API
 * @param {string} [scanData.brand] - Product brand from API
 * @param {string} [scanData.description] - Product description from API
 * @param {string} [scanData.imageUrl] - Product image URL from API
 * @param {Date|string|number} [scanData.expirationDate] - Product expiration date
 * @param {string} [scanData.notes] - User notes for this item
 * @param {string[]} [scanData.tags] - User tags for this item
 * @param {boolean} [scanData.isFavorite] - Whether this item is favorited
 * @param {string} [scanData.sessionId] - Session ID for bulk scanning
 * @param {object} [scanData.metadata] - Additional metadata
 * @returns {Promise<{error: null|Error, scanId: string|null}>}
 */
export async function saveScan(scanData) {
  const userId = getUserId();

  // Calculate expiration date - use provided or default to 30 days from now
  let expirationDate = null;
  if (scanData.expirationDate) {
    if (scanData.expirationDate instanceof Date) {
      expirationDate = Timestamp.fromDate(scanData.expirationDate);
    } else if (typeof scanData.expirationDate === 'string') {
      expirationDate = Timestamp.fromDate(new Date(scanData.expirationDate));
    } else if (typeof scanData.expirationDate === 'number') {
      expirationDate = Timestamp.fromMillis(scanData.expirationDate);
    }
  }

  // If no expiration date provided, calculate default (30 days)
  const defaultExpirationMs = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const expiresAt = expirationDate ? expirationDate.toMillis() : defaultExpirationMs;

  // If Firebase is not configured or user is not authenticated, save to local storage only
  if (!isFirebaseConfigured() || !db || !userId) {
    log.info('Saving scan locally (Firebase not available or user not authenticated)');

    try {
      // Save to local storage using existing storage service
      const [, history = []] = await getHistory();
      const newScan = {
        value: scanData.value,
        addedAt: Date.now(),
        expiresAt: expiresAt,
        notified: false,
        preNotified: false,
        title: scanData.title || '',
        brand: scanData.brand || '',
        description: scanData.description || '',
        format: scanData.format || '',
        imageUrl: scanData.imageUrl || '',
        expirationDate: expirationDate ? expirationDate.toMillis() : null,
        metadata: scanData.metadata || {}
      };

      await setHistory([...history, newScan]);
      log.info('Scan saved to local storage:', scanData.value);
      return { error: null, scanId: null };
    } catch (error) {
      log.error('Error saving scan locally:', error);
      return { error, scanId: null };
    }
  }

  try {
    const scan = {
      userId,
      value: scanData.value,
      format: scanData.format || '',
      title: scanData.title || '',
      brand: scanData.brand || '',
      description: scanData.description || '',
      imageUrl: scanData.imageUrl || '',
      expirationDate: expirationDate || null,
      notes: scanData.notes || '',
      tags: scanData.tags || [],
      isFavorite: scanData.isFavorite || false,
      sessionId: scanData.sessionId || null,
      metadata: scanData.metadata || {},
      scannedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, SCANS_COLLECTION), scan);
    log.info('Scan saved to Firestore:', { scanId: docRef.id, barcode: scanData.value, userId });

    // Also save to local storage as a backup
    try {
      const [, history = []] = await getHistory();
      const localScan = {
        value: scanData.value,
        addedAt: Date.now(),
        expiresAt: expiresAt,
        notified: false,
        preNotified: false,
        title: scanData.title || '',
        brand: scanData.brand || '',
        description: scanData.description || '',
        format: scanData.format || '',
        imageUrl: scanData.imageUrl || '',
        expirationDate: expirationDate ? expirationDate.toMillis() : null,
        firestoreId: docRef.id
      };
      await setHistory([...history, localScan]);
    } catch (localError) {
      log.warn('Error saving to local storage:', localError);
      // Non-fatal, continue
    }

    return { error: null, scanId: docRef.id };
  } catch (error) {
    log.error('Error saving scan to Firestore:', { error, barcode: scanData.value, userId });

    // Fallback: save to local storage
    try {
      const [, history = []] = await getHistory();
      const localScan = {
        value: scanData.value,
        addedAt: Date.now(),
        expiresAt: expiresAt,
        notified: false,
        preNotified: false,
        title: scanData.title || '',
        brand: scanData.brand || '',
        description: scanData.description || '',
        format: scanData.format || '',
        imageUrl: scanData.imageUrl || '',
        expirationDate: expirationDate ? expirationDate.toMillis() : null,
        pendingSync: true // Mark for sync when online
      };
      await setHistory([...history, localScan]);
      log.info('Scan saved locally, will sync when online');
    } catch (localError) {
      log.error('Error saving to local storage:', localError);
    }

    return { error, scanId: null };
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
        id: item.firestoreId || null,
        value: typeof item === 'string' ? item : item.value,
        title: item.title || '',
        brand: item.brand || '',
        description: item.description || '',
        format: item.format || '',
        imageUrl: item.imageUrl || '',
        expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
        notes: item.notes || '',
        tags: item.tags || [],
        isFavorite: item.isFavorite || false,
        sessionId: item.sessionId || null,
        scannedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
        metadata: item.metadata || {}
      }));

      return { error: null, scans };
    } catch (error) {
      log.error('Error getting scans from local storage:', error);
      return { error, scans: [] };
    }
  }

  try {
    const scansQuery = query(
      collection(db, SCANS_COLLECTION),
      where('userId', '==', userId),
      orderBy('scannedAt', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(scansQuery);
    const scans = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      scans.push({
        id: doc.id,
        value: data.value || '',
        format: data.format || '',
        title: data.title || '',
        brand: data.brand || '',
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        expirationDate: data.expirationDate?.toDate() || null,
        notes: data.notes || '',
        tags: data.tags || [],
        isFavorite: data.isFavorite || false,
        sessionId: data.sessionId || null,
        scannedAt: data.scannedAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        metadata: data.metadata || {}
      });
    });

    log.info(`Retrieved ${scans.length} scans from Firestore for user ${userId}`);
    return { error: null, scans };
  } catch (error) {
    log.error('Error getting scans from Firestore:', error);

    // Fallback: try to get from local storage
    try {
      const [localError, history = []] = await getHistory();
      if (!localError) {
        const scans = history.map(item => ({
          id: item.firestoreId || null,
          value: typeof item === 'string' ? item : item.value,
          title: item.title || '',
          brand: item.brand || '',
          description: item.description || '',
          format: item.format || '',
          imageUrl: item.imageUrl || '',
          expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
          notes: item.notes || '',
          tags: item.tags || [],
          isFavorite: item.isFavorite || false,
          sessionId: item.sessionId || null,
          scannedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
          metadata: item.metadata || {}
        }));

        log.info('Returning scans from local storage (Firestore unavailable)');
        return { error: null, scans };
      }
    } catch (localError) {
      log.error('Error getting scans from local storage:', localError);
    }

    return { error, scans: [] };
  }
}

/**
 * Subscribe to real-time updates of user scans
 * @param {Function} callback - Called when scans change with array of scans
 * @param {number} [maxResults=100] - Maximum number of results to return
 * @returns {Function} Unsubscribe function
 */
export function subscribeToUserScans(callback, maxResults = 100) {
  const userId = getUserId();

  if (!isFirebaseConfigured() || !db || !userId) {
    log.warn('Cannot subscribe to scans: Firebase not configured or user not authenticated');
    return () => {}; // Return no-op unsubscribe
  }

  try {
    const scansQuery = query(
      collection(db, SCANS_COLLECTION),
      where('userId', '==', userId),
      orderBy('scannedAt', 'desc'),
      limit(maxResults)
    );

    const unsubscribe = onSnapshot(
      scansQuery,
      querySnapshot => {
        const scans = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          scans.push({
            id: doc.id,
            value: data.value || '',
            format: data.format || '',
            title: data.title || '',
            brand: data.brand || '',
            description: data.description || '',
            imageUrl: data.imageUrl || '',
            expirationDate: data.expirationDate?.toDate() || null,
            notes: data.notes || '',
            tags: data.tags || [],
            isFavorite: data.isFavorite || false,
            sessionId: data.sessionId || null,
            scannedAt: data.scannedAt?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            metadata: data.metadata || {}
          });
        });
        log.info(`Real-time update: ${scans.length} scans for user ${userId}`);
        callback(scans);
      },
      error => {
        log.error('Error in real-time scan subscription:', error);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    log.error('Error setting up scan subscription:', error);
    return () => {}; // Return no-op unsubscribe
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

    const pendingScans = history.filter(item => item.pendingSync === true);

    if (pendingScans.length === 0) {
      return { error: null, syncedCount: 0 };
    }

    let syncedCount = 0;
    const updatedHistory = [...history];

    for (const scan of pendingScans) {
      try {
        const result = await saveScan({
          value: scan.value,
          title: scan.title,
          brand: scan.brand,
          description: scan.description,
          format: scan.format,
          metadata: scan.metadata
        });

        if (!result.error && result.scanId) {
          // Update local scan with Firestore ID and remove pendingSync flag
          const index = updatedHistory.findIndex(h => h === scan);
          if (index !== -1) {
            updatedHistory[index] = {
              ...updatedHistory[index],
              firestoreId: result.scanId,
              pendingSync: false
            };
          }
          syncedCount++;
        }
      } catch (syncError) {
        log.error('Error syncing individual scan:', syncError);
      }
    }

    // Update local storage with synced data
    await setHistory(updatedHistory);
    log.info(`Synced ${syncedCount} pending scans to Firestore`);

    return { error: null, syncedCount };
  } catch (error) {
    log.error('Error syncing pending scans:', error);
    return { error, syncedCount: 0 };
  }
}

/**
 * Update a scan with new data (notes, tags, favorite status, etc.)
 * @param {string} scanId - The ID of the scan to update
 * @param {object} updates - Fields to update
 * @param {string} [updates.notes] - User notes
 * @param {string[]} [updates.tags] - User tags
 * @param {boolean} [updates.isFavorite] - Favorite status
 * @param {string} [updates.title] - Product title
 * @param {string} [updates.brand] - Product brand
 * @param {string} [updates.description] - Product description
 * @param {string} [updates.imageUrl] - Product image URL
 * @param {Date|string|number} [updates.expirationDate] - Expiration date
 * @returns {Promise<{error: null|Error}>}
 */
export async function updateScan(scanId, updates) {
  const userId = getUserId();

  if (!isFirebaseConfigured() || !db || !userId || !scanId) {
    log.warn('Cannot update scan: Firebase not configured or invalid scanId');
    return { error: new Error('Firebase not configured or invalid scanId') };
  }

  try {
    const scanRef = doc(db, SCANS_COLLECTION, scanId);
    const updateData = {
      updatedAt: Timestamp.now()
    };

    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.isFavorite !== undefined) updateData.isFavorite = updates.isFavorite;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.brand !== undefined) updateData.brand = updates.brand;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;

    if (updates.expirationDate !== undefined) {
      let expirationDate = null;
      if (updates.expirationDate) {
        if (updates.expirationDate instanceof Date) {
          expirationDate = Timestamp.fromDate(updates.expirationDate);
        } else if (typeof updates.expirationDate === 'string') {
          expirationDate = Timestamp.fromDate(new Date(updates.expirationDate));
        } else if (typeof updates.expirationDate === 'number') {
          expirationDate = Timestamp.fromMillis(updates.expirationDate);
        }
      }
      updateData.expirationDate = expirationDate;
    }

    await updateDoc(scanRef, updateData);
    log.info('Scan updated:', { scanId, updates });
    return { error: null };
  } catch (error) {
    log.error('Error updating scan:', error);
    return { error };
  }
}

/**
 * Generate a unique session ID for bulk scanning
 * @returns {string} Session ID
 */
export function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get scans filtered by various criteria
 * @param {object} filters - Filter criteria
 * @param {string} [filters.search] - Search term (searches title, brand, description, barcode)
 * @param {boolean} [filters.expiredOnly] - Only expired items
 * @param {number} [filters.expiringInDays] - Items expiring within X days
 * @param {string} [filters.dateRange] - 'today', 'week', 'month'
 * @param {boolean} [filters.favoritesOnly] - Only favorited items
 * @param {string[]} [filters.tags] - Filter by tags
 * @param {string} [filters.sortBy] - 'expiration', 'date', 'name'
 * @param {string} [filters.sortOrder] - 'asc' or 'desc'
 * @param {number} [maxResults=500] - Maximum results
 * @returns {Promise<{error: null|Error, scans: Array}>}
 */
export async function getFilteredScans(filters = {}, maxResults = 500) {
  const { error, scans } = await getUserScans(maxResults);

  if (error) {
    return { error, scans: [] };
  }

  let filtered = [...scans];

  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(scan => {
      return (
        (scan.title || '').toLowerCase().includes(searchTerm) ||
        (scan.brand || '').toLowerCase().includes(searchTerm) ||
        (scan.description || '').toLowerCase().includes(searchTerm) ||
        (scan.value || '').toLowerCase().includes(searchTerm) ||
        (scan.notes || '').toLowerCase().includes(searchTerm)
      );
    });
  }

  // Expired filter
  if (filters.expiredOnly) {
    const now = new Date();
    filtered = filtered.filter(scan => {
      if (!scan.expirationDate) return false;
      return scan.expirationDate < now;
    });
  }

  // Expiring soon filter
  if (filters.expiringInDays !== undefined) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + filters.expiringInDays * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(scan => {
      if (!scan.expirationDate) return false;
      const expDate = scan.expirationDate;
      return expDate >= now && expDate <= futureDate;
    });
  }

  // Date range filter
  if (filters.dateRange) {
    const now = new Date();
    let startDate = new Date(0);

    switch (filters.dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    filtered = filtered.filter(scan => {
      return scan.scannedAt >= startDate;
    });
  }

  // Favorites filter
  if (filters.favoritesOnly) {
    filtered = filtered.filter(scan => scan.isFavorite === true);
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(scan => {
      if (!scan.tags || scan.tags.length === 0) return false;
      return filters.tags.some(tag => scan.tags.includes(tag));
    });
  }

  // Sorting
  const sortBy = filters.sortBy || 'date';
  const sortOrder = filters.sortOrder || 'desc';

  filtered.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'expiration':
        const aExp = a.expirationDate ? a.expirationDate.getTime() : Infinity;
        const bExp = b.expirationDate ? b.expirationDate.getTime() : Infinity;
        comparison = aExp - bExp;
        break;
      case 'name':
        const aName = (a.title || a.value || '').toLowerCase();
        const bName = (b.title || b.value || '').toLowerCase();
        comparison = aName.localeCompare(bName);
        break;
      case 'date':
      default:
        comparison = a.scannedAt.getTime() - b.scannedAt.getTime();
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return { error: null, scans: filtered };
}

/**
 * Export scans as CSV
 * @param {Array} scans - Array of scan objects
 * @returns {string} CSV string
 */
export function exportScansToCSV(scans) {
  const headers = [
    'Name',
    'Barcode',
    'Brand',
    'Description',
    'Expiration Date',
    'Scanned At',
    'Notes',
    'Tags',
    'Favorite',
    'Image URL'
  ];

  const rows = scans.map(scan => {
    return [
      scan.title || scan.value || '',
      scan.value || '',
      scan.brand || '',
      scan.description || '',
      scan.expirationDate ? scan.expirationDate.toLocaleDateString() : '',
      scan.scannedAt ? scan.scannedAt.toLocaleString() : '',
      scan.notes || '',
      (scan.tags || []).join('; '),
      scan.isFavorite ? 'Yes' : 'No',
      scan.imageUrl || ''
    ].map(field => {
      // Escape quotes and wrap in quotes if contains comma or newline
      const str = String(field);
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
  });

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
