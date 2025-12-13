import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthProvider.jsx';
import '../css/main.css';

// Import custom web components and scanning functionality
import '@georapbox/a-tab-group/dist/a-tab-group.js';
import '@georapbox/web-share-element/dist/web-share-defined.js';
import '@georapbox/files-dropzone-element/dist/files-dropzone-defined.js';
import '@georapbox/resize-observer-element/dist/resize-observer-defined.js';
import '@georapbox/modal-element/dist/modal-element-defined.js';
import '@georapbox/alert-element/dist/alert-element-defined.js';
import '../js/components/video-capture.js';
import '../js/components/clipboard-copy.js';
import '../js/components/bs-result.js';
import '../js/components/bs-settings.js';
import '../js/components/bs-history.js';
import '../js/components/bs-auth.js';

export default function Scanner() {
  const { user } = useAuth();
  const scannerInitialized = useRef(false);

  useEffect(() => {
    // Initialize scanning functionality only once
    if (scannerInitialized.current) return;

    let retryCount = 0;
    const MAX_RETRIES = 20;

    // Wait for DOM elements to be available
    const initScanner = async () => {
      // Wait a bit for React to render the DOM
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check if required elements exist
      const tabGroupEl = document.querySelector('a-tab-group');
      const videoCaptureEl = document.querySelector('video-capture');
      const cameraPanel = document.getElementById('cameraPanel');
      const filePanel = document.getElementById('filePanel');

      if (!tabGroupEl || !videoCaptureEl || !cameraPanel || !filePanel) {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          // Retry after a short delay
          setTimeout(initScanner, 300);
          return;
        } else {
          console.warn('Scanner elements not found after multiple retries');
          return;
        }
      }

      scannerInitialized.current = true;

      // Dynamically import and initialize the scanning functionality
      // Try to load it but don't block camera initialization
      const loadScannerModule = async () => {
        try {
          await import('../js/index.js');
          console.log('Scanner module loaded successfully');
        } catch (err) {
          console.warn('Failed to load scanner module, but continuing with camera:', err);
          // Continue anyway - camera can work independently
        }
      };

      // Load scanner module in background (non-blocking)
      loadScannerModule();

      // Function to start camera - defined early so it can be called multiple times
      const startCamera = async () => {
        const videoCaptureEl = document.querySelector('video-capture');

        if (!videoCaptureEl) {
          console.warn('video-capture element not found, will retry...');
          return false;
        }

        console.log('Attempting to start camera...', {
          hasStartVideoStream: typeof videoCaptureEl.startVideoStream === 'function',
          isConnected: videoCaptureEl.isConnected,
          hasAutoPlay: videoCaptureEl.hasAttribute('auto-play')
        });

        if (typeof videoCaptureEl.startVideoStream === 'function') {
          try {
            console.log('Calling startVideoStream...');
            await videoCaptureEl.startVideoStream();
            console.log('Camera stream started successfully!');

            // Ensure video is visible - wait a bit for video element to render
            setTimeout(() => {
              const video = videoCaptureEl.shadowRoot?.querySelector('video');
              if (video) {
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'cover';
                video.style.display = 'block';
                console.log('Video element styled and visible');
              } else {
                console.warn('Video element not found in shadow DOM, will check again...');
                // Retry finding video element
                setTimeout(() => {
                  const retryVideo = videoCaptureEl.shadowRoot?.querySelector('video');
                  if (retryVideo) {
                    retryVideo.style.width = '100%';
                    retryVideo.style.height = '100%';
                    retryVideo.style.objectFit = 'cover';
                    retryVideo.style.display = 'block';
                    console.log('Video element found on retry');
                  }
                }, 1000);
              }
            }, 500);
            return true;
          } catch (err) {
            console.error('Camera start error:', err);
            // Show user-friendly message in the camera panel
            const cameraPanel = document.getElementById('cameraPanel');
            if (cameraPanel) {
              const errorMsg =
                err.name === 'NotAllowedError'
                  ? 'Camera permission denied. Please allow camera access in your browser settings and refresh the page.'
                  : err.name === 'NotFoundError'
                    ? 'No camera found. Please connect a camera and refresh the page.'
                    : err.name === 'NotReadableError'
                      ? 'Camera is already in use by another application. Please close other apps using the camera.'
                      : `Camera error: ${err.message}`;

              // Don't replace entire panel, just show error
              let alertEl = cameraPanel.querySelector('alert-element');
              if (!alertEl) {
                alertEl = document.createElement('alert-element');
                alertEl.setAttribute('variant', 'warning');
                alertEl.setAttribute('open', '');
                cameraPanel.insertBefore(alertEl, cameraPanel.firstChild);
              }

              alertEl.innerHTML = `
                <span slot="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                  </svg>
                </span>
                ${errorMsg}
              `;
            }
            return false;
          }
        } else {
          console.warn(
            'startVideoStream method not available yet, element may still be initializing'
          );
          // The video-capture custom element may still be defining itself
          // Wait a bit and try again
          return false;
        }
      };

      // Ensure camera starts - wait for tab group to be ready
      setTimeout(() => {
        const videoCaptureEl = document.querySelector('video-capture');
        const cameraTab = document.querySelector('#cameraTab');
        const tabGroupEl = document.querySelector('a-tab-group');
        const cameraSelect = document.getElementById('cameraSelect');
        const refreshCameraBtn = document.getElementById('refreshCameraList');

        // Listen for tab changes to start camera when camera tab is selected
        if (tabGroupEl) {
          tabGroupEl.addEventListener('change', e => {
            const selectedTab = e.detail?.selected;
            console.log('Tab changed:', selectedTab);
            if (selectedTab === 0 || cameraTab?.hasAttribute('selected')) {
              // Camera tab is selected, start camera with retries
              let retryCount = 0;
              const tryStartCamera = async () => {
                const success = await startCamera();
                if (!success && retryCount < 5) {
                  retryCount++;
                  setTimeout(tryStartCamera, 500);
                }
              };
              setTimeout(tryStartCamera, 200);
            }
          });
        }

        // Also listen for video-capture element ready event if available
        if (videoCaptureEl) {
          videoCaptureEl.addEventListener(
            'video-capture:ready',
            () => {
              console.log('video-capture element is ready');
              startCamera();
            },
            { once: true }
          );

          // Try to start camera immediately if element is ready
          if (videoCaptureEl.startVideoStream) {
            const tryStartNow = async () => {
              let retryCount = 0;
              const attemptStart = async () => {
                const success = await startCamera();
                if (!success && retryCount < 5) {
                  retryCount++;
                  setTimeout(attemptStart, 500);
                }
              };
              attemptStart();
            };
            setTimeout(tryStartNow, 300);
          }
        }

        // Function to populate camera list
        const populateCameraList = async () => {
          if (!cameraSelect) return;

          try {
            // Request camera permission first (needed to get device labels)
            try {
              await navigator.mediaDevices.getUserMedia({ video: true });
            } catch (permErr) {
              // Permission might be denied, but we can still try to enumerate
              console.warn('Camera permission:', permErr);
            }

            // Get available cameras
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputDevices = devices.filter(
              device => device.kind === 'videoinput' && device.deviceId
            );

            // Clear existing options except the first one
            while (cameraSelect.children.length > 1) {
              cameraSelect.removeChild(cameraSelect.lastChild);
            }

            // Add camera options
            videoInputDevices.forEach((device, index) => {
              const option = document.createElement('option');
              option.value = device.deviceId;
              option.textContent = device.label || `Camera ${index + 1}`;
              cameraSelect.appendChild(option);
            });

            // Always show the dropdown (remove hidden attribute if present)
            cameraSelect?.removeAttribute('hidden');

            // If there are cameras, select the first one
            if (videoInputDevices.length > 0 && !cameraSelect.value) {
              cameraSelect.value = videoInputDevices[0].deviceId;
            }
          } catch (err) {
            console.warn('Error populating camera list:', err);
          }
        };

        // Populate camera list immediately (will work better after permission is granted)
        populateCameraList();

        // Add refresh button handler
        if (refreshCameraBtn) {
          refreshCameraBtn.addEventListener('click', populateCameraList);
        }

        // Check if camera tab is selected (it should be by default)
        const isCameraTabSelected = cameraTab && cameraTab.hasAttribute('selected');
        const hasSelectedTab = tabGroupEl?.querySelector('[selected]');

        console.log('Initial camera check:', {
          isCameraTabSelected,
          hasSelectedTab,
          firstTab: !hasSelectedTab,
          videoCaptureReady: typeof videoCaptureEl?.startVideoStream === 'function'
        });

        // If camera tab is selected or if it's the first tab, start the camera
        // Also start if no tab is explicitly selected (default to first)
        if (
          isCameraTabSelected ||
          !hasSelectedTab ||
          cameraTab?.parentElement?.children[0] === cameraTab
        ) {
          // Try multiple times to start camera (in case element is still initializing)
          let retryCount = 0;
          const maxRetries = 10;
          const attemptCameraStart = async () => {
            const success = await startCamera();
            if (!success && retryCount < maxRetries) {
              retryCount++;
              setTimeout(attemptCameraStart, 500);
            } else if (success) {
              console.log('Camera started successfully after', retryCount, 'attempts');
            }
          };

          // Start attempts after a short delay
          setTimeout(attemptCameraStart, 500);
        }
      }, 1000);
    };

    initScanner();

    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, []);

  return (
    <div className="scanner-page">
      {/* Page Header */}
      <div className="scanner-header">
        <div className="scanner-header-content">
          <div className="scanner-logo">
            <svg width="3em" height="3em" className="logo" aria-hidden="true" viewBox="0 0 512 512">
              <path
                fill="var(--accent)"
                d="M93.867,51.2H8.533C3.814,51.2,0,55.014,0,59.733v85.333c0,4.719,3.814,8.533,8.533,8.533s8.533-3.814,8.533-8.533v-76.8 h76.8c4.719,0,8.533-3.814,8.533-8.533S98.586,51.2,93.867,51.2z"
              />
              <path
                fill="var(--accent)"
                d="M503.467,51.2h-85.333c-4.719,0-8.533,3.814-8.533,8.533s3.814,8.533,8.533,8.533h76.8v76.8c0,4.719,3.814,8.533,8.533,8.533c4.719,0,8.533-3.814,8.533-8.533V59.733C512,55.014,508.186,51.2,503.467,51.2z"
              />
              <path
                fill="var(--accent)"
                d="M503.467,358.4c-4.719,0-8.533,3.814-8.533,8.533v76.8h-76.8c-4.719,0-8.533,3.814-8.533,8.533s3.814,8.533,8.533,8.533h85.333c4.719,0,8.533-3.814,8.533-8.533v-85.333C512,362.214,508.186,358.4,503.467,358.4z"
              />
              <path
                fill="var(--accent)"
                d="M93.867,443.733h-76.8v-76.8c0-4.719-3.814-8.533-8.533-8.533S0,362.214,0,366.933v85.333c0,4.719,3.814,8.533,8.533,8.533h85.333c4.719,0,8.533-3.814,8.533-8.533S98.586,443.733,93.867,443.733z"
              />
              <path
                fill="var(--accent)"
                d="M503.467,247.467H8.533C3.814,247.467,0,251.281,0,256s3.814,8.533,8.533,8.533h494.933c4.719,0,8.533-3.814,8.533-8.533S508.186,247.467,503.467,247.467z"
              />
            </svg>
          </div>
          <div className="scanner-title">
            <h1>Barcode Scanner</h1>
            <p>Scan barcodes and QR codes with your camera or upload an image</p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="global-actions" id="globalActions" hidden>
          <button id="authBtn" aria-label="Account" className="action-button">
            <svg
              width="1.25em"
              height="1.25em"
              fill="currentColor"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
              <path
                fillRule="evenodd"
                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
              />
            </svg>
            <span>Account</span>
          </button>

          <button id="historyBtn" aria-label="History" className="action-button">
            <svg
              width="1.25em"
              height="1.25em"
              fill="currentColor"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z" />
              <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z" />
              <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5" />
            </svg>
            <span>History</span>
          </button>

          <button id="settingsBtn" aria-label="Settings" className="action-button">
            <svg
              width="1.25em"
              height="1.25em"
              fill="currentColor"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M11.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M9.05 3a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0V3zM4.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M2.05 8a2.5 2.5 0 0 1 4.9 0H16v1H6.95a2.5 2.5 0 0 1-4.9 0H0V8zm9.45 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-2.45 1a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0v-1z"
              />
            </svg>
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Scanner Container */}
      <div className="scanner-container">
        <alert-element variant="danger" id="barcodeReaderError" hidden>
          <span slot="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.25em"
              height="1.25em"
              fill="currentColor"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="M4.54.146A.5.5 0 0 1 4.893 0h6.214a.5.5 0 0 1 .353.146l4.394 4.394a.5.5 0 0 1 .146.353v6.214a.5.5 0 0 1-.146.353l-4.394 4.394a.5.5 0 0 1-.353.146H4.893a.5.5 0 0 1-.353-.146L.146 11.46A.5.5 0 0 1 0 11.107V4.893a.5.5 0 0 1 .146-.353zM5.1 1 1 5.1v5.8L5.1 15h5.8l4.1-4.1V5.1L10.9 1z" />
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
            </svg>
          </span>
          An error occurred while initializing BarcodeReader.
        </alert-element>

        <a-tab-group no-scroll-controls no-tab-cycling>
          <a-tab role="heading" id="cameraTab">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.625em"
              height="1.625em"
              fill="currentColor"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="M0 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H9.269c.144.162.33.324.531.475a6.785 6.785 0 0 0 .907.57l.014.006.003.002A.5.5 0 0 1 10.5 13h-5a.5.5 0 0 1-.224-.947l.003-.002.014-.007a4.473 4.473 0 0 0 .268-.148 6.75 6.75 0 0 0 .639-.421c.2-.15.387-.313.531-.475H2a2 2 0 0 1-2-2V6Zm2-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H2Z" />
              <path d="M8 6.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm7 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
            </svg>
            <span>Use webcam</span>
          </a-tab>

          <a-tab-panel id="cameraPanel">
            <div className="scan-frame-container">
              <resize-observer>
                <video-capture id="videoCapture" auto-play>
                  <button type="button" id="scanBtn" className="scan-button" hidden>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="2.75em"
                      height="2.75em"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5zM3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7z" />
                    </svg>
                    <span>
                      Click to scan another barcode or press the <kbd>Esc</kbd> key.
                    </span>
                  </button>

                  <div slot="actions">
                    <button
                      type="button"
                      className="torch-button"
                      id="torchButton"
                      aria-label="Turn on flash"
                      hidden
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="1.25em"
                        height="1.25em"
                        aria-hidden="true"
                      >
                        <path
                          d="M315.27 33L96 304h128l-31.51 173.23a2.36 2.36 0 002.33 2.77h0a2.36 2.36 0 001.89-.95L416 208H288l31.66-173.25a2.45 2.45 0 00-2.44-2.75h0a2.42 2.42 0 00-1.95 1z"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="32"
                        />
                      </svg>
                    </button>

                    <select
                      id="cameraSelect"
                      className="camera-select"
                      aria-label="Select camera"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        --Select Camera--
                      </option>
                    </select>
                    <button
                      type="button"
                      id="refreshCameraList"
                      className="refresh-camera-btn"
                      aria-label="Refresh camera list"
                      title="Refresh camera list"
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--snhu-yellow)',
                        color: 'var(--snhu-navy)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}
                    >
                      Refresh Cameras
                    </button>

                    <div className="zoom-controls" id="zoomControls" hidden>
                      <button type="button" aria-label="Zoom out" data-action="zoom-out">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1.125em"
                          height="1.125em"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"
                          />
                          <path d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z" />
                          <path
                            fillRule="evenodd"
                            d="M3 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"
                          />
                        </svg>
                      </button>

                      <label id="zoomLevel" />
                      <button type="button" aria-label="Zoom in" data-action="zoom-in">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1.125em"
                          height="1.125em"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"
                          />
                          <path d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z" />
                          <path
                            fillRule="evenodd"
                            d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </video-capture>
              </resize-observer>

              <div id="scanFrame" className="scan-frame" hidden>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path
                    d="M336 448h56a56 56 0 0056-56v-56M448 176v-56a56 56 0 00-56-56h-56M176 448h-56a56 56 0 01-56-56v-56M64 176v-56a56 56 0 0156-56h56"
                    fill="none"
                    stroke="var(--scan-frame-color)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="10"
                  />
                </svg>
              </div>
            </div>

            <div id="scanInstructions" className="scan-instructions" hidden>
              <p>Align barcode in the center of the frame</p>
            </div>

            <div className="results" />
          </a-tab-panel>

          <a-tab role="heading" id="fileTab">
            <svg
              width="1.125em"
              height="1.125em"
              viewBox="0 0 21 21"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              aria-hidden="true"
            >
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g transform="translate(-850.000000, -2681.000000)">
                  <g transform="translate(100.000000, 2626.000000)">
                    <g transform="translate(748.000000, 54.000000)">
                      <g>
                        <polygon id="Path" points="0 0 24 0 24 24 0 24" />
                        <path
                          d="M10.21,16.83 L12.96,13.29 L16.5,18 L5.5,18 L8.25,14.47 L10.21,16.83 Z M20,4 L23,4 L23,6 L20,6 L20,8.99 L18,8.99 L18,6 L15,6 L15,4 L18,4 L18,1 L20,1 L20,4 Z M18,20 L18,10 L20,10 L20,20 C20,21.1 19.1,22 18,22 L4,22 C2.9,22 2,21.1 2,20 L2,6 C2,4.9 2.9,4 4,4 L14,4 L14,6 L4,6 L4,20 L18,20 Z"
                          fill="currentColor"
                        />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
            <span>Use image</span>
          </a-tab>

          <a-tab-panel id="filePanel">
            <files-dropzone id="dropzone" className="dropzone">
              <span className="dropzone-instructions">Click or drop an image to scan</span>
            </files-dropzone>

            <div className="results" />
          </a-tab-panel>
        </a-tab-group>
      </div>

      {/* Modals */}
      <modal-element
        id="authDialog"
        className="popover-dialog auth-dialog"
        placement="top-end"
        hidden
      >
        <span slot="header">Account</span>
        <bs-auth />
      </modal-element>

      <modal-element
        id="historyDialog"
        className="popover-dialog history-dialog"
        placement="top-end"
        hidden
      >
        <span slot="header">History</span>
        <bs-history />
      </modal-element>

      <modal-element
        id="settingsDialog"
        className="popover-dialog settings-dialog"
        placement="top-end"
        hidden
      >
        <span slot="header">Settings</span>
        <bs-settings>
          <form id="settingsForm" autoComplete="off">
            <fieldset>
              <legend>When barcode is detected...</legend>
              <ul>
                <li>
                  <label>
                    <input type="checkbox" name="general-settings" value="openWebPage" /> Open web
                    pages automatically
                  </label>
                </li>
                <li>
                  <label>
                    <input type="checkbox" name="general-settings" value="openWebPageSameTab" />{' '}
                    Open web pages in the same tab
                  </label>
                </li>
                <li>
                  <label>
                    <input type="checkbox" name="general-settings" value="addToHistory" /> Add to
                    history
                  </label>
                </li>
                <li>
                  <label>
                    <input type="checkbox" name="general-settings" value="continueScanning" />{' '}
                    Continue scanning
                  </label>
                </li>
              </ul>
            </fieldset>

            <fieldset>
              <legend>Effects</legend>
              <ul>
                <li>
                  <label>
                    <input type="checkbox" name="general-settings" value="beep" /> Beep
                  </label>
                </li>
                <li>
                  <label>
                    <input type="checkbox" name="general-settings" value="vibrate" /> Vibrate
                    (Android)
                  </label>
                </li>
              </ul>
            </fieldset>

            <fieldset name="bs-formats">
              <legend>
                Supported formats
                <br />
                <small className="text-muted fw-normal">
                  If none is checked, all formats will be supported.
                </small>
              </legend>
              <ul id="formatsList" className="formats-list" />
            </fieldset>
          </form>
        </bs-settings>
      </modal-element>
    </div>
  );
}
