import './shop.css';
import './nav-brand.css';
import { shirtRepository } from './repository';
import { renderNav } from './nav';
import type { Shirt } from './types';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container not found');
}

app.innerHTML = `
  <div class="shop-page">
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
      <nav class="nav-icons">
        ${renderNav(window.location.pathname)}
      </nav>
    </header>

    <main class="shop-layout">
      <aside class="filters-panel">
        <h2>Filters</h2>
        <div class="filter-block">
          <h3>Team</h3>
          <div id="team-filters" class="filter-options"></div>
        </div>
        <div class="filter-block">
          <h3>Era</h3>
          <select id="era-filter" class="control">
            <option value="all">All eras</option>
            <option value="1990">1990s</option>
            <option value="2000">2000s</option>
            <option value="2010">2010s</option>
          </select>
        </div>
        <button id="reset-all" class="reset-all" type="button">Reset all</button>
      </aside>

      <section class="results-panel">
        <p class="crumbs"><a href="/">Home</a> / Shop</p>
        <h1>Search Results</h1>
        <p class="intro">Explore our collection of authentic, verified football shirts from every club and nation worldwide.</p>

        <div class="toolbar">
          <input id="search-input" class="control search" type="search" placeholder="Search clubs, players, seasons, leagues..." />
          <select id="price-filter" class="control">
            <option value="all">R0 - R500</option>
            <option value="0-200">R0 - R200</option>
            <option value="201-300">R201 - R300</option>
            <option value="301-500">R301 - R500</option>
          </select>
          <select id="sort-filter" class="control">
            <option value="popular">Most Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Added</option>
          </select>
          <button id="reset-search" class="ghost" type="button">Reset</button>
        </div>

        <p id="results-count" class="count"></p>
        <div id="shirts-grid" class="shirts-grid"></div>
      </section>
    </main>
  </div>
`;

const shirtsGrid = document.querySelector<HTMLDivElement>('#shirts-grid');
const teamFilters = document.querySelector<HTMLDivElement>('#team-filters');
const searchInput = document.querySelector<HTMLInputElement>('#search-input');
const priceFilter = document.querySelector<HTMLSelectElement>('#price-filter');
const sortFilter = document.querySelector<HTMLSelectElement>('#sort-filter');
const eraFilter = document.querySelector<HTMLSelectElement>('#era-filter');
const resetAll = document.querySelector<HTMLButtonElement>('#reset-all');
const resetSearch = document.querySelector<HTMLButtonElement>('#reset-search');
const resultsCount = document.querySelector<HTMLParagraphElement>('#results-count');

const money = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 });

const cardTemplate = (shirt: Shirt) => `
  <article class="shirt-card">
    <button class="like" type="button" aria-label="Save ${shirt.title}">♡</button>
    <a class="shirt-link" href="/product.html?id=${encodeURIComponent(shirt.id)}">
      <img src="${shirt.imageUrl}" alt="${shirt.title} ${shirt.season} ${shirt.variant}" loading="lazy" />
      <h4>${shirt.title}</h4>
      <p>${shirt.season} ${shirt.variant}</p>
      <strong>${money.format(shirt.price)}</strong>
    </a>
  </article>
`;

const parseSeasonYear = (season: string): number => {
  const matched = season.match(/\d{4}/);
  return matched ? Number(matched[0]) : 0;
};

const inSelectedEra = (shirt: Shirt, era: string) => {
  if (era === 'all') return true;
  const year = parseSeasonYear(shirt.season);
  return year >= Number(era) && year < Number(era) + 10;
};

const inPriceRange = (shirt: Shirt, range: string) => {
  if (range === 'all') return true;
  const [min, max] = range.split('-').map(Number);
  return shirt.price >= min && shirt.price <= max;
};

const selectedTeams = () =>
  Array.from(document.querySelectorAll<HTMLInputElement>('input[name="team-filter"]:checked')).map((el) =>
    el.value.toLowerCase(),
  );

const renderTeamFilters = async () => {
  if (!teamFilters) return;
  const shirts = await shirtRepository.list();
  const teams = [...new Set(shirts.map((shirt) => shirt.clubOrNation))].sort((a, b) => a.localeCompare(b));

  teamFilters.innerHTML = teams
    .map(
      (team) => `<label><input type="checkbox" name="team-filter" value="${team}" /> ${team}</label>`,
    )
    .join('');

  document.querySelectorAll<HTMLInputElement>('input[name="team-filter"]').forEach((input) => {
    input.addEventListener('change', () => {
      void renderShirts();
    });
  });
};

const applySort = (shirts: Shirt[], sort: string) => {
  const copy = [...shirts];
  if (sort === 'price-asc') return copy.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return copy.sort((a, b) => b.price - a.price);
  if (sort === 'newest') return copy.reverse();
  return copy;
};

const renderShirts = async () => {
  if (!shirtsGrid) return;
  const query = searchInput?.value?.trim() ?? '';
  const teams = selectedTeams();
  const price = priceFilter?.value ?? 'all';
  const era = eraFilter?.value ?? 'all';
  const sort = sortFilter?.value ?? 'popular';

  const shirts = await shirtRepository.list(query);
  const filtered = shirts.filter((shirt) => {
    const teamMatch = !teams.length || teams.includes(shirt.clubOrNation.toLowerCase());
    return teamMatch && inPriceRange(shirt, price) && inSelectedEra(shirt, era);
  });

  const sorted = applySort(filtered, sort);

  if (resultsCount) {
    resultsCount.textContent = `${sorted.length} results`;
  }

  shirtsGrid.innerHTML = sorted.length ? sorted.map(cardTemplate).join('') : '<p class="empty">No shirts matched your filters.</p>';
};

const resetFilters = () => {
  if (searchInput) searchInput.value = '';
  if (priceFilter) priceFilter.value = 'all';
  if (sortFilter) sortFilter.value = 'popular';
  if (eraFilter) eraFilter.value = 'all';
  document.querySelectorAll<HTMLInputElement>('input[name="team-filter"]').forEach((checkbox) => {
    checkbox.checked = false;
  });
  void renderShirts();
};

[searchInput, priceFilter, sortFilter, eraFilter].forEach((control) => {
  control?.addEventListener('input', () => {
    void renderShirts();
  });
  control?.addEventListener('change', () => {
    void renderShirts();
  });
});

resetAll?.addEventListener('click', resetFilters);
resetSearch?.addEventListener('click', resetFilters);

void (async () => {
  await renderTeamFilters();
  await renderShirts();
})();
