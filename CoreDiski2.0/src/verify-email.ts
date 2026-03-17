import './auth-pages.css';
import './nav-brand.css';
import { renderNav } from './nav';
import { authRepository } from './repository';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container not found');
}

const params = new URLSearchParams(window.location.search);
const token = params.get('token') || '';

const render = async () => {
  const result = await authRepository.verifyEmail(token);
  const success = Boolean(result.user);

  app.innerHTML = `
    <div>
      <header class="topbar">
        <div class="brand">
          <a class="brand-home" href="/#hero" aria-label="Go to Core Diski homepage hero section">
          <img class="brand-logo" src="/logo Core Diski.png" alt="Core Diski logo" />
          </a>
          <div>
            <p class="brand-name">CORE DISKI</p>
            <p class="brand-tag">Authentic Football Shirts</p>
          </div>
        </div>
        <nav class="nav-icons">${renderNav(window.location.pathname)}</nav>
      </header>

      <main class="auth-wrap">
        <section class="auth-card">
          <h1>Email Verification</h1>
          <p class="status ${success ? 'success' : 'error'}">${success ? 'Your email has been verified. You are now signed in.' : result.error || 'Unable to verify your account.'}</p>
          <p class="meta-link">
            <a href="${success ? '/profile.html' : '/signin.html'}">${success ? 'Continue to my profile' : 'Back to sign in'}</a>
          </p>
        </section>
      </main>
    </div>
  `;
};

void render();
