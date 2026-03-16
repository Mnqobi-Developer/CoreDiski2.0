import './auth-pages.css';
import './nav-brand.css';
import { renderNav } from './nav';
import { authRepository } from './repository';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container not found');
}

app.innerHTML = `
  <div>
    <header class="topbar">
      <div class="brand">
        <a class="brand-home" href="/#hero" aria-label="Go to Core Diski homepage hero section"><img class="brand-logo" src="/logo.svg" alt="Core Diski logo" /></a>
        <div>
          <p class="brand-name">CORE DISKI</p>
          <p class="brand-tag">Authentic Football Shirts</p>
        </div>
      </div>
      <nav class="nav-icons">${renderNav(window.location.pathname)}</nav>
    </header>

    <main class="auth-wrap">
      <section class="auth-card">
        <h1>Create Your Account</h1>
        <p>Register before adding items to cart or purchasing.</p>
        <form id="register-form" class="auth-form">
          <label>Full Name
            <input id="full-name" type="text" required minlength="2" placeholder="John Doe" />
          </label>
          <label>Email Address
            <input id="email" type="email" required placeholder="you@email.com" />
          </label>
          <label>Password
            <div class="password-field">
              <input id="password" type="password" required minlength="8" placeholder="********" />
              <button id="toggle-password" class="password-toggle" type="button" aria-label="Show password" aria-pressed="false">👁</button>
            </div>
          </label>
          <button type="submit">Create Account</button>
        </form>
        <p id="status" class="status"></p>
        <p class="meta-link">Already have an account? <a href="/signin.html">Sign In</a></p>
      </section>
    </main>
  </div>
`;

const form = document.querySelector<HTMLFormElement>('#register-form');
const fullName = document.querySelector<HTMLInputElement>('#full-name');
const email = document.querySelector<HTMLInputElement>('#email');
const password = document.querySelector<HTMLInputElement>('#password');
const status = document.querySelector<HTMLParagraphElement>('#status');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const result = await authRepository.register(fullName?.value ?? '', email?.value ?? '', password?.value ?? '');

  if (result.error) {
    if (status) {
      status.className = 'status error';
      status.textContent = result.error;
    }
    return;
  }

  if (status) {
    status.className = 'status success';
    status.textContent = 'Account created. Please verify your email via the link sent before signing in.';
  }

  setTimeout(() => {
    window.location.href = `/signin.html?email=${encodeURIComponent(email?.value ?? '')}`;
  }, 900);
});

const togglePassword = document.querySelector<HTMLButtonElement>('#toggle-password');

togglePassword?.addEventListener('click', () => {
  if (!password) {
    return;
  }

  const showing = password.type === 'text';
  password.type = showing ? 'password' : 'text';
  togglePassword.setAttribute('aria-pressed', String(!showing));
  togglePassword.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
});
