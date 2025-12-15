import { useEffect, useRef, useState } from 'react';
import '../css/main.css';
import './Settings.css';

// Import custom web components
import '../js/components/bs-settings.js';
import { BarcodeReader } from '../js/helpers/BarcodeReader.js';
import { getTheme, setTheme, toggleTheme } from '../js/services/theme.js';

export default function Settings() {
  const settingsInitialized = useRef(false);

  // Get stored theme preference (or 'auto' if not set)
  const getStoredThemePreference = () => {
    try {
      const stored = localStorage.getItem('barcode-scanner/theme');
      return stored || 'auto';
    } catch {
      return 'auto';
    }
  };

  const [themePreference, setThemePreference] = useState(getStoredThemePreference());

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

  const handleThemeChange = e => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    setThemePreference(newTheme);
  };

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

              <fieldset>
                <legend>Appearance</legend>
                <ul>
                  <li>
                    <label>
                      <span>Theme:</span>
                      <select
                        name="theme"
                        value={themePreference}
                        onChange={handleThemeChange}
                        style={{
                          marginLeft: '1rem',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border)',
                          background: 'var(--background-input)',
                          color: 'var(--text-main)',
                          fontSize: '1rem'
                        }}
                      >
                        <option value="light">☀️ Light</option>
                        <option value="dark">🌙 Dark</option>
                        <option value="auto">🔄 Auto (System)</option>
                      </select>
                    </label>
                    <small className="text-muted" style={{ display: 'block', marginTop: '0.5rem' }}>
                      Choose your preferred color theme. Auto follows your system preference.
                    </small>
                  </li>
                </ul>
              </fieldset>
            </form>
          </bs-settings>
        </div>
      </div>
    </div>
  );
}
