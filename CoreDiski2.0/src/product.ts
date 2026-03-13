import './product.css';
import './nav-brand.css';
import { requireSignedIn } from './auth';
import { renderNav } from './nav';
import { cartRepository, shirtRepository, wishlistRepository } from './repository';
import type { Shirt, ShirtSize } from './types';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container not found');
}

const params = new URLSearchParams(window.location.search);
const shirtId = params.get('id') ?? '';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const shirtCard = (shirt: Shirt) => `
  <article class="mini-card">
    <a class="mini-link" href="/product.html?id=${encodeURIComponent(shirt.id)}">
      <img src="${shirt.imageUrl}" alt="${shirt.title} ${shirt.season} ${shirt.variant}" loading="lazy" />
      <h4>${shirt.title}</h4>
      <p>${shirt.season} ${shirt.variant}</p>
      <strong>${money.format(shirt.price)}</strong>
    </a>
  </article>
`;

const renderNotFound = () => {
  app.innerHTML = `
    <div class="product-page">
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
      <main class="not-found">
        <h1>Shirt not found</h1>
        <p>This shirt may have been removed or the link is invalid.</p>
        <a href="/shop.html">Back to Shop</a>
      </main>
    </div>
  `;
};

const renderProduct = async () => {
  const shirt = await shirtRepository.getById(shirtId);

  if (!shirt) {
    renderNotFound();
    return;
  }

  const related = (await shirtRepository.list())
    .filter((item) => item.id !== shirt.id)
    .slice(0, 5);

  app.innerHTML = `
    <div class="product-page">
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

      <main class="content">
        <p class="crumbs"><a href="/">Home</a> / <a href="/shop.html">${shirt.clubOrNation}</a> / ${shirt.title} ${shirt.season} ${shirt.variant} Shirt</p>

        <section class="top-section">
          <div class="gallery">
            <img class="hero-image" src="${shirt.imageUrl}" alt="${shirt.title} ${shirt.season} ${shirt.variant}" />
            <div class="thumbs">
              <img src="${shirt.imageUrl}" alt="Front view" />
              <img src="${shirt.imageUrl}" alt="Back view" />
              <img src="${shirt.imageUrl}" alt="Close-up" />
              <img src="${shirt.imageUrl}" alt="Collar detail" />
            </div>
          </div>

          <div class="product-meta">
            <h1>${shirt.title}</h1>
            <h2>${shirt.season} ${shirt.variant} Shirt</h2>
            <ul>
              <li><strong>Season:</strong> ${shirt.season}</li>
              <li><strong>League:</strong> Classic Archive</li>
              <li><strong>Condition:</strong> Excellent</li>
              <li><strong>Authenticity:</strong> Verified</li>
            </ul>
            <p class="price">${money.format(shirt.price)}</p>
            <p class="shipping">Free worldwide shipping</p>

            <div class="sizes">
              <span>Size:</span>
              <button type="button" data-size="S">S</button>
              <button type="button" class="active" data-size="M">M</button>
              <button type="button" data-size="L">L</button>
              <button type="button" data-size="XL">XL</button>
            </div>

            <p id="selection-status" class="selection-status">Selected size: M</p>
            <button type="button" class="primary" id="add-to-cart">Add To Cart</button>
            <button type="button" class="secondary" id="add-to-wishlist">♡ Add to Wishlist</button>
          </div>
        </section>

        <section class="description">
          <div>
            <h3>Description</h3>
            <p>The ${shirt.title} ${shirt.season} ${shirt.variant.toLowerCase()} shirt is one of the standout kits in football history, celebrated by collectors for its story and design.</p>
            <p><strong>Verified Authentic:</strong> Each jersey is professionally inspected and authenticated before listing.</p>
          </div>
          <img src="${shirt.imageUrl}" alt="${shirt.title} detail" />
        </section>

        <section class="related">
          <h3>You May Also Like</h3>
          <div class="related-grid">${related.map(shirtCard).join('')}</div>
        </section>
      </main>
    </div>
  `;

  let selectedSize: ShirtSize = 'M';
  const status = document.querySelector<HTMLParagraphElement>('#selection-status');
  const sizeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.sizes button[data-size]'));

  sizeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextSize = button.dataset.size as ShirtSize | undefined;

      if (!nextSize) {
        return;
      }

      selectedSize = nextSize;
      sizeButtons.forEach((sizeButton) => sizeButton.classList.remove('active'));
      button.classList.add('active');

      if (status) {
        status.textContent = `Selected size: ${selectedSize}`;
      }
    });
  });

  const addToCartButton = document.querySelector<HTMLButtonElement>('#add-to-cart');
  addToCartButton?.addEventListener('click', async () => {
    const signedIn = await requireSignedIn();

    if (!signedIn) {
      return;
    }

    await cartRepository.add(shirt.id, selectedSize);
    window.location.href = '/cart.html';
  });

  const addToWishlistButton = document.querySelector<HTMLButtonElement>('#add-to-wishlist');
  addToWishlistButton?.addEventListener('click', async () => {
    const signedIn = await requireSignedIn();

    if (!signedIn) {
      return;
    }

    await wishlistRepository.add(shirt.id, selectedSize);
    window.location.href = '/wishlist.html';
  });
};

void renderProduct();
