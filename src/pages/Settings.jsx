import React, { useEffect, useRef } from 'react';
import '../css/main.css';
import './Settings.css';

// Import custom web components
import '../js/components/bs-settings.js';
import { BarcodeReader } from '../js/helpers/BarcodeReader.js';

export default function Settings() {
  const settingsInitialized = useRef(false);

  useEffect(() => {
    // Initialize settings component with supported formats
    if (settingsInitialized.current) return;

    const initSettings = async () => {
      try {
        const supportedBarcodeFormats = await BarcodeReader.getSupportedFormats();
        const bsSettingsEl = document.querySelector('bs-settings');
        if (bsSettingsEl && supportedBarcodeFormats) {
          bsSettingsEl.supportedFormats = supportedBarcodeFormats;
        }
        settingsInitialized.current = true;
      } catch (err) {
        console.warn('Error initializing settings:', err);
      }
    };

    // Wait for DOM to be ready
    setTimeout(initSettings, 100);
  }, []);

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Configure your scanning preferences and app settings</p>
        </div>

        <div className="settings-content">
          <bs-settings>
            <form id="settingsForm" autoComplete="off">
              <fieldset>
                <legend>When barcode is detected...</legend>
                <ul>
                  <li>
                    <label>
                      <input type="checkbox" name="general-settings" value="openWebPage" /> Open web pages automatically
                    </label>
                  </li>
                  <li>
                    <label>
                      <input type="checkbox" name="general-settings" value="openWebPageSameTab" /> Open web pages in the same tab
                    </label>
                  </li>
                  <li>
                    <label>
                      <input type="checkbox" name="general-settings" value="addToHistory" /> Add to history
                    </label>
                  </li>
                  <li>
                    <label>
                      <input type="checkbox" name="general-settings" value="continueScanning" /> Continue scanning
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
                      <input type="checkbox" name="general-settings" value="vibrate" /> Vibrate (Android)
                    </label>
                  </li>
                </ul>
              </fieldset>

              <fieldset name="bs-formats">
                <legend>
                  Supported formats
                  <br />
                  <small className="text-muted fw-normal">If none is checked, all formats will be supported.</small>
                </legend>
                <ul id="formatsList" className="formats-list" />
              </fieldset>
            </form>
          </bs-settings>
        </div>
      </div>
    </div>
  );
}

