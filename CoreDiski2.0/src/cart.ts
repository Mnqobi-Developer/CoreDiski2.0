import './cart.css';
import { renderNav } from './nav';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container not found');
}

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

    <main class="cart-page">
      <p class="crumbs"><a href="/">Home</a> / Shopping Cart</p>
      <h1>Shopping Cart</h1>

      <section class="cart-shell">
        <div class="cart-empty">
          <p>Your selected shirt is now in your cart.</p>
          <p>Continue shopping or proceed to checkout when you're ready.</p>
          <div class="button-row">
            <a href="/shop.html">Continue Shopping</a>
            <a href="/">Back Home</a>
          </div>
        </div>
      </section>
    </main>
  </div>
`;
