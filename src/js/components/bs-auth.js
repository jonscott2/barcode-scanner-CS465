import { isFirebaseConfigured } from '../services/firebase-config.js';
import {
  onAuthStateChange,
  signInAnonymous,
  signInWithEmail,
  createAccount,
  signOut,
  getCurrentUser,
  resetPassword
} from '../services/firebase-auth.js';
import { log } from '../utils/log.js';
import { toastify } from '../helpers/toastify.js';

const styles = /* css */ `
  :host {
    display: block;
    box-sizing: border-box;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  :host([hidden]),
  [hidden],
  ::slotted([hidden]) {
    display: none !important;
  }

  .auth-container {
    padding: 1rem;
  }

  .auth-status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background-color: var(--background-secondary, #f5f5f5);
    border-radius: var(--border-radius, 0.25rem);
    margin-bottom: 1rem;
  }

  .auth-status__icon {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: var(--primary-color, #0066cc);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  .auth-status__info {
    flex: 1;
  }

  .auth-status__email {
    font-weight: 600;
    color: var(--text-main);
  }

  .auth-status__type {
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .auth-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--border);
  }

  .auth-tab {
    padding: 1rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    color: var(--text-muted, #9ca3af);
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    position: relative;
  }

  .auth-tab::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-color, #667eea), #764ba2);
    transition: width 0.3s ease;
  }

  .auth-tab:hover {
    color: var(--text-main, #374151);
    background: rgba(102, 126, 234, 0.05);
  }

  .auth-tab.active {
    color: var(--primary-color, #667eea);
    background: rgba(102, 126, 234, 0.08);
  }

  .auth-tab.active::after {
    width: 100%;
  }

  .auth-form {
    display: none;
  }

  .auth-form.active {
    display: block;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-main, #374151);
    letter-spacing: 0.2px;
  }

  .form-group input {
    width: 100%;
    padding: 0.875rem 1.25rem;
    border: 2px solid var(--border, #e5e7eb);
    border-radius: 12px;
    font-size: 1rem;
    font-family: inherit;
    background: var(--background-input, #ffffff);
    color: var(--text-main, #111827);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .form-group input:hover {
    border-color: #cbd5e1;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--primary-color, #667eea);
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15), 0 4px 12px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }

  .form-group input::placeholder {
    color: var(--text-muted, #9ca3af);
    opacity: 0.7;
  }

  .password-group {
    position: relative;
  }

  .password-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .password-input-wrapper input {
    padding-right: 3rem;
  }

  .password-toggle {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    color: var(--text-muted);
    font-size: 1.25rem;
  }

  .password-toggle:hover {
    color: var(--primary-color);
  }

  .password-hint {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .password-strength {
    margin-top: 0.5rem;
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
  }

  .password-strength-bar {
    height: 100%;
    transition: width 0.3s ease, background-color 0.3s ease;
    border-radius: 2px;
  }

  .password-strength-bar.weak {
    width: 33%;
    background: #ef4444;
  }

  .password-strength-bar.medium {
    width: 66%;
    background: #f59e0b;
  }

  .password-strength-bar.strong {
    width: 100%;
    background: #10b981;
  }

  .input-error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15) !important;
  }

  .input-success {
    border-color: #10b981 !important;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15) !important;
  }

  .validation-message {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .validation-message.error {
    color: #dc2626;
  }

  .validation-message.success {
    color: #059669;
  }

  .security-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.75rem;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 8px;
    font-size: 0.875rem;
    color: #059669;
  }

  .security-badge svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .remember-me {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .remember-me input[type="checkbox"] {
    width: auto;
    margin: 0;
    cursor: pointer;
  }

  .forgot-password {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
  }

  .forgot-password:hover {
    text-decoration: underline;
  }

  .btn-spinner {
    display: inline-block;
  }

  .forgot-password-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .forgot-password-modal .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }

  .forgot-password-modal h3 {
    margin-bottom: 0.5rem;
    color: var(--text-main);
  }

  .forgot-password-modal p {
    margin-bottom: 1.5rem;
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .modal-actions .btn {
    flex: 1;
  }

  .success-message {
    background: #d1fae5;
    border: 1px solid #10b981;
    color: #065f46;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .btn {
    width: 100%;
    padding: 1rem 1.5rem;
    border: 0;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, #764ba2 100%);
    color: white;
    font-size: 1.05rem;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    position: relative;
    overflow: hidden;
  }

  .btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s ease;
  }

  .btn:hover::before {
    left: 100%;
  }

  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
    background: linear-gradient(135deg, #764ba2 0%, var(--primary-color, #667eea) 100%);
  }

  .btn:active {
    transform: translateY(0);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background-color: var(--secondary-color, #6c757d);
  }

  .btn-danger {
    background-color: var(--danger-color, #dc3545);
  }

  .error-message {
    padding: 1rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border: 2px solid #f87171;
    border-radius: 12px;
    color: #991b1b;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(248, 113, 113, 0.2);
    animation: shake 0.5s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  .info-message {
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border: 2px solid #60a5fa;
    border-radius: 12px;
    color: #1e40af;
    font-size: 0.95rem;
    line-height: 1.6;
    box-shadow: 0 4px 12px rgba(96, 165, 250, 0.2);
  }

  .info-message strong {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 1.05rem;
    font-weight: 700;
  }

  .divider {
    display: flex;
    align-items: center;
    margin: 1rem 0;
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--border);
  }

  .divider::before {
    margin-right: 0.5rem;
  }

  .divider::after {
    margin-left: 0.5rem;
  }

  @media (prefers-color-scheme: dark) {
    .auth-status {
      background-color: #2a2a2a;
    }

    .error-message {
      background-color: #3d1a1a;
      border-color: #5a2626;
      color: #ff8080;
    }

    .info-message {
      background-color: #1a2d3d;
      border-color: #264d73;
      color: #80c4ff;
    }
  }
`;

const template = document.createElement('template');

template.innerHTML = /* html */ `
  <style>${styles}</style>
  <div class="auth-container">
    <div id="authStatus" hidden>
      <div class="auth-status">
        <div class="auth-status__icon" id="userIcon"></div>
        <div class="auth-status__info">
          <div class="auth-status__email" id="userEmail"></div>
          <div class="auth-status__type" id="userType"></div>
        </div>
      </div>
      <button type="button" class="btn btn-danger" id="signOutBtn">Sign Out</button>
    </div>

    <div id="authForms">
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="signin">Sign In</button>
        <button class="auth-tab" data-tab="signup">Sign Up</button>
      </div>

      <div class="auth-form active" id="signinForm">
        <form>
          <div class="form-group">
            <label for="signinEmail">Email</label>
            <input type="email" id="signinEmail" required autocomplete="email" placeholder="your@email.com">
            <div class="validation-message" id="signinEmailValidation" hidden></div>
          </div>
          <div class="form-group password-group">
            <label for="signinPassword">Password</label>
            <div class="password-input-wrapper">
              <input type="password" id="signinPassword" required autocomplete="current-password" placeholder="Enter your password">
              <button type="button" class="password-toggle" id="signinPasswordToggle" aria-label="Toggle password visibility">
                <span class="eye-icon">👁️</span>
              </button>
            </div>
          </div>
          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" id="rememberMe">
              <span>Remember me</span>
            </label>
            <a href="#" class="forgot-password" id="forgotPasswordLink">Forgot Password?</a>
          </div>
          <div id="signinError" class="error-message" hidden></div>
          <button type="submit" class="btn" id="signinBtn">
            <span class="btn-text">Sign In</span>
            <span class="btn-spinner" hidden>⏳</span>
          </button>
        </form>
      </div>

      <div class="auth-form" id="signupForm">
        <form>
          <div class="form-group">
            <label for="signupEmail">Email</label>
            <input type="email" id="signupEmail" required autocomplete="email" placeholder="your@email.com">
            <div class="validation-message" id="emailValidation" hidden></div>
          </div>
          <div class="form-group password-group">
            <label for="signupPassword">Password</label>
            <div class="password-input-wrapper">
              <input type="password" id="signupPassword" required autocomplete="new-password" minlength="8" placeholder="At least 8 characters">
              <button type="button" class="password-toggle" id="signupPasswordToggle" aria-label="Toggle password visibility">
                <span class="eye-icon">👁️</span>
              </button>
            </div>
            <div class="password-strength" id="passwordStrength" hidden>
              <div class="password-strength-bar" id="passwordStrengthBar"></div>
            </div>
            <small class="password-hint">Password must be at least 8 characters with letters and numbers</small>
            <div class="validation-message" id="passwordValidation" hidden></div>
          </div>
          <div class="form-group">
            <label for="signupDisplayName">Display Name (optional)</label>
            <input type="text" id="signupDisplayName" autocomplete="name" placeholder="Your name">
          </div>
          <div id="signupError" class="error-message" hidden></div>
          <button type="submit" class="btn" id="signupBtn">
            <span class="btn-text">Create Account</span>
            <span class="btn-spinner" hidden>⏳</span>
          </button>
        </form>
      </div>

      <!-- Forgot Password Modal -->
      <div id="forgotPasswordModal" class="forgot-password-modal" hidden>
        <div class="modal-content">
          <h3>Reset Password</h3>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
          <form id="forgotPasswordForm">
            <div class="form-group">
              <label for="resetEmail">Email</label>
              <input type="email" id="resetEmail" required autocomplete="email" placeholder="your@email.com">
            </div>
            <div id="resetError" class="error-message" hidden></div>
            <div id="resetSuccess" class="success-message" hidden></div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" id="cancelResetBtn">Cancel</button>
              <button type="submit" class="btn" id="sendResetBtn">
                <span class="btn-text">Send Reset Link</span>
                <span class="btn-spinner" hidden>⏳</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
`;

class BSAuth extends HTMLElement {
  #authStatusEl = null;
  #authFormsEl = null;
  #unsubscribeAuth = null;

  constructor() {
    super();

    if (!this.shadowRoot) {
      const shadowRoot = this.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(template.content.cloneNode(true));
    }
  }

  connectedCallback() {
    this.#authStatusEl = this.shadowRoot.getElementById('authStatus');
    this.#authFormsEl = this.shadowRoot.getElementById('authForms');

    // Always hide Firebase not configured message
    const firebaseMsg = this.shadowRoot.getElementById('firebaseNotConfigured');
    if (firebaseMsg) {
      firebaseMsg.hidden = true;
    }

    // Restore remembered email
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      const emailInput = this.shadowRoot.getElementById('signinEmail');
      const rememberMe = this.shadowRoot.getElementById('rememberMe');
      if (emailInput) emailInput.value = rememberedEmail;
      if (rememberMe) rememberMe.checked = true;
    }

    // Set up event listeners
    this.#setupEventListeners();

    // Subscribe to auth state changes
    this.#unsubscribeAuth = onAuthStateChange(user => {
      this.#handleAuthStateChange(user);
    });

    // Check initial auth state
    const currentUser = getCurrentUser();
    this.#handleAuthStateChange(currentUser);
  }

  disconnectedCallback() {
    if (this.#unsubscribeAuth) {
      this.#unsubscribeAuth();
    }
  }

  #setupEventListeners() {
    // Tab switching
    const tabs = this.shadowRoot.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => this.#switchTab(tab.dataset.tab));
    });

    // Anonymous sign in
    this.shadowRoot
      .getElementById('anonymousBtn')
      ?.addEventListener('click', () => this.#handleAnonymousSignIn());
    this.shadowRoot
      .getElementById('signinAnonymousBtn')
      ?.addEventListener('click', () => this.#handleAnonymousSignIn());
    this.shadowRoot
      .getElementById('signupAnonymousBtn')
      ?.addEventListener('click', () => this.#handleAnonymousSignIn());

    // Sign in form
    this.shadowRoot
      .getElementById('signinForm')
      ?.addEventListener('submit', e => this.#handleSignIn(e));

    // Sign up form
    this.shadowRoot
      .getElementById('signupForm')
      ?.addEventListener('submit', e => this.#handleSignUp(e));

    // Sign out
    this.shadowRoot
      .getElementById('signOutBtn')
      ?.addEventListener('click', () => this.#handleSignOut());

    // Password visibility toggles
    this.shadowRoot
      .getElementById('signinPasswordToggle')
      ?.addEventListener('click', () => this.#togglePasswordVisibility('signinPassword'));
    this.shadowRoot
      .getElementById('signupPasswordToggle')
      ?.addEventListener('click', () => this.#togglePasswordVisibility('signupPassword'));

    // Real-time validation
    this.shadowRoot
      .getElementById('signupEmail')
      ?.addEventListener('blur', () => this.#validateEmail('signupEmail', 'emailValidation'));
    this.shadowRoot
      .getElementById('signupEmail')
      ?.addEventListener('input', () => this.#clearValidation('signupEmail', 'emailValidation'));
    this.shadowRoot
      .getElementById('signupPassword')
      ?.addEventListener('input', () => this.#validatePasswordStrength());
    this.shadowRoot
      .getElementById('signinEmail')
      ?.addEventListener('blur', () => this.#validateEmail('signinEmail', 'signinEmailValidation'));
    this.shadowRoot
      .getElementById('signinEmail')
      ?.addEventListener('input', () =>
        this.#clearValidation('signinEmail', 'signinEmailValidation')
      );

    // Forgot password
    this.shadowRoot.getElementById('forgotPasswordLink')?.addEventListener('click', e => {
      e.preventDefault();
      this.#showForgotPasswordModal();
    });

    this.shadowRoot
      .getElementById('cancelResetBtn')
      ?.addEventListener('click', () => this.#hideForgotPasswordModal());
    this.shadowRoot
      .getElementById('forgotPasswordForm')
      ?.addEventListener('submit', e => this.#handleForgotPassword(e));
  }

  #switchTab(tabName) {
    const tabs = this.shadowRoot.querySelectorAll('.auth-tab');
    const forms = this.shadowRoot.querySelectorAll('.auth-form');

    tabs.forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    forms.forEach(form => {
      if (form.id === `${tabName}Form`) {
        form.classList.add('active');
      } else {
        form.classList.remove('active');
      }
    });
  }

  async #handleAnonymousSignIn() {
    const btn = this.shadowRoot.getElementById('anonymousBtn');
    if (btn) btn.disabled = true;

    const { error, user } = await signInAnonymous();

    if (error) {
      log.error('Error signing in anonymously:', error);
      toastify('Error signing in. Please try again.', { variant: 'danger' });
      if (btn) btn.disabled = false;
    } else {
      toastify('Signed in successfully!', { variant: 'success' });
    }
  }

  async #handleSignIn(event) {
    event.preventDefault();

    const emailInput = this.shadowRoot.getElementById('signinEmail');
    const passwordInput = this.shadowRoot.getElementById('signinPassword');
    const errorEl = this.shadowRoot.getElementById('signinError');
    const btn = this.shadowRoot.getElementById('signinBtn');
    const btnText = btn?.querySelector('.btn-text');
    const btnSpinner = btn?.querySelector('.btn-spinner');
    const rememberMe = this.shadowRoot.getElementById('rememberMe');

    // Validate inputs before submission
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!this.#validateEmailFormat(email)) {
      this.#showValidationError(
        'signinEmail',
        'signinEmailValidation',
        'Please enter a valid email address'
      );
      return;
    }

    if (!password || password.length < 6) {
      if (errorEl) {
        errorEl.textContent = 'Please enter your password';
        errorEl.hidden = false;
      }
      return;
    }

    if (btn) {
      btn.disabled = true;
      if (btnText) btnText.hidden = true;
      if (btnSpinner) btnSpinner.hidden = false;
    }
    if (errorEl) errorEl.hidden = true;

    // Handle remember me (store in localStorage)
    if (rememberMe?.checked) {
      localStorage.setItem('rememberEmail', email);
    } else {
      localStorage.removeItem('rememberEmail');
    }

    const { error, user } = await signInWithEmail(email, password);

    if (error) {
      log.error('Error signing in:', error);
      if (errorEl) {
        errorEl.textContent = this.#getErrorMessage(error);
        errorEl.hidden = false;
      }
      if (btn) {
        btn.disabled = false;
        if (btnText) btnText.hidden = false;
        if (btnSpinner) btnSpinner.hidden = true;
      }
    } else {
      toastify('Signed in successfully!', { variant: 'success' });
      passwordInput.value = '';
      // Clear any validation errors
      this.#clearValidation('signinEmail', 'signinEmailValidation');
    }
  }

  async #handleSignUp(event) {
    event.preventDefault();

    const emailInput = this.shadowRoot.getElementById('signupEmail');
    const passwordInput = this.shadowRoot.getElementById('signupPassword');
    const displayNameInput = this.shadowRoot.getElementById('signupDisplayName');
    const errorEl = this.shadowRoot.getElementById('signupError');
    const btn = this.shadowRoot.getElementById('signupBtn');

    // Validate inputs before submission
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const displayName = displayNameInput.value.trim();

    if (!this.#validateEmailFormat(email)) {
      this.#showValidationError(
        'signupEmail',
        'emailValidation',
        'Please enter a valid email address'
      );
      return;
    }

    const passwordValidation = this.#validatePasswordStrengthValue(password);
    if (!passwordValidation.valid) {
      this.#showPasswordValidationError(passwordValidation.message);
      return;
    }

    if (btn) btn.disabled = true;
    if (errorEl) errorEl.hidden = true;

    const { error, user } = await createAccount(email, password, displayName);

    if (error) {
      log.error('Error creating account:', error);
      if (errorEl) {
        errorEl.textContent = this.#getErrorMessage(error);
        errorEl.hidden = false;
      }
      if (btn) btn.disabled = false;
    } else {
      toastify('Account created successfully!', { variant: 'success' });
      passwordInput.value = '';
      // Clear validation messages
      this.#clearValidation('signupEmail', 'emailValidation');
      this.#clearPasswordValidation();
    }
  }

  async #handleSignOut() {
    const btn = this.shadowRoot.getElementById('signOutBtn');
    if (btn) btn.disabled = true;

    const { error } = await signOut();

    if (error) {
      log.error('Error signing out:', error);
      toastify('Error signing out. Please try again.', { variant: 'danger' });
      if (btn) btn.disabled = false;
    } else {
      toastify('Signed out successfully', { variant: 'success' });
    }
  }

  #handleAuthStateChange(user) {
    if (user) {
      // User is signed in
      this.#authStatusEl?.removeAttribute('hidden');
      this.#authFormsEl?.setAttribute('hidden', '');

      const userIcon = this.shadowRoot.getElementById('userIcon');
      const userEmail = this.shadowRoot.getElementById('userEmail');
      const userType = this.shadowRoot.getElementById('userType');

      if (userIcon) {
        userIcon.textContent = user.email ? user.email[0].toUpperCase() : '?';
      }

      if (userEmail) {
        userEmail.textContent = user.email || 'Anonymous User';
      }

      if (userType) {
        userType.textContent = user.isAnonymous ? 'Anonymous Account' : 'Email Account';
      }

      // Emit custom event
      this.dispatchEvent(
        new CustomEvent('auth-state-changed', {
          bubbles: true,
          composed: true,
          detail: { user }
        })
      );
    } else {
      // User is signed out
      this.#authStatusEl?.setAttribute('hidden', '');
      this.#authFormsEl?.removeAttribute('hidden');

      // Emit custom event
      this.dispatchEvent(
        new CustomEvent('auth-state-changed', {
          bubbles: true,
          composed: true,
          detail: { user: null }
        })
      );
    }
  }

  #togglePasswordVisibility(inputId) {
    const input = this.shadowRoot.getElementById(inputId);
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  }

  #showForgotPasswordModal() {
    const modal = this.shadowRoot.getElementById('forgotPasswordModal');
    if (modal) {
      modal.hidden = false;
      // Pre-fill email if available
      const emailInput = this.shadowRoot.getElementById('signinEmail');
      const resetEmail = this.shadowRoot.getElementById('resetEmail');
      if (emailInput?.value && resetEmail) {
        resetEmail.value = emailInput.value;
      }
    }
  }

  #hideForgotPasswordModal() {
    const modal = this.shadowRoot.getElementById('forgotPasswordModal');
    if (modal) {
      modal.hidden = true;
      const form = this.shadowRoot.getElementById('forgotPasswordForm');
      if (form) form.reset();
      const errorEl = this.shadowRoot.getElementById('resetError');
      const successEl = this.shadowRoot.getElementById('resetSuccess');
      if (errorEl) errorEl.hidden = true;
      if (successEl) successEl.hidden = true;
    }
  }

  async #handleForgotPassword(event) {
    event.preventDefault();

    const emailInput = this.shadowRoot.getElementById('resetEmail');
    const errorEl = this.shadowRoot.getElementById('resetError');
    const successEl = this.shadowRoot.getElementById('resetSuccess');
    const btn = this.shadowRoot.getElementById('sendResetBtn');
    const btnText = btn?.querySelector('.btn-text');
    const btnSpinner = btn?.querySelector('.btn-spinner');

    if (btn) {
      btn.disabled = true;
      if (btnText) btnText.hidden = true;
      if (btnSpinner) btnSpinner.hidden = false;
    }
    if (errorEl) errorEl.hidden = true;
    if (successEl) successEl.hidden = true;

    const { error } = await resetPassword(emailInput.value);

    if (error) {
      log.error('Error sending password reset:', error);
      if (errorEl) {
        errorEl.textContent = this.#getErrorMessage(error);
        errorEl.hidden = false;
      }
      if (btn) {
        btn.disabled = false;
        if (btnText) btnText.hidden = false;
        if (btnSpinner) btnSpinner.hidden = true;
      }
    } else {
      if (successEl) {
        successEl.textContent = 'Password reset email sent! Check your inbox.';
        successEl.hidden = false;
      }
      toastify('Password reset email sent!', { variant: 'success' });
      setTimeout(() => {
        this.#hideForgotPasswordModal();
      }, 3000);
    }
  }

  #validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  #validateEmail(inputId, validationId) {
    const input = this.shadowRoot.getElementById(inputId);
    const validationEl = this.shadowRoot.getElementById(validationId);
    const email = input?.value.trim();

    if (!email) {
      this.#clearValidation(inputId, validationId);
      return false;
    }

    if (!this.#validateEmailFormat(email)) {
      this.#showValidationError(inputId, validationId, 'Please enter a valid email address');
      return false;
    }

    this.#showValidationSuccess(inputId, validationId);
    return true;
  }

  #validatePasswordStrength() {
    const passwordInput = this.shadowRoot.getElementById('signupPassword');
    const password = passwordInput?.value || '';
    const strengthBar = this.shadowRoot.getElementById('passwordStrengthBar');
    const strengthContainer = this.shadowRoot.getElementById('passwordStrength');
    const validationEl = this.shadowRoot.getElementById('passwordValidation');

    if (!password) {
      if (strengthContainer) strengthContainer.hidden = true;
      if (validationEl) validationEl.hidden = true;
      passwordInput?.classList.remove('input-error', 'input-success');
      return;
    }

    const validation = this.#validatePasswordStrengthValue(password);

    if (strengthContainer) {
      strengthContainer.hidden = false;
      if (strengthBar) {
        strengthBar.className = 'password-strength-bar';
        if (validation.strength === 'weak') {
          strengthBar.classList.add('weak');
        } else if (validation.strength === 'medium') {
          strengthBar.classList.add('medium');
        } else {
          strengthBar.classList.add('strong');
        }
      }
    }

    if (validationEl) {
      validationEl.hidden = false;
      validationEl.className = `validation-message ${validation.valid ? 'success' : 'error'}`;
      validationEl.textContent = validation.message;
    }

    if (passwordInput) {
      passwordInput.classList.remove('input-error', 'input-success');
      if (validation.valid) {
        passwordInput.classList.add('input-success');
      } else if (password.length > 0) {
        passwordInput.classList.add('input-error');
      }
    }
  }

  #validatePasswordStrengthValue(password) {
    if (password.length < 8) {
      return {
        valid: false,
        strength: 'weak',
        message: 'Password must be at least 8 characters long'
      };
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasLetter || !hasNumber) {
      return {
        valid: false,
        strength: 'weak',
        message: 'Password must contain both letters and numbers'
      };
    }

    const strength =
      hasSpecial && password.length >= 12 ? 'strong' : password.length >= 10 ? 'medium' : 'weak';

    return {
      valid: true,
      strength,
      message:
        strength === 'strong'
          ? 'Strong password ✓'
          : strength === 'medium'
            ? 'Good password ✓'
            : 'Password is acceptable ✓'
    };
  }

  #showValidationError(inputId, validationId, message) {
    const input = this.shadowRoot.getElementById(inputId);
    const validationEl = this.shadowRoot.getElementById(validationId);

    if (input) {
      input.classList.remove('input-success');
      input.classList.add('input-error');
    }

    if (validationEl) {
      validationEl.hidden = false;
      validationEl.className = 'validation-message error';
      validationEl.textContent = message;
    }
  }

  #showValidationSuccess(inputId, validationId) {
    const input = this.shadowRoot.getElementById(inputId);
    const validationEl = this.shadowRoot.getElementById(validationId);

    if (input) {
      input.classList.remove('input-error');
      input.classList.add('input-success');
    }

    if (validationEl) {
      validationEl.hidden = true;
    }
  }

  #clearValidation(inputId, validationId) {
    const input = this.shadowRoot.getElementById(inputId);
    const validationEl = this.shadowRoot.getElementById(validationId);

    if (input) {
      input.classList.remove('input-error', 'input-success');
    }

    if (validationEl) {
      validationEl.hidden = true;
    }
  }

  #clearPasswordValidation() {
    const passwordInput = this.shadowRoot.getElementById('signupPassword');
    const strengthContainer = this.shadowRoot.getElementById('passwordStrength');
    const validationEl = this.shadowRoot.getElementById('passwordValidation');

    if (passwordInput) {
      passwordInput.classList.remove('input-error', 'input-success');
    }
    if (strengthContainer) strengthContainer.hidden = true;
    if (validationEl) validationEl.hidden = true;
  }

  #showPasswordValidationError(message) {
    const validationEl = this.shadowRoot.getElementById('passwordValidation');
    const passwordInput = this.shadowRoot.getElementById('signupPassword');

    if (passwordInput) {
      passwordInput.classList.add('input-error');
    }

    if (validationEl) {
      validationEl.hidden = false;
      validationEl.className = 'validation-message error';
      validationEl.textContent = message;
    }
  }

  #getErrorMessage(error) {
    // Don't show "Firebase not configured" errors to users
    if (error.message && error.message.includes('Firebase not configured')) {
      return 'Unable to connect. Please check your connection and try again.';
    }

    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already in use. Please sign in or use a different email.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 8 characters with letters and numbers.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        // Filter out Firebase configuration errors
        const errorMsg = error.message || 'An error occurred. Please try again.';
        if (errorMsg.includes('Firebase not configured')) {
          return 'Unable to connect. Please check your connection and try again.';
        }
        return errorMsg;
    }
  }

  static defineCustomElement(elementName = 'bs-auth') {
    if (typeof window !== 'undefined' && !window.customElements.get(elementName)) {
      window.customElements.define(elementName, BSAuth);
    }
  }
}

BSAuth.defineCustomElement();

export { BSAuth };
