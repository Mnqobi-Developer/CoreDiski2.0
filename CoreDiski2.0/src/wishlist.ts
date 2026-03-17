import './wishlist.css';
import './nav-brand.css';
import { requireSignedIn } from './auth';
import { renderNav } from './nav';
import { cartRepository, shirtRepository, wishlistRepository } from './repository';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container not found');
}

const money = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 });

const renderPage = async () => {
  const signedIn = await requireSignedIn();

  if (!signedIn) {
    return;
  }

  const items = await wishlistRepository.list();
  const resolved = await Promise.all(
    items.map(async (item) => ({
      item,
      shirt: await shirtRepository.getById(item.shirtId),
    })),
  );

  const validItems = resolved.filter((entry) => entry.shirt);

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

      <main class="wishlist-page">
        <p class="crumbs"><a href="/">Home</a> / Wishlist</p>
        <h1>Wishlist</h1>
        <section class="wishlist-shell">
          ${
            validItems.length
              ? validItems
                  .map(
                    ({ item, shirt }) => `
                    <article class="wishlist-item">
                      <img src="${shirt?.imageUrl}" alt="${shirt?.title}" />
                      <div>
                        <h3>${shirt?.title}</h3>
                        <p>${shirt?.season} ${shirt?.variant}</p>
                        <p>Size: <strong>${item.size}</strong></p>
                        <p class="price">${money.format(shirt?.price ?? 0)}</p>
                        <div class="actions">
                          <button data-action="move" data-item-id="${item.id}">Add to Cart</button>
                          <button data-action="remove" data-item-id="${item.id}">Remove</button>
                        </div>
                      </div>
                    </article>
                  `,
                  )
                  .join('')
              : '<p class="empty">Your wishlist is empty.</p>'
          }
        </section>
      </main>
    </div>
  `;

  app.querySelectorAll<HTMLButtonElement>('[data-action="remove"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const itemId = button.dataset.itemId;
      if (!itemId) {
        return;
      }

      await wishlistRepository.remove(itemId);
      await renderPage();
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-action="move"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const itemId = button.dataset.itemId;
      const item = items.find((entry) => entry.id === itemId);

      if (!itemId || !item) {
        return;
      }

      await cartRepository.add(item.shirtId, item.size);
      await wishlistRepository.remove(item.id);
      window.location.href = '/cart.html';
    });
  });
};

void renderPage();
