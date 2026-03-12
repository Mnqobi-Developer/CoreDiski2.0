import './style.css';
import { popularQueries } from './data';
import { newsletterRepository, shirtRepository } from './repository';
import { renderNav } from './nav';
import type { Shirt } from './types';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container not found');
}

app.innerHTML = `
  <div class="page">
    <header class="topbar">
      <div class="brand">
        <div class="brand-logo">CD</div>
        <div>
          <p class="brand-name">CORE DISKI</p>
          <p class="brand-tag">Authentic Football Shirts</p>
        </div>
      </div>
      <nav class="nav-icons">
        ${renderNav(window.location.pathname)}
      </nav>
    </header>

    <main class="content">
      <section class="hero">
        <h1>Authentic Football Shirts</h1>
        <p>Discover rare, verified jerseys from every club and nation<br/>Heritage. Authenticity. Passion.</p>
        <form id="search-form" class="search-row">
          <input id="search-input" type="search" placeholder="Search teams, leagues, or players..." />
          <button type="submit">Search</button>
        </form>
        <p class="popular">Popular: ${popularQueries
          .map((query) => `<button class="popular-link" data-query="${query}">${query}</button>`)
          .join(' ')}</p>
      </section>

      <section class="featured">
        <h2>Featured</h2>
        <p>Explore some of our most sought-after authentic football shirts.</p>
        <div id="shirts-grid" class="shirts-grid"></div>
      </section>

      <section class="about">
        <div>
          <h3>About Us</h3>
          <p>Welcome to Core Diski, the home for collectors of authentic, rare, and classic football shirts. Our passion is to bring you the most sought-after, verified jerseys from legendary clubs and national teams.</p>
          <button type="button">Learn More</button>
        </div>
        <div class="about-image" aria-hidden="true">Historic Shirt Archive</div>
      </section>

      <section class="newsletter">
        <h3>Stay in the Know</h3>
        <p>Subscribe to our newsletter for the latest arrivals, special offers, and exclusive content.</p>
        <form id="newsletter-form" class="newsletter-row">
          <input id="newsletter-input" type="email" placeholder="Enter your email address" required />
          <button type="submit">Subscribe</button>
        </form>
        <p id="newsletter-message" class="status"></p>
      </section>
    </main>
  </div>
  `;

const shirtsGrid = document.querySelector<HTMLDivElement>('#shirts-grid');
const searchForm = document.querySelector<HTMLFormElement>('#search-form');
const searchInput = document.querySelector<HTMLInputElement>('#search-input');
const newsletterForm = document.querySelector<HTMLFormElement>('#newsletter-form');
const newsletterInput = document.querySelector<HTMLInputElement>('#newsletter-input');
const newsletterMessage = document.querySelector<HTMLParagraphElement>('#newsletter-message');

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const shirtCard = (shirt: Shirt) => `
  <article class="shirt-card">
    <button class="like" type="button" aria-label="Save ${shirt.title}">♡</button>
    <img src="${shirt.imageUrl}" alt="${shirt.title} ${shirt.season} ${shirt.variant}" loading="lazy" />
    <h4>${shirt.title}</h4>
    <p>${shirt.season} ${shirt.variant}</p>
    <strong>${money.format(shirt.price)}</strong>
  </article>
`;

const renderShirts = async (search = '') => {
  if (!shirtsGrid) {
    return;
  }

  const shirts = await shirtRepository.list(search);
  shirtsGrid.innerHTML = shirts.length
    ? shirts.map(shirtCard).join('')
    : '<p class="status">No shirts found for that query.</p>';
};

searchForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  await renderShirts(searchInput?.value ?? '');
});

document.querySelectorAll<HTMLButtonElement>('.popular-link').forEach((button) => {
  button.addEventListener('click', async () => {
    if (searchInput) {
      searchInput.value = button.dataset.query ?? '';
    }
    await renderShirts(searchInput?.value ?? '');
  });
});

newsletterForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!newsletterInput?.value) {
    return;
  }

  await newsletterRepository.subscribe(newsletterInput.value);
  newsletterInput.value = '';
  if (newsletterMessage) {
    newsletterMessage.textContent = 'Thanks! You are now subscribed.';
  }
});
void renderShirts();