import '@georapbox/a-tab-group/dist/a-tab-group.js';
import '@georapbox/web-share-element/dist/web-share-defined.js';
import '@georapbox/files-dropzone-element/dist/files-dropzone-defined.js';
import '@georapbox/resize-observer-element/dist/resize-observer-defined.js';
import '@georapbox/modal-element/dist/modal-element-defined.js';
import '@georapbox/alert-element/dist/alert-element-defined.js';
import { ACCEPTED_MIME_TYPES } from './constants.js';
import { getSettings, setSettings } from './services/storage.js';
import { debounce } from './utils/debounce.js';
import { log } from './utils/log.js';
import { isDialogElementSupported } from './utils/isDialogElementSupported.js';
import { createResult } from './helpers/result.js';
import { triggerScanEffects } from './helpers/triggerScanEffects.js';
import { resizeScanFrame } from './helpers/resizeScanFrame.js';
import { BarcodeReader } from './helpers/BarcodeReader.js';
import { fetchItemInfo } from './helpers/fetchItemInfo.js';
import { findProductImage } from './services/image-search.js';
import { toggleTorchButtonStatus } from './helpers/toggleTorchButtonStatus.js';
import { toastify } from './helpers/toastify.js';
import { VideoCapture } from './components/video-capture.js';
import './components/clipboard-copy.js';
import './components/bs-result.js';
import './components/bs-settings.js';
import './components/bs-history.js';
import './components/bs-auth.js';
import { initAuth } from './services/firebase-auth.js';
import { initFirestore, saveScan, syncPendingScans } from './services/firebase-scans.js';
import { isFirebaseConfigured, initFirebaseRuntime } from './services/firebase-config.js';

(async function () {
  // Initialize Firebase Authentication and Firestore
  try {
    // If a runtime config was injected into `window.__FIREBASE_CONFIG__`, initialize Firebase now.
    try {
      initFirebaseRuntime();
    } catch (_e) {
      /* ignore */
    }
    if (isFirebaseConfigured()) {
      log.info('Initializing Firebase...');
      await initFirestore();

      // Initialize auth
      const user = await initAuth();
      if (!user) {
        log.info('No user signed in. App will work in local-only mode for scanning.');
      }

      // Sync any pending scans from offline mode
      const { syncedCount } = await syncPendingScans();
      if (syncedCount > 0) {
        toastify(`Synced ${syncedCount} scans from offline mode`, { variant: 'success' });
      }

      // Listen for online/offline events
      window.addEventListener('online', async () => {
        log.info('Back online, syncing pending scans...');
        const { syncedCount } = await syncPendingScans();
        if (syncedCount > 0) {
          toastify(`Synced ${syncedCount} scans`, { variant: 'success' });
        }
      });

      window.addEventListener('offline', () => {
        log.info('Offline mode - scans will be saved locally');
        toastify('Offline mode - scans will sync when online', { variant: 'warning' });
      });
    } else {
      log.info('Firebase not configured - using local storage only');
    }
  } catch (error) {
    log.error('Error initializing Firebase:', error);
    toastify('Running in offline mode', { variant: 'warning' });
  }

  const tabGroupEl = document.querySelector('a-tab-group');
  const videoCaptureEl = document.querySelector('video-capture');
  const bsSettingsEl = document.querySelector('bs-settings');
  const bsHistoryEl = document.querySelector('bs-history');
  const cameraPanel = document.getElementById('cameraPanel');
  const cameraResultsEl = cameraPanel?.querySelector('.results');
  const filePanel = document.getElementById('filePanel');
  const fileResultsEl = filePanel?.querySelector('.results');
  const scanInstructionsEl = document.getElementById('scanInstructions');
  const scanBtn = document.getElementById('scanBtn');
  const dropzoneEl = document.getElementById('dropzone');
  const resizeObserverEl = document.querySelector('resize-observer');
  const scanFrameEl = document.getElementById('scanFrame');
  const torchButton = document.getElementById('torchButton');
  const globalActionsEl = document.getElementById('globalActions');
  const authBtn = document.getElementById('authBtn');
  const authDialog = document.getElementById('authDialog');
  const historyBtn = document.getElementById('historyBtn');
  const historyDialog = document.getElementById('historyDialog');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsDialog = document.getElementById('settingsDialog');
  const settingsForm = document.getElementById('settingsForm');
  const cameraSelect = document.getElementById('cameraSelect');

  // Check if required elements exist, if not, wait and retry
  if (!cameraPanel || !filePanel || !tabGroupEl || !videoCaptureEl) {
    log.warn(
      'Scanner elements not found, scanner module will initialize when elements are available'
    );
    // Return early - the scanner will be reinitialized when elements are available
    return;
  }
  // Reduced scan rate for faster, more responsive barcode detection
  const SCAN_RATE_LIMIT = 200; // Reduced from 1000ms to 200ms for much faster detection
  let scanTimeoutId = null;
  let scanAnimationFrameId = null;
  let shouldScan = true;
  let isScanning = false;

  // By default the dialog elements are hidden for browsers that don't support the dialog element.
  // If the dialog element is supported, we remove the hidden attribute and the dialogs' visibility
  // is controlled by using the `showModal()` and `close()` methods.
  if (isDialogElementSupported()) {
    globalActionsEl?.removeAttribute('hidden');
    authDialog?.removeAttribute('hidden');
    historyDialog?.removeAttribute('hidden');
    settingsDialog?.removeAttribute('hidden');
  }

  const { barcodeReaderError } = await BarcodeReader.setup();

  if (barcodeReaderError) {
    const alertEl = document.getElementById('barcodeReaderError');

    shouldScan = false;
    globalActionsEl?.setAttribute('hidden', '');
    tabGroupEl?.setAttribute('hidden', '');
    alertEl?.setAttribute('open', '');

    return; // Stop the script execution as BarcodeDetector API is not supported.
  }

  const supportedBarcodeFormats = await BarcodeReader.getSupportedFormats();
  const [, settings] = await getSettings();
  const intitialFormats = settings?.formats || supportedBarcodeFormats;
  let barcodeReader = await BarcodeReader.create(intitialFormats);

  if (videoCaptureEl) {
    videoCaptureEl.addEventListener('video-capture:video-play', handleVideoCapturePlay, {
      once: true
    });

    videoCaptureEl.addEventListener('video-capture:error', handleVideoCaptureError, {
      once: true
    });
  }

  VideoCapture.defineCustomElement();

  /**
   * Render the fetched item details inside the provided tab panel.
   * Creates or updates a container with id `itemInfo` inside the panel.
   * @param {HTMLElement} panelEl
   * @param {Object} info
   */
  function renderItemDetails(panelEl, info) {
    if (!panelEl || !info) {
      return;
    }

    let itemInfoEl = panelEl.querySelector('#itemInfo');
    if (!itemInfoEl) {
      itemInfoEl = document.createElement('div');
      itemInfoEl.id = 'itemInfo';
      itemInfoEl.className = 'item-info';
      // Insert after the results element if present, otherwise append
      const resultsEl = panelEl.querySelector('.results');
      if (resultsEl && resultsEl.parentNode) {
        resultsEl.parentNode.insertBefore(itemInfoEl, resultsEl.nextSibling);
      } else {
        panelEl.appendChild(itemInfoEl);
      }
    }

    // Clear existing content
    itemInfoEl.textContent = '';

    // Add search box at the top
    const searchContainer = document.createElement('div');
    searchContainer.className = 'item-info__search-container';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'item-info__search-input';
    searchInput.placeholder = '🔍 Search product details...';
    searchInput.setAttribute('aria-label', 'Search product information');

    // Add search icon
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'item-info__search-wrapper';
    searchWrapper.innerHTML = `
      <svg class="item-info__search-icon" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
      </svg>
    `;
    searchWrapper.appendChild(searchInput);

    // Add clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'item-info__search-clear';
    clearBtn.innerHTML = '×';
    clearBtn.setAttribute('aria-label', 'Clear search');
    clearBtn.style.display = 'none';

    searchWrapper.appendChild(clearBtn);
    searchContainer.appendChild(searchWrapper);
    itemInfoEl.appendChild(searchContainer);

    // Create content container for searchable content
    const contentContainer = document.createElement('div');
    contentContainer.className = 'item-info__content';

    // Add product image with enhanced image search
    const imageContainer = document.createElement('div');
    imageContainer.className = 'item-info__image-container';
    const img = document.createElement('img');
    img.className = 'item-info__image';
    img.alt = info.title || 'Product image';
    img.loading = 'lazy';

    // Show loading state
    imageContainer.innerHTML = `
      <div class="item-info__image-loading">
        <div class="loading-spinner"></div>
        <p>Loading product image...</p>
      </div>
    `;
    contentContainer.appendChild(imageContainer);

    // Try to find product image - use API image first, then search if needed
    (async () => {
      try {
        const productName = info.title || info.name || '';
        const brand = info.brand || '';
        let imageUrl = null;

        // Check multiple possible image fields from API response
        const possibleImageFields = [
          info.image,
          info.image_url,
          info.imageUrl,
          info.images?.[0],
          info.images?.[1],
          info.metadata?.image,
          info.metadata?.image_url,
          info.metadata?.images?.[0],
          info.product_image,
          info.productImage
        ];

        // Find first valid image URL
        for (const field of possibleImageFields) {
          if (field && typeof field === 'string' && field.trim()) {
            try {
              const url = new URL(field);
              if (url.protocol === 'http:' || url.protocol === 'https:') {
                imageUrl = field;
                log.info('Using image from API response:', imageUrl);
                break;
              }
            } catch {
              // Not a valid URL, continue checking other fields
              continue;
            }
          }
        }

        // If no image from API, search for one
        if (!imageUrl) {
          log.info('No image from API, searching for product image...');
          const imagePromise = findProductImage(productName, brand, '');

          // Set a timeout to show image or placeholder
          const timeoutId = setTimeout(() => {
            if (imageContainer.querySelector('.item-info__image-loading')) {
              const loadingEl = imageContainer.querySelector('.item-info__image-loading p');
              if (loadingEl) {
                loadingEl.textContent = 'Searching for product image...';
              }
            }
          }, 2000);

          imageUrl = await imagePromise;
          clearTimeout(timeoutId);
        }

        // Always search for image if not found from API
        if (!imageUrl) {
          log.info('No image from API, searching for product image...');
          imageUrl = await findProductImage(productName, brand, '');
        }

        // Always show image container (even with placeholder)
        imageContainer.style.display = 'flex';

        if (imageUrl) {
          img.src = imageUrl;
          img.alt = productName ? `${productName} product image` : 'Product image';
          img.loading = 'lazy';

          img.onerror = async () => {
            log.warn('Image failed to load:', imageUrl);
            // If image fails, try to find another one
            try {
              const fallbackUrl = await findProductImage(productName, brand, '');
              if (fallbackUrl && fallbackUrl !== imageUrl) {
                log.info('Trying fallback image:', fallbackUrl);
                img.src = fallbackUrl;
                // If fallback also fails, show placeholder
                img.onerror = () => {
                  log.warn('Fallback image also failed, showing placeholder');
                  img.src = `https://via.placeholder.com/600x400/7ED957/1a2e11?text=${encodeURIComponent(productName || 'Product')}`;
                  img.onerror = null; // Prevent infinite loop
                };
              } else {
                // Use placeholder if no fallback
                img.src = `https://via.placeholder.com/600x400/7ED957/1a2e11?text=${encodeURIComponent(productName || 'Product')}`;
                img.onerror = null;
              }
            } catch (err) {
              log.warn('Fallback image search failed:', err);
              // Show placeholder instead of hiding
              img.src = `https://via.placeholder.com/600x400/7ED957/1a2e11?text=${encodeURIComponent(productName || 'Product')}`;
              img.onerror = null;
            }
          };

          img.onload = () => {
            // Replace loading state with image
            const loadingEl = imageContainer.querySelector('.item-info__image-loading');
            if (loadingEl) {
              loadingEl.style.display = 'none';
            }
            imageContainer.appendChild(img);
            img.style.opacity = '0';
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.maxHeight = '400px';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '16px';
            setTimeout(() => {
              img.style.transition = 'opacity 0.5s ease';
              img.style.opacity = '1';
            }, 10);
          };
        } else {
          // Even if no image found, show placeholder
          log.warn('No image URL found, showing placeholder');
          const placeholderImg = document.createElement('img');
          placeholderImg.src = `https://via.placeholder.com/600x400/7ED957/1a2e11?text=${encodeURIComponent(productName || 'Product')}`;
          placeholderImg.alt = productName ? `${productName} product image` : 'Product image';
          placeholderImg.className = 'item-info__image';
          placeholderImg.style.width = '100%';
          placeholderImg.style.height = 'auto';
          placeholderImg.style.maxHeight = '400px';
          placeholderImg.style.objectFit = 'contain';
          placeholderImg.style.borderRadius = '16px';
          const loadingEl = imageContainer.querySelector('.item-info__image-loading');
          if (loadingEl) {
            loadingEl.style.display = 'none';
          }
          imageContainer.appendChild(placeholderImg);
        }
      } catch (err) {
        log.warn('Failed to load product image:', err);
        imageContainer.style.display = 'none';
      }
    })();

    // Header section with title and badges
    const headerSection = document.createElement('div');
    headerSection.className = 'item-info__header';

    const title = document.createElement('h3');
    title.className = 'item-info__title';
    title.textContent = info.title || info.name || info.alias || '';
    title.setAttribute('data-searchable', 'true');

    // Add source badge
    if (info.metadata?.source) {
      const sourceBadge = document.createElement('span');
      sourceBadge.className = 'item-info__source-badge';
      sourceBadge.textContent = `📡 ${info.metadata.source}`;
      headerSection.appendChild(sourceBadge);
    }

    headerSection.appendChild(title);
    contentContainer.appendChild(headerSection);

    // Brand with icon
    if (info.brand) {
      const brandContainer = document.createElement('div');
      brandContainer.className = 'item-info__brand-container';
      const brandIcon = document.createElement('span');
      brandIcon.className = 'item-info__brand-icon';
      brandIcon.textContent = '🏷️';
      const brand = document.createElement('span');
      brand.className = 'item-info__brand';
      brand.textContent = info.brand;
      brand.setAttribute('data-searchable', 'true');
      brandContainer.appendChild(brandIcon);
      brandContainer.appendChild(brand);
      contentContainer.appendChild(brandContainer);
    }

    // Description
    if (info.description) {
      const desc = document.createElement('p');
      desc.className = 'item-info__description';
      desc.textContent = info.description;
      desc.setAttribute('data-searchable', 'true');
      contentContainer.appendChild(desc);
    }

    // Add metadata if available - enhanced with expandable sections
    const metadata = document.createElement('div');
    metadata.className = 'item-info__metadata';

    if (info.metadata) {
      // Categories with icon
      if (info.metadata.categories) {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'item-info__metadata-item';
        const categoryIcon = document.createElement('span');
        categoryIcon.className = 'item-info__metadata-icon';
        categoryIcon.textContent = '📂';
        const categoryLabel = document.createElement('span');
        categoryLabel.className = 'item-info__metadata-label';
        categoryLabel.textContent = 'Categories:';
        const categoryValue = document.createElement('span');
        categoryValue.className = 'item-info__categories';
        categoryValue.textContent = info.metadata.categories;
        categoryValue.setAttribute('data-searchable', 'true');
        categoryItem.appendChild(categoryIcon);
        categoryItem.appendChild(categoryLabel);
        categoryItem.appendChild(categoryValue);
        metadata.appendChild(categoryItem);
      }

      // Ingredients with expandable section
      if (info.metadata.ingredients) {
        const ingredientsItem = document.createElement('div');
        ingredientsItem.className = 'item-info__metadata-item item-info__metadata-expandable';
        const ingredientsHeader = document.createElement('div');
        ingredientsHeader.className = 'item-info__metadata-header';
        const ingredientsIcon = document.createElement('span');
        ingredientsIcon.className = 'item-info__metadata-icon';
        ingredientsIcon.textContent = '🥘';
        const ingredientsLabel = document.createElement('span');
        ingredientsLabel.className = 'item-info__metadata-label';
        ingredientsLabel.textContent = 'Ingredients:';
        const expandBtn = document.createElement('button');
        expandBtn.className = 'item-info__expand-btn';
        expandBtn.innerHTML = '▲'; // Start with up arrow since it's expanded by default
        expandBtn.setAttribute('aria-label', 'Collapse ingredients');

        const ingredientsContent = document.createElement('div');
        ingredientsContent.className = 'item-info__metadata-content';
        ingredientsContent.style.display = 'block'; // Show by default
        const ingredients = document.createElement('p');
        ingredients.className = 'item-info__ingredients';
        ingredients.textContent = info.metadata.ingredients;
        ingredients.setAttribute('data-searchable', 'true');
        ingredientsContent.appendChild(ingredients);

        expandBtn.onclick = () => {
          const isExpanded = ingredientsContent.style.display !== 'none';
          ingredientsContent.style.display = isExpanded ? 'none' : 'block';
          expandBtn.innerHTML = isExpanded ? '▼' : '▲';
          expandBtn.setAttribute(
            'aria-label',
            isExpanded ? 'Expand ingredients' : 'Collapse ingredients'
          );
        };

        ingredientsHeader.appendChild(ingredientsIcon);
        ingredientsHeader.appendChild(ingredientsLabel);
        ingredientsHeader.appendChild(expandBtn);
        ingredientsItem.appendChild(ingredientsHeader);
        ingredientsItem.appendChild(ingredientsContent);
        metadata.appendChild(ingredientsItem);
      }

      // Nutrition grade if available
      if (info.metadata.nutrition_grade) {
        const nutritionItem = document.createElement('div');
        nutritionItem.className = 'item-info__metadata-item';
        const nutritionIcon = document.createElement('span');
        nutritionIcon.className = 'item-info__metadata-icon';
        nutritionIcon.textContent = '⭐';
        const nutritionLabel = document.createElement('span');
        nutritionLabel.className = 'item-info__metadata-label';
        nutritionLabel.textContent = 'Nutrition Grade:';
        const nutritionValue = document.createElement('span');
        nutritionValue.className = 'item-info__nutrition-grade';
        nutritionValue.textContent = info.metadata.nutrition_grade.toUpperCase();
        nutritionItem.appendChild(nutritionIcon);
        nutritionItem.appendChild(nutritionLabel);
        nutritionItem.appendChild(nutritionValue);
        metadata.appendChild(nutritionItem);
      }

      // Quantity if available
      if (info.metadata.quantity) {
        const quantityItem = document.createElement('div');
        quantityItem.className = 'item-info__metadata-item';
        const quantityIcon = document.createElement('span');
        quantityIcon.className = 'item-info__metadata-icon';
        quantityIcon.textContent = '📦';
        const quantityLabel = document.createElement('span');
        quantityLabel.className = 'item-info__metadata-label';
        quantityLabel.textContent = 'Quantity:';
        const quantityValue = document.createElement('span');
        quantityValue.className = 'item-info__quantity';
        quantityValue.textContent = info.metadata.quantity;
        quantityItem.appendChild(quantityIcon);
        quantityItem.appendChild(quantityLabel);
        quantityItem.appendChild(quantityValue);
        metadata.appendChild(quantityItem);
      }

      // Manufacturer if available
      if (info.metadata.manufacturer) {
        const manufacturerItem = document.createElement('div');
        manufacturerItem.className = 'item-info__metadata-item';
        const manufacturerIcon = document.createElement('span');
        manufacturerIcon.className = 'item-info__metadata-icon';
        manufacturerIcon.textContent = '🏭';
        const manufacturerLabel = document.createElement('span');
        manufacturerLabel.className = 'item-info__metadata-label';
        manufacturerLabel.textContent = 'Manufacturer:';
        const manufacturerValue = document.createElement('span');
        manufacturerValue.className = 'item-info__manufacturer';
        manufacturerValue.textContent = info.metadata.manufacturer;
        manufacturerValue.setAttribute('data-searchable', 'true');
        manufacturerItem.appendChild(manufacturerIcon);
        manufacturerItem.appendChild(manufacturerLabel);
        manufacturerItem.appendChild(manufacturerValue);
        metadata.appendChild(manufacturerItem);
      }
    }

    // Add expiration date input section
    const expirationSection = document.createElement('div');
    expirationSection.className = 'item-info__expiration-section';
    const expirationLabel = document.createElement('label');
    expirationLabel.className = 'item-info__expiration-label';
    expirationLabel.innerHTML =
      '<span class="item-info__expiration-icon">⏰</span> Expiration Date:';

    const expirationInputWrapper = document.createElement('div');
    expirationInputWrapper.className = 'item-info__expiration-input-wrapper';

    const expirationInput = document.createElement('input');
    expirationInput.type = 'date';
    expirationInput.className = 'item-info__expiration-input';
    expirationInput.setAttribute('aria-label', 'Product expiration date');

    // Set minimum date to today
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    expirationInput.min = tomorrow.toISOString().split('T')[0];

    // Calculate and display days until expiration
    const expirationDisplay = document.createElement('div');
    expirationDisplay.className = 'item-info__expiration-display';

    const updateExpirationDisplay = () => {
      if (expirationInput.value) {
        const expirationDate = new Date(expirationInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expirationDate.setHours(0, 0, 0, 0);

        const diffTime = expirationDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          expirationDisplay.innerHTML = `<span class="expiration-badge expiration-expired">⚠️ Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago</span>`;
        } else if (diffDays === 0) {
          expirationDisplay.innerHTML = `<span class="expiration-badge expiration-today">⚠️ Expires today!</span>`;
        } else if (diffDays <= 3) {
          expirationDisplay.innerHTML = `<span class="expiration-badge expiration-soon">⚠️ Expires in ${diffDays} day${diffDays !== 1 ? 's' : ''}</span>`;
        } else if (diffDays <= 7) {
          expirationDisplay.innerHTML = `<span class="expiration-badge expiration-warning">Expires in ${diffDays} day${diffDays !== 1 ? 's' : ''}</span>`;
        } else {
          expirationDisplay.innerHTML = `<span class="expiration-badge expiration-good">✓ ${diffDays} day${diffDays !== 1 ? 's' : ''} until expiration</span>`;
        }
        expirationDisplay.style.display = 'block';
      } else {
        expirationDisplay.style.display = 'none';
      }
    };

    expirationInput.addEventListener('change', async () => {
      updateExpirationDisplay();
      // Save expiration date to the scan
      if (expirationInput.value) {
        try {
          // Get the barcode value from info (stored when scan was processed)
          const barcodeValue = info.barcode || info.value || '';
          if (barcodeValue) {
            // Update the scan with expiration date
            const { updateScanExpiration } = await import('./services/firebase-scans.js');
            if (updateScanExpiration) {
              await updateScanExpiration(barcodeValue, expirationInput.value);
              log.info('Expiration date saved:', expirationInput.value);
            }
          }
        } catch (err) {
          log.warn('Failed to save expiration date:', err);
        }
      }
    });

    expirationInputWrapper.appendChild(expirationInput);
    expirationInputWrapper.appendChild(expirationDisplay);
    expirationSection.appendChild(expirationLabel);
    expirationSection.appendChild(expirationInputWrapper);
    contentContainer.appendChild(expirationSection);

    // Add action buttons (Copy, Share, Save, View Online)
    const actions = document.createElement('div');
    actions.className = 'item-info__actions';

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'item-info__action-btn item-info__copy-btn';
    const copySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    copySvg.setAttribute('width', '18');
    copySvg.setAttribute('height', '18');
    copySvg.setAttribute('fill', 'currentColor');
    copySvg.setAttribute('viewBox', '0 0 16 16');
    const copyPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    copyPath1.setAttribute(
      'd',
      'M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1V14a1 1 0 0 1-1H3a1 1 0 0 1-1V3.5a1 1 0 0 1 1h1v-1z'
    );
    const copyPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    copyPath2.setAttribute(
      'd',
      'M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z'
    );
    copySvg.appendChild(copyPath1);
    copySvg.appendChild(copyPath2);
    const copySpan = document.createElement('span');
    copySpan.textContent = 'Copy';
    copyBtn.appendChild(copySvg);
    copyBtn.appendChild(copySpan);
    copyBtn.onclick = () => {
      const textToCopy = `${info.title || ''}\n${info.brand ? `Brand: ${info.brand}\n` : ''}${info.description || ''}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        const span = copyBtn.querySelector('span');
        if (span) {
          span.textContent = 'Copied!';
        }
        copyBtn.style.background = 'var(--success-color)';
        copyBtn.style.color = 'white';
        setTimeout(() => {
          if (span) {
            span.textContent = 'Copy';
          }
          copyBtn.style.background = '';
          copyBtn.style.color = '';
        }, 2000);
      });
    };
    actions.appendChild(copyBtn);

    // Share button (if Web Share API is available)
    if (navigator.share) {
      const shareBtn = document.createElement('button');
      shareBtn.className = 'item-info__action-btn item-info__share-btn';
      const shareSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      shareSvg.setAttribute('width', '18');
      shareSvg.setAttribute('height', '18');
      shareSvg.setAttribute('fill', 'currentColor');
      shareSvg.setAttribute('viewBox', '0 0 16 16');
      const sharePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      sharePath.setAttribute(
        'd',
        'M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z'
      );
      shareSvg.appendChild(sharePath);
      const shareSpan = document.createElement('span');
      shareSpan.textContent = 'Share';
      shareBtn.appendChild(shareSvg);
      shareBtn.appendChild(shareSpan);
      shareBtn.onclick = async () => {
        try {
          await navigator.share({
            title: info.title || 'Product Information',
            text: `${info.title || ''}\n${info.brand ? `Brand: ${info.brand}\n` : ''}${info.description || ''}`,
            url: window.location.href
          });
        } catch {
          // User cancelled or error
        }
      };
      actions.appendChild(shareBtn);
    }

    // Save to favorites button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'item-info__action-btn item-info__save-btn';
    const saveSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    saveSvg.setAttribute('width', '18');
    saveSvg.setAttribute('height', '18');
    saveSvg.setAttribute('fill', 'currentColor');
    saveSvg.setAttribute('viewBox', '0 0 16 16');
    const savePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    savePath.setAttribute(
      'd',
      'm8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z'
    );
    saveSvg.appendChild(savePath);
    const saveSpan = document.createElement('span');
    saveSpan.textContent = 'Save';
    saveBtn.appendChild(saveSvg);
    saveBtn.appendChild(saveSpan);
    saveBtn.onclick = () => {
      // Toggle save state
      const isSaved = saveBtn.classList.contains('item-info__save-btn--saved');
      const svg = saveBtn.querySelector('svg');
      const span = saveBtn.querySelector('span');

      if (!svg) {
        log.warn('Save button SVG not found');
        return;
      }

      if (isSaved) {
        saveBtn.classList.remove('item-info__save-btn--saved');
        // Replace entire SVG path to avoid path attribute errors
        const path = svg.querySelector('path');
        if (path) {
          path.setAttribute(
            'd',
            'm8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z'
          );
        } else {
          svg.innerHTML =
            '<path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>';
        }
        if (span) {
          span.textContent = 'Save';
        }
      } else {
        saveBtn.classList.add('item-info__save-btn--saved');
        // Replace entire SVG path to avoid path attribute errors
        const path = svg.querySelector('path');
        if (path) {
          path.setAttribute(
            'd',
            'M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z'
          );
        } else {
          svg.innerHTML =
            '<path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>';
        }
        if (span) {
          span.textContent = 'Saved';
        }
      }
    };
    actions.appendChild(saveBtn);

    // View online button (if we have a product URL or can construct one)
    const viewOnlineBtn = document.createElement('button');
    viewOnlineBtn.className = 'item-info__action-btn item-info__view-btn';
    const viewSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    viewSvg.setAttribute('width', '18');
    viewSvg.setAttribute('height', '18');
    viewSvg.setAttribute('fill', 'currentColor');
    viewSvg.setAttribute('viewBox', '0 0 16 16');
    const viewPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    viewPath1.setAttribute('fill-rule', 'evenodd');
    viewPath1.setAttribute(
      'd',
      'M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z'
    );
    const viewPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    viewPath2.setAttribute('fill-rule', 'evenodd');
    viewPath2.setAttribute(
      'd',
      'M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z'
    );
    viewSvg.appendChild(viewPath1);
    viewSvg.appendChild(viewPath2);
    const viewSpan = document.createElement('span');
    viewSpan.textContent = 'View Online';
    viewOnlineBtn.appendChild(viewSvg);
    viewOnlineBtn.appendChild(viewSpan);
    viewOnlineBtn.onclick = () => {
      // Try to find product URL or search online
      const searchQuery = encodeURIComponent(`${info.title} ${info.brand || ''}`.trim());
      const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    };
    actions.appendChild(viewOnlineBtn);

    // Add all content to content container
    // Title is already in headerSection which is already added
    // Description and brand are already added conditionally above
    if (metadata.children.length > 0) {
      contentContainer.appendChild(metadata);
    }
    contentContainer.appendChild(actions);

    // Add content container to main element
    itemInfoEl.appendChild(contentContainer);

    // Add search functionality
    let searchTimeout;
    searchInput.addEventListener('input', e => {
      clearTimeout(searchTimeout);
      const query = e.target.value.toLowerCase().trim();

      if (query) {
        clearBtn.style.display = 'block';
      } else {
        clearBtn.style.display = 'none';
      }

      // Debounce search for better performance
      searchTimeout = setTimeout(() => {
        const searchableElements = contentContainer.querySelectorAll('[data-searchable="true"]');
        const metadataItems = contentContainer.querySelectorAll('.item-info__metadata-item');
        let hasMatches = false;

        // Search in searchable elements
        searchableElements.forEach(el => {
          const text = el.textContent.toLowerCase();
          if (text.includes(query)) {
            // Show parent containers
            let parent = el.closest(
              '.item-info__brand-container, .item-info__description, .item-info__metadata-item'
            );
            if (parent) {
              parent.style.display = '';
            } else {
              el.style.display = '';
            }
            el.style.backgroundColor = '';
            hasMatches = true;
            // Highlight matching text
            if (query.length > 2) {
              highlightText(el, query);
            }
          } else {
            // Hide if no match, but check if parent should stay visible
            const parent = el.closest('.item-info__brand-container, .item-info__description');
            if (
              parent &&
              !parent
                .querySelector('[data-searchable="true"]')
                ?.textContent.toLowerCase()
                .includes(query)
            ) {
              parent.style.display = 'none';
            } else if (!parent) {
              el.style.display = 'none';
            }
          }
        });

        // Also search in metadata items
        metadataItems.forEach(item => {
          const text = item.textContent.toLowerCase();
          if (text.includes(query)) {
            item.style.display = '';
            hasMatches = true;
          } else {
            // Don't hide expandable items, just their content
            if (!item.classList.contains('item-info__metadata-expandable')) {
              item.style.display = 'none';
            }
          }
        });

        // Show/hide "no results" message
        let noResultsMsg = contentContainer.querySelector('.item-info__no-results');
        if (!hasMatches && query) {
          if (!noResultsMsg) {
            noResultsMsg = document.createElement('p');
            noResultsMsg.className = 'item-info__no-results';
            noResultsMsg.textContent = '🔍 No matching information found.';
            contentContainer.appendChild(noResultsMsg);
          }
        } else if (noResultsMsg) {
          noResultsMsg.remove();
        }
      }, 200);
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      const searchableElements = contentContainer.querySelectorAll('[data-searchable="true"]');
      const allElements = contentContainer.querySelectorAll(
        '.item-info__brand-container, .item-info__description, .item-info__metadata-item'
      );

      // Show all elements
      allElements.forEach(el => {
        el.style.display = '';
      });

      searchableElements.forEach(el => {
        el.style.display = '';
        el.style.backgroundColor = '';
        // Remove highlights
        if (el.querySelector('.search-highlight')) {
          const text = el.textContent;
          el.textContent = text;
        }
      });

      const noResultsMsg = contentContainer.querySelector('.item-info__no-results');
      if (noResultsMsg) {
        noResultsMsg.remove();
      }
      searchInput.focus();
    });

    // Helper function to highlight matching text
    function highlightText(element, query) {
      const text = element.textContent;
      const regex = new RegExp(`(${query})`, 'gi');
      if (regex.test(text)) {
        const highlighted = text.replace(regex, '<mark class="search-highlight">$1</mark>');
        element.innerHTML = highlighted;
      }
    }
  }

  async function handleFetchedItemInfo(barcodeValue, panelEl, barcodeFormat = '') {
    if (!panelEl) {
      log.warn('Panel element not available for displaying item info');
      // Still save to Firebase even if panel is not available
      try {
        await saveScan({
          value: barcodeValue,
          format: barcodeFormat,
          metadata: {
            source: 'camera',
            hasProductInfo: false
          }
        });
      } catch (saveError) {
        log.warn('Error saving scan to Firestore:', saveError);
      }
      return null;
    }
    try {
      const info = await fetchItemInfo(barcodeValue);
      if (info) {
        // Add barcode value to info for expiration date tracking
        info.barcode = barcodeValue;
        info.value = barcodeValue;

        const name = info.title || info.name || info.alias || '';
        const desc = info.description || info.brand || '';
        const msg = `${name || barcodeValue}${desc ? ` — ${desc}` : ''}`;
        toastify(msg, { variant: 'success' });
        renderItemDetails(panelEl, info);

        // Also update the inline result element (bs-result) next to the scanned UPC
        try {
          const resultsContainer = panelEl?.querySelector('.results');
          if (resultsContainer) {
            const resultEl = resultsContainer.querySelector(`bs-result[value="${barcodeValue}"]`);
            if (resultEl) {
              if (info.title) {
                resultEl.setAttribute('data-title', info.title);
              }
              if (info.brand) {
                resultEl.setAttribute('data-brand', info.brand);
              }
              if (info.description) {
                resultEl.setAttribute('data-description', info.description);
              }
            }
          }
        } catch (_e) {
          // non-fatal
        }

        // Save scan to Firestore with product info
        try {
          await saveScan({
            value: barcodeValue,
            format: barcodeFormat,
            title: info.title || info.name || info.alias || '',
            brand: info.brand || '',
            description: info.description || '',
            metadata: {
              source: 'camera',
              hasProductInfo: true
            }
          });
        } catch (saveError) {
          log.warn('Error saving scan to Firestore:', saveError);
          // Non-fatal - scan is still saved to local history
        }

        return info;
      } else {
        // Save scan without product info
        try {
          await saveScan({
            value: barcodeValue,
            format: barcodeFormat,
            metadata: {
              source: 'camera',
              hasProductInfo: false
            }
          });
        } catch (saveError) {
          log.warn('Error saving scan to Firestore:', saveError);
        }
      }
    } catch {
      // ignore lookup errors but still save scan
      try {
        await saveScan({
          value: barcodeValue,
          format: barcodeFormat,
          metadata: {
            source: 'camera',
            hasProductInfo: false,
            lookupFailed: true
          }
        });
      } catch (saveError) {
        log.warn('Error saving scan to Firestore:', saveError);
      }
    }
  }

  const videoCaptureShadowRoot = videoCaptureEl?.shadowRoot;
  // Make video element reference dynamic so it can be updated when video starts
  let videoCaptureVideoEl = videoCaptureShadowRoot?.querySelector('video');
  const videoCaptureActionsEl = videoCaptureShadowRoot?.querySelector('[part="actions-container"]');

  dropzoneEl.accept = ACCEPTED_MIME_TYPES.join(',');
  bsSettingsEl.supportedFormats = supportedBarcodeFormats;

  // let lastScanTime = 0;

  /**
   * Scans for barcodes.
   * If a barcode is detected, it stops scanning and displays the result.
   *
   * @returns {Promise<void>} - A Promise that resolves when the barcode is detected.
   */
  async function scan() {
    if (!shouldScan || isScanning) {
      return;
    }

    // Ensure video element is available
    if (!videoCaptureVideoEl) {
      const shadowRoot = videoCaptureEl?.shadowRoot;
      videoCaptureVideoEl = shadowRoot?.querySelector('video');
      if (!videoCaptureVideoEl) {
        // Video not ready yet, retry after a short delay
        scanTimeoutId = setTimeout(() => scan(), 100);
        return;
      }
    }

    isScanning = true;
    scanInstructionsEl?.removeAttribute('hidden');

    try {
      const [, settings] = await getSettings();
      const barcode = await barcodeReader.detect(videoCaptureVideoEl);
      const barcodeValue = barcode?.rawValue ?? '';
      const barcodeFormat = barcode?.format ?? '';

      if (!barcodeValue) {
        throw new Error('No barcode detected');
      }

      // Stop scanning immediately when barcode is detected
      isScanning = false;
      if (scanTimeoutId) {
        clearTimeout(scanTimeoutId);
        scanTimeoutId = null;
      }
      if (scanAnimationFrameId) {
        cancelAnimationFrame(scanAnimationFrameId);
        scanAnimationFrameId = null;
      }

      if (cameraResultsEl) {
        createResult(cameraResultsEl, barcodeValue);
      }

      // Attempt to fetch item info for 12-14 digit numeric barcodes
      // This will also save to Firebase and display product info
      let productInfo = null;
      if (cameraPanel) {
        productInfo = await handleFetchedItemInfo(barcodeValue, cameraPanel, barcodeFormat);
      }

      // Always save to history (not conditional on settings)
      // If product info was fetched, it's already saved to Firebase in handleFetchedItemInfo
      // But we still need to add it to local history for the UI
      try {
        await bsHistoryEl?.add(barcodeValue);
        // Open history and scroll the new item into view so countdown is visible immediately
        if (historyDialog) {
          historyDialog.open = true;
          // small timeout to allow history element to render
          setTimeout(() => {
            try {
              const li = bsHistoryEl?.shadowRoot?.querySelector(`li[data-value="${barcodeValue}"]`);
              if (li) {
                li?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                li?.classList?.add('highlight');
                setTimeout(() => li?.classList?.remove('highlight'), 2000);
              }
              // Update history item with product info if available
              if (productInfo && li) {
                if (productInfo.title) {
                  li.setAttribute('data-title', productInfo.title);
                }
                if (productInfo.brand) {
                  li.setAttribute('data-brand', productInfo.brand);
                }
                if (productInfo.description) {
                  li.setAttribute('data-description', productInfo.description);
                }
              }
            } catch (_e) {
              // ignore
            }
          }, 50);
        }
      } catch (_e) {
        // ignore
      }

      triggerScanEffects();

      // Dispatch event to notify React components that a scan was completed
      window.dispatchEvent(
        new CustomEvent('bs-scan-complete', {
          detail: { barcodeValue, barcodeFormat }
        })
      );

      // If continue scanning is enabled, resume after a brief delay
      if (settings?.continueScanning) {
        // Wait a bit before resuming to avoid re-detecting the same barcode
        setTimeout(() => {
          isScanning = false;
          // Clear previous results to allow fresh scan
          if (cameraResultsEl) {
            cameraResultsEl.innerHTML = '';
          }
          // Ensure scan frame and actions are visible
          scanFrameEl?.removeAttribute('hidden');
          videoCaptureActionsEl?.removeAttribute('hidden');
          if (shouldScan) {
            scan();
          }
        }, 1000); // 1 second delay before resuming
      } else {
        // Reset state for next scan
        isScanning = false;
        shouldScan = false;
        scanBtn?.removeAttribute('hidden');
        scanFrameEl?.setAttribute('hidden', '');
        videoCaptureActionsEl?.setAttribute('hidden', '');
      }
      return;
    } catch {
      // If no barcode is detected, the error is caught here.
      // We can ignore the error and continue scanning.
      isScanning = false;
    }

    // Continue scanning with optimized timing
    if (shouldScan) {
      // Use requestAnimationFrame for smoother, more responsive detection
      scanAnimationFrameId = requestAnimationFrame(() => {
        scanTimeoutId = setTimeout(() => scan(), SCAN_RATE_LIMIT);
      });
    }
  }

  /**
   * Handles the click event on the scan button.
   * It is responsible for clearing previous results and starting the scan process again.
   */
  function handleScanButtonClick() {
    console.log('Scan button clicked - resetting state and starting scan');
    
    // Clear any existing scan timeouts/frames
    if (scanTimeoutId) {
      clearTimeout(scanTimeoutId);
      scanTimeoutId = null;
    }
    if (scanAnimationFrameId) {
      cancelAnimationFrame(scanAnimationFrameId);
      scanAnimationFrameId = null;
    }
    
    // Reset all scan state
    isScanning = false;
    shouldScan = true;
    
    // Hide scan button and show scan UI
    scanBtn?.setAttribute('hidden', '');
    scanFrameEl?.removeAttribute('hidden');
    videoCaptureActionsEl?.removeAttribute('hidden');
    scanInstructionsEl?.removeAttribute('hidden');
    
    // Clear previous results for a fresh scan
    if (cameraResultsEl) {
      cameraResultsEl.innerHTML = '';
    }
    
    // Ensure video element is available
    const shadowRoot = videoCaptureEl?.shadowRoot;
    videoCaptureVideoEl = shadowRoot?.querySelector('video');
    
    // Start scanning immediately
    scan();
  }

  /**
   * Handles the tab show event.
   * It is responsible for starting or stopping the scan process based on the selected tab.
   *
   * @param {CustomEvent} evt - The event object.
   */
  function handleTabShow(evt) {
    const tabId = evt.detail.tabId;
    const videoCaptureEl = document.querySelector('video-capture'); // Get the latest instance of video-capture element to ensure we don't use the cached one.

    if (tabId === 'cameraTab') {
      // Clear any existing scan operations
      if (scanTimeoutId) {
        clearTimeout(scanTimeoutId);
        scanTimeoutId = null;
      }
      if (scanAnimationFrameId) {
        cancelAnimationFrame(scanAnimationFrameId);
        scanAnimationFrameId = null;
      }
      
      shouldScan = true;
      isScanning = false;

      if (!videoCaptureEl) {
        return;
      }

      if (!videoCaptureEl.loading && scanBtn?.hasAttribute('hidden')) {
        scanFrameEl?.removeAttribute('hidden');
        videoCaptureActionsEl?.removeAttribute('hidden');
        // Start scanning immediately when tab is shown
        scan();
      }

      if (typeof videoCaptureEl.startVideoStream === 'function') {
        const videoDeviceId = cameraSelect?.value || undefined;
        videoCaptureEl.startVideoStream(videoDeviceId);
      }
    } else if (tabId === 'fileTab') {
      // Stop scanning when switching to file tab
      shouldScan = false;
      isScanning = false;
      
      if (scanTimeoutId) {
        clearTimeout(scanTimeoutId);
        scanTimeoutId = null;
      }
      if (scanAnimationFrameId) {
        cancelAnimationFrame(scanAnimationFrameId);
        scanAnimationFrameId = null;
      }

      if (videoCaptureEl != null && typeof videoCaptureEl.stopVideoStream === 'function') {
        videoCaptureEl.stopVideoStream();
      }

      scanFrameEl?.setAttribute('hidden', '');
      videoCaptureActionsEl?.setAttribute('hidden', '');
    }
  }

  /**
   * Handles the selection of a file.
   * It is responsible for displaying the selected file in the dropzone.
   *
   * @param {File} file - The selected file.
   */
  async function handleFileSelect(file) {
    if (!file) {
      return;
    }

    const [, _settings] = await getSettings();
    const image = new Image();
    const reader = new FileReader();

    reader.onload = evt => {
      const data = evt.target.result;

      image.onload = async () => {
        try {
          const barcode = await barcodeReader.detect(image);
          const barcodeValue = barcode?.rawValue ?? '';
          const barcodeFormat = barcode?.format ?? '';

          if (!barcodeValue) {
            throw new Error('No barcode detected');
          }

          if (fileResultsEl) {
            createResult(fileResultsEl, barcodeValue);
          }

          // Try to fetch item info for file-scanned barcodes as well
          // This will also save to Firebase and display product info
          let productInfo = null;
          if (filePanel) {
            productInfo = await handleFetchedItemInfo(barcodeValue, filePanel, barcodeFormat);
          }

          // Always save to history (not conditional on settings)
          // If product info was fetched, it's already saved to Firebase in handleFetchedItemInfo
          // But we still need to add it to local history for the UI
          try {
            await bsHistoryEl?.add(barcodeValue);
            if (historyDialog) {
              historyDialog.open = true;
              setTimeout(() => {
                try {
                  const li = bsHistoryEl?.shadowRoot?.querySelector(
                    `li[data-value="${barcodeValue}"]`
                  );
                  if (li) {
                    li?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    li?.classList?.add('highlight');
                    setTimeout(() => li?.classList?.remove('highlight'), 2000);
                  }
                  // Update history item with product info if available
                  if (productInfo && li) {
                    if (productInfo.title) {
                      li.setAttribute('data-title', productInfo.title);
                    }
                    if (productInfo.brand) {
                      li.setAttribute('data-brand', productInfo.brand);
                    }
                    if (productInfo.description) {
                      li.setAttribute('data-description', productInfo.description);
                    }
                  }
                } catch (_e) {
                  /* ignore */
                }
              }, 50);
            }
          } catch (_e) {
            /* ignore */
          }

          triggerScanEffects();

          // Dispatch event to notify React components that a scan was completed
          window.dispatchEvent(
            new CustomEvent('bs-scan-complete', {
              detail: { barcodeValue, barcodeFormat }
            })
          );
        } catch (err) {
          log.error(err);

          toastify(
            '<strong>No barcode detected</strong><br><small>Please try again with a different image.</small>',
            { variant: 'danger', trustDangerousInnerHTML: true }
          );

          triggerScanEffects({ success: false });
        }
      };

      image.src = data;
      image.alt = 'Image preview';

      dropzoneEl.replaceChildren();

      const preview = document.createElement('div');
      preview.className = 'dropzone-preview';

      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'dropzone-preview__image-wrapper';

      const fileNameWrapper = document.createElement('div');
      fileNameWrapper.className = 'dropzone-preview__file-name';
      fileNameWrapper.textContent = file.name;

      imageWrapper.appendChild(image);
      preview.appendChild(imageWrapper);
      preview.appendChild(fileNameWrapper);
      dropzoneEl.prepend(preview);
    };

    reader.readAsDataURL(file);
  }

  /**
   * Handles the drop event on the dropzone.
   *
   * @param {CustomEvent} evt - The event object.
   */
  function handleFileDrop(evt) {
    const file = evt.detail.acceptedFiles[0];
    handleFileSelect(file);
  }

  /**
   * Handles the resize event on the video-capture element.
   * It is responsible for resizing the scan frame based on the video element.
   */
  function handleVideoCaptureResize() {
    resizeScanFrame(videoCaptureEl.shadowRoot.querySelector('video'), scanFrameEl);
  }

  /**
   * Handles the video play event on the video-capture element.
   * It is responsible for displaying the scan frame and starting the scan process.
   * It also handles the zoom controls if the browser supports it.
   *
   * @param {CustomEvent} evt - The event object.
   */
  async function handleVideoCapturePlay(evt) {
    scanFrameEl?.removeAttribute('hidden');
    resizeScanFrame(evt.detail.video, scanFrameEl);
    
    // Ensure video element is available for scanning
    if (!videoCaptureVideoEl && evt.detail.video) {
      videoCaptureVideoEl = evt.detail.video;
    }
    
    // Start scanning immediately when video starts playing
    if (shouldScan && !isScanning) {
      scan();
    }

    const trackSettings = evt.target.getTrackSettings();
    const trackCapabilities = evt.target.getTrackCapabilities();
    const zoomLevelEl = document.getElementById('zoomLevel');

    // Torch CTA
    if (trackCapabilities?.torch) {
      torchButton?.addEventListener('click', handleTorchButtonClick);
      torchButton?.removeAttribute('hidden');

      if (videoCaptureEl.hasAttribute('torch')) {
        toggleTorchButtonStatus({ el: torchButton, isTorchOn: true });
      }
    }

    // Zoom controls
    if (trackSettings?.zoom && trackCapabilities?.zoom) {
      const zoomControls = document.getElementById('zoomControls');
      const minZoom = trackCapabilities?.zoom?.min || 0;
      const maxZoom = trackCapabilities?.zoom?.max || 10;
      let currentZoom = trackSettings?.zoom || 1;

      const handleZoomControlsClick = evt => {
        const zoomInBtn = evt.target.closest('[data-action="zoom-in"]');
        const zoomOutBtn = evt.target.closest('[data-action="zoom-out"]');

        if (zoomInBtn && currentZoom < maxZoom) {
          currentZoom += 0.5;
        }

        if (zoomOutBtn && currentZoom > minZoom) {
          currentZoom -= 0.5;
        }

        zoomLevelEl.textContent = currentZoom.toFixed(1);
        videoCaptureEl.zoom = currentZoom;
      };

      zoomControls?.addEventListener('click', handleZoomControlsClick);
      zoomControls?.removeAttribute('hidden');
      zoomLevelEl.textContent = currentZoom.toFixed(1);
    }

    // Camera select
    const videoInputDevices = await VideoCapture.getVideoInputDevices();

    videoInputDevices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Camera ${index + 1}`;
      cameraSelect.appendChild(option);
    });

    // Always show camera select and add change handler
    cameraSelect?.addEventListener('change', handleCameraSelectChange);
    cameraSelect?.removeAttribute('hidden');

    // If only one camera, still show the dropdown so user can see which camera is active
    if (videoInputDevices.length === 1) {
      // Select the only camera
      cameraSelect.value = videoInputDevices[0].deviceId;
    }
  }

  /**
   * Handles the error event on the video-capture element.
   * It is responsible for displaying an error message if the camera cannot be accessed or permission is denied.
   *
   * @param {CustomEvent} evt - The event object.
   */
  function handleVideoCaptureError(evt) {
    const error = evt.detail.error;

    if (error.name === 'NotFoundError') {
      // If the browser cannot find all media tracks with the specified types that meet the constraints given.
      return;
    }

    const errorMessage =
      error.name === 'NotAllowedError'
        ? `<strong>Error accessing camera</strong><br>Permission to use webcam was denied or video Autoplay is disabled. Reload the page to give appropriate permissions to webcam.`
        : error.message;

    if (!cameraPanel) {
      log.error('Camera panel not found, cannot display error');
      return;
    }
    cameraPanel.innerHTML = /* html */ `
      <alert-element variant="danger" open>
        <span slot="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4.54.146A.5.5 0 0 1 4.893 0h6.214a.5.5 0 0 1 .353.146l4.394 4.394a.5.5 0 0 1 .146.353v6.214a.5.5 0 0 1-.146.353l-4.394 4.394a.5.5 0 0 1-.353.146H4.893a.5.5 0 0 1-.353-.146L.146 11.46A.5.5 0 0 1 0 11.107V4.893a.5.5 0 0 1 .146-.353zM5.1 1 1 5.1v5.8L5.1 15h5.8l4.1-4.1V5.1L10.9 1z"/>
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
          </svg>
        </span>
        ${errorMessage}
      </alert-element>
    `;
  }

  /**
   * Handles the auth button click event.
   * It is responsible for displaying the auth dialog.
   */
  function handleAuthButtonClick() {
    authDialog.open = true;
  }

  /**
   * Handles the settings button click event.
   * It is responsible for displaying the settings dialog.
   */
  function handleSettingsButtonClick() {
    settingsDialog.open = true;
  }

  /**
   * Handles the change event on the settings form.
   * It is responsible for saving the settings to persistent storage and updating the settings.
   *
   * @param {Event} evt - The event object.
   */
  async function handleSettingsFormChange(evt) {
    evt.preventDefault();

    const settings = {};
    const formData = new FormData(settingsForm);
    const generalSettings = formData.getAll('general-settings');
    const formatsSettings = formData.getAll('formats-settings');

    generalSettings.forEach(value => (settings[value] = true));
    settings.formats = formatsSettings;
    setSettings(settings);

    if (evt.target.name === 'formats-settings') {
      barcodeReader = await BarcodeReader.create(formatsSettings);
    }
  }

  /**
   * Handles the click event on the history button.
   * It is responsible for displaying the history dialog.
   */
  function handleHistoryButtonClick() {
    historyDialog.open = true;
  }

  /**
   * Handles the click event on the torch button.
   * It is responsible for toggling the torch on and off.
   *
   * @param {MouseEvent} evt - The event object.
   */
  function handleTorchButtonClick(evt) {
    videoCaptureEl.torch = !videoCaptureEl.torch;

    toggleTorchButtonStatus({
      el: evt.currentTarget,
      isTorchOn: videoCaptureEl.hasAttribute('torch')
    });
  }

  /**
   * Handles the change event on the camera select element.
   * It is responsible for restarting the video stream with the selected video input device id.
   *
   * @param {Event} evt - The event object.
   */
  function handleCameraSelectChange(evt) {
    if (typeof videoCaptureEl.restartVideoStream !== 'function') {
      return;
    }

    const videoDeviceId = evt.target.value || undefined;
    videoCaptureEl.restartVideoStream(videoDeviceId);
  }

  /**
   * Handles the visibility change event on the document.
   * It is responsible for stopping the scan process when the document is not visible.
   */
  function handleDocumentVisibilityChange() {
    const selectedTab = tabGroupEl.querySelector('[selected]');
    const tabId = selectedTab.getAttribute('id');

    if (tabId !== 'cameraTab') {
      return;
    }

    if (document.visibilityState === 'hidden') {
      shouldScan = false;

      if (videoCaptureEl != null && typeof videoCaptureEl.stopVideoStream === 'function') {
        videoCaptureEl.stopVideoStream();
      }
    } else {
      shouldScan = true;

      // Get the latest instance of video-capture element to ensure we don't use the cached one.
      const videoCaptureEl = document.querySelector('video-capture');

      if (!videoCaptureEl) {
        return;
      }

      if (!videoCaptureEl.loading && scanBtn.hasAttribute('hidden')) {
        scan();
      }

      if (typeof videoCaptureEl.startVideoStream === 'function') {
        const videoDeviceId = cameraSelect?.value || undefined;
        videoCaptureEl.startVideoStream(videoDeviceId);
      }
    }
  }

  /**
   * Handles the escape key press event on the document.
   * It is responsible for triggering the scan button click event if there is already a barcode detected.
   */
  function handleDocumentEscapeKey() {
    const cameraTabSelected = tabGroupEl.querySelector('#cameraTab').hasAttribute('selected');
    const scanBtnVisible = !scanBtn.hidden;
    const settingsDialogOpen = settingsDialog.hasAttribute('open');
    const historyDialogOpen = historyDialog.hasAttribute('open');
    const anyDialogOpen = settingsDialogOpen || historyDialogOpen;

    if (!scanBtnVisible || !cameraTabSelected || anyDialogOpen) {
      return;
    }

    scanBtn.click();
  }

  /**
   * Handles the key down event on the document.
   */
  function handleDocumentKeyDown(evt) {
    if (evt.key === 'Escape') {
      handleDocumentEscapeKey();
    }
  }

  /**
   * Handles success events from the history component.
   *
   * @param {CustomEvent<{ type: string, message: string }>} evt - The event object.
   */
  function handleHistorySuccess(evt) {
    const { type, message } = evt.detail;

    if (type === 'add') {
      toastify(message, { variant: 'success' });
    }
  }

  /**
   * Handles error events from the history component.
   *
   * @param {CustomEvent<{ type: string, message: string }>} evt - The event object.
   */
  function handleHistoryError(evt) {
    const { type, message } = evt.detail;

    if (type === 'remove' || type === 'empty') {
      historyDialog?.hide();
    }

    toastify(message, { variant: 'danger' });
  }

  scanBtn.addEventListener('click', handleScanButtonClick);
  tabGroupEl.addEventListener('a-tab-show', debounce(handleTabShow, 250));
  dropzoneEl.addEventListener('files-dropzone-drop', handleFileDrop);
  resizeObserverEl.addEventListener('resize-observer:resize', handleVideoCaptureResize);
  authBtn.addEventListener('click', handleAuthButtonClick);
  settingsBtn.addEventListener('click', handleSettingsButtonClick);
  settingsForm.addEventListener('change', debounce(handleSettingsFormChange, 500));
  historyBtn.addEventListener('click', handleHistoryButtonClick);
  document.addEventListener('visibilitychange', handleDocumentVisibilityChange);
  document.addEventListener('keydown', handleDocumentKeyDown);
  document.addEventListener('bs-history-success', handleHistorySuccess);
  document.addEventListener('bs-history-error', handleHistoryError);
})();
