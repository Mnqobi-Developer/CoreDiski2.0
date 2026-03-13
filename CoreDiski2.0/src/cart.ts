import './cart.css';
import './nav-brand.css';
import { requireSignedIn } from './auth';
import { renderNav } from './nav';
import { cartRepository, shirtRepository } from './repository';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container not found');
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const renderPage = async () => {
  const signedIn = await requireSignedIn();

  if (!signedIn) {
    return;
  }

  const cartItems = await cartRepository.list();
  const resolved = await Promise.all(
    cartItems.map(async (item) => ({
      item,
      shirt: await shirtRepository.getById(item.shirtId),
    })),
  );

  const validItems = resolved.filter((entry) => entry.shirt);
  const subtotal = validItems.reduce((sum, entry) => sum + (entry.shirt?.price ?? 0) * entry.item.quantity, 0);

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

      <main class="cart-page">
        <p class="crumbs"><a href="/">Home</a> / Shopping Cart</p>
        <h1>Shopping Cart</h1>

        <section class="cart-shell">
          ${
            validItems.length
              ? `
              <div class="cart-items">
                ${validItems
                  .map(
                    ({ item, shirt }) => `
                    <article class="cart-item" data-item-id="${item.id}">
                      <img src="${shirt?.imageUrl}" alt="${shirt?.title}" />
                      <div class="item-main">
                        <h3>${shirt?.title}</h3>
                        <p>${shirt?.season} ${shirt?.variant}</p>
                        <p>Size: <strong>${item.size}</strong></p>
                        <button class="link-button" data-action="remove" data-item-id="${item.id}">Remove</button>
                      </div>
                      <div class="item-price">${money.format((shirt?.price ?? 0) * item.quantity)}</div>
                      <div class="qty-wrap">
                        <button data-action="dec" data-item-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button data-action="inc" data-item-id="${item.id}">+</button>
                      </div>
                    </article>
                  `,
                  )
                  .join('')}
              </div>

              <div class="summary">
                <p><span>Subtotal</span><strong>${money.format(subtotal)}</strong></p>
                <p><span>Shipping</span><strong>Free</strong></p>
                <p class="total"><span>Total</span><strong>${money.format(subtotal)}</strong></p>
                <button class="checkout" type="button">Proceed to Checkout</button>
                <button class="clear" type="button" id="clear-cart">Clear Cart</button>
              </div>
            `
              : `
              <div class="cart-empty">
                <p>Your cart is empty.</p>
                <div class="button-row">
                  <a href="/shop.html">Continue Shopping</a>
                </div>
              </div>
            `
          }
        </section>
      </main>
    </div>
  `;

  app.querySelector('.checkout')?.addEventListener('click', () => {
    window.location.href = '/checkout.html';
  });

  app.querySelector('#clear-cart')?.addEventListener('click', async () => {
    await cartRepository.clear();
    await renderPage();
  });

  app.querySelectorAll<HTMLButtonElement>('[data-action="remove"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const itemId = button.dataset.itemId;

      if (!itemId) {
        return;
      }

      await cartRepository.remove(itemId);
      await renderPage();
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-action="inc"], [data-action="dec"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const itemId = button.dataset.itemId;
      const item = cartItems.find((entry) => entry.id === itemId);

      if (!itemId || !item) {
        return;
      }

      const nextQuantity = button.dataset.action === 'inc' ? item.quantity + 1 : item.quantity - 1;
      await cartRepository.updateQuantity(itemId, nextQuantity);
      await renderPage();
    });
  });
};

void renderPage();
