import './auth-pages.css';
import './nav-brand.css';
import { getRedirectTarget } from './auth';
import { renderNav } from './nav';
import { authRepository } from './repository';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container not found');
}

const redirectTarget = getRedirectTarget();
const prefillEmail = new URLSearchParams(window.location.search).get('email') || '';

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
        <h1>Welcome Back</h1>
        <p>Sign in to continue shopping.</p>
        <form id="signin-form" class="auth-form">
          <label>Email Address
            <input id="email" type="email" required placeholder="you@email.com" value="${prefillEmail}" />
          </label>
          <label>Password
            <input id="password" type="password" required minlength="8" placeholder="********" />
          </label>
          <button type="submit">Sign In</button>
        </form>
        <p id="status" class="status"></p>
        <button id="resend-verification" class="resend-link" type="button">Resend verification email</button>
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

  const target = result.user?.isAdmin && redirectTarget === '/' ? '/admin.html' : redirectTarget;
  window.location.href = target;
});

const resendButton = document.querySelector<HTMLButtonElement>('#resend-verification');

resendButton?.addEventListener('click', async () => {
  const targetEmail = email?.value ?? '';

  if (!targetEmail) {
    if (status) {
      status.className = 'status error';
      status.textContent = 'Enter your email first, then resend verification.';
    }
    return;
  }

  const result = await authRepository.resendVerificationEmail(targetEmail);

  if (result.error) {
    if (status) {
      status.className = 'status error';
      status.textContent = result.error;
    }
    return;
  }

  if (status) {
    status.className = 'status success';
    status.textContent = 'Verification email sent. Check your inbox.';
  }
});
