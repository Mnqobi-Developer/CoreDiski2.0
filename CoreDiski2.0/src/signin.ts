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
        <h1>Welcome Back</h1>
        <p>Sign in to continue shopping.</p>
        <form id="signin-form" class="auth-form">
          <label>Email Address
            <input id="email" type="email" required placeholder="you@email.com" />
          </label>
          <label>Password
            <input id="password" type="password" required minlength="8" placeholder="********" />
          </label>
          <button type="submit">Sign In</button>
        </form>
        <p id="status" class="status"></p>
        <p class="meta-link">Don't have an account? <a href="/register.html?redirect=${encodeURIComponent(redirectTarget)}">Create Account</a></p>
      </section>
    </main>
  </div>
`;

const form = document.querySelector<HTMLFormElement>('#signin-form');
const email = document.querySelector<HTMLInputElement>('#email');
const password = document.querySelector<HTMLInputElement>('#password');
const status = document.querySelector<HTMLParagraphElement>('#status');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const result = await authRepository.signIn(email?.value ?? '', password?.value ?? '');

  if (result.error) {
    if (status) {
      status.className = 'status error';
      status.textContent = result.error;
    }
    return;
  }

  if (status) {
    status.className = 'status success';
    status.textContent = 'Signed in successfully. Redirecting...';
  }

  window.location.href = redirectTarget;
});
