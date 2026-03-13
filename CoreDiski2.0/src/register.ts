import './auth-pages.css';
import { getRedirectTarget } from './auth';
import { renderNav } from './nav';
import { authRepository } from './repository';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container not found');
}

const redirectTarget = getRedirectTarget();

app.innerHTML = `
  <div>
    <header class="topbar">
      <div class="brand">
        <div class="brand-logo">CD</div>
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
            <input id="password" type="password" required minlength="8" placeholder="********" />
          </label>
          <button type="submit">Create Account</button>
        </form>
        <p id="status" class="status"></p>
        <p class="meta-link">Already have an account? <a href="/signin.html?redirect=${encodeURIComponent(redirectTarget)}">Sign In</a></p>
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
    status.textContent = 'Account created. Redirecting...';
  }

  window.location.href = redirectTarget;
});
