import './admin.css';
import { requireSignedIn } from './auth';
import { authRepository, shirtRepository } from './repository';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container not found');
}

const navItems = [
  { href: '/admin.html', label: 'Dashboard' },
  { href: '/admin-products.html', label: 'Products' },
  { href: '/admin-orders.html', label: 'Orders' },
  { href: '/admin-customers.html', label: 'Customers' },
  { href: '/admin-categories.html', label: 'Categories' },
  { href: '/admin-analytics.html', label: 'Analytics' },
  { href: '/admin-settings.html', label: 'Settings' },
];

const secondaryNav = [
  { href: '/', label: 'Home' },
  { href: '/shop.html', label: 'Main Website' },
  { href: '/profile.html', label: 'Contact Support' },
];

const pageTitleMap: Record<string, string> = {
  '/admin.html': 'Dashboard',
  '/admin-products.html': 'Products',
  '/admin-orders.html': 'Orders',
  '/admin-customers.html': 'Customers',
  '/admin-categories.html': 'Categories',
  '/admin-analytics.html': 'Analytics',
  '/admin-settings.html': 'Settings',
};

const renderDashboard = async () => {
  const shirts = await shirtRepository.list();
  const totalProducts = shirts.length;
  const totalOrders = 1524;
  const totalCustomers = 980;
  const outOfStock = 5;
  const featuredRows = shirts.slice(0, 5);

  return `
    <h1 class="section-title">Dashboard</h1>
    <section class="metrics">
      <article class="metric-card"><p class="label">Total Products</p><p class="value">${totalProducts}</p></article>
      <article class="metric-card"><p class="label">Total Orders</p><p class="value">${totalOrders.toLocaleString()}</p></article>
      <article class="metric-card"><p class="label">Total Customers</p><p class="value">${totalCustomers}</p></article>
      <article class="metric-card"><p class="label">Out of Stock</p><p class="value">${outOfStock}</p></article>
    </section>

    <section class="panel">
      <h2 class="panel-title">Recent Products</h2>
      <table class="table">
        <thead>
          <tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${featuredRows
            .map(
              (shirt, index) => `
                <tr>
                  <td><strong>${shirt.title}</strong><br/><small>${shirt.season} ${shirt.variant}</small></td>
                  <td>$${shirt.price}</td>
                  <td>${Math.max(6, 26 - index * 3)}</td>
                  <td><span class="status-pill active">Active</span></td>
                </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </section>

    <section class="simple-grid">
      <article class="panel">
        <h2 class="panel-title">Recent Orders</h2>
        <table class="table">
          <tbody>
            <tr><td>#10204</td><td>Mark Johnson</td><td>Today</td></tr>
            <tr><td>#10203</td><td>Emma Wilson</td><td>Yesterday</td></tr>
            <tr><td>#10202</td><td>Gregory Lewis</td><td>April 22</td></tr>
            <tr><td>#10201</td><td>Laura White</td><td>April 20</td></tr>
          </tbody>
        </table>
      </article>

      <article class="panel">
        <h2 class="panel-title">Order Status</h2>
        <table class="table">
          <tbody>
            <tr><td>#10204</td><td>Mark Johnson</td><td><span class="status-pill pending">Pending</span></td></tr>
            <tr><td>#10203</td><td>Emma Wilson</td><td><span class="status-pill shipped">Shipped</span></td></tr>
            <tr><td>#10202</td><td>Gregory Lewis</td><td><span class="status-pill pending">Pending</span></td></tr>
            <tr><td>#10201</td><td>Laura White</td><td><span class="status-pill completed">Completed</span></td></tr>
          </tbody>
        </table>
      </article>
    </section>
  `;
};

const renderSection = async (pathname: string) => {
  if (pathname === '/admin.html' || pathname === '/admin') {
    return renderDashboard();
  }

  const heading = pageTitleMap[pathname] ?? 'Admin';

  return `
    <h1 class="section-title">${heading}</h1>
    <section class="simple-grid">
      <article class="simple-card">
        <h2>Overview</h2>
        <p>Manage ${heading.toLowerCase()} from this section of the admin portal.</p>
      </article>
      <article class="simple-card">
        <h2>Quick Action</h2>
        <p>Use this page to add, edit, and track ${heading.toLowerCase()} records.</p>
      </article>
      <article class="simple-card">
        <h2>Insights</h2>
        <p>Performance indicators and summaries for ${heading.toLowerCase()} will appear here.</p>
      </article>
    </section>
  `;
};

const renderPage = async () => {
  const signedIn = await requireSignedIn();
  if (!signedIn) return;

  const user = await authRepository.getCurrentUser();

  if (!user?.isAdmin) {
    window.location.href = '/';
    return;
  }

  const pathname = window.location.pathname;
  const body = await renderSection(pathname);

  app.innerHTML = `
    <div class="admin-shell">
      <header class="admin-topbar">
        <div class="admin-brand">
          <img src="/logo.svg" alt="Core Diski logo" />
          <div>
            <p class="title">CORE DISKI</p>
            <p class="subtitle">Admin Portal</p>
          </div>
        </div>
        <div class="admin-toolbar">
          <a href="/">Home</a>
          <a href="/shop.html">Storefront</a>
          <button id="admin-logout" type="button">Sign Out</button>
        </div>
      </header>

      <div class="admin-layout">
        <aside class="admin-sidebar">
          <nav class="admin-menu">
            ${navItems
              .map((item) => `<a href="${item.href}" ${item.href === pathname ? 'aria-current="page"' : ''}>${item.label}</a>`)
              .join('')}
          </nav>
          <nav class="admin-menu-bottom">
            ${secondaryNav.map((item) => `<a href="${item.href}">${item.label}</a>`).join('')}
          </nav>
        </aside>

        <main class="admin-main">
          <section class="admin-main-header">
            <input type="search" placeholder="Search..." aria-label="Search admin portal" />
            <strong>${pageTitleMap[pathname] ?? 'Admin'}</strong>
          </section>
          ${body}
        </main>
      </div>
    </div>
  `;

  const logout = document.querySelector<HTMLButtonElement>('#admin-logout');
  logout?.addEventListener('click', async () => {
    await authRepository.signOut();
    window.location.href = '/signin.html';
  });
};

void renderPage();
