import './admin.css';
import { requireSignedIn } from './auth';
import { adminRepository, authRepository, shirtRepository } from './repository';
import type { AdminUserRecord, CreateShirtInput } from './types';

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

let editingProductId: string | null = null;
let customerQuery = '';
let customerRoleFilter: 'all' | 'admin' | 'customer' = 'all';

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const money = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
});

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const statusTone = (status: string) => {
  if (status === 'paid') return 'completed';
  return 'pending';
};

const statusLabel = (status: string) => {
  if (status === 'paid') return 'Paid';
  return 'Pending';
};

const relativeOrderDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return formatDate(isoDate);
};

const renderDashboard = async () => {
  const [shirts, users, orders] = await Promise.all([
    shirtRepository.list(),
    adminRepository.listUsers(),
    adminRepository.listOrders(),
  ]);

  const totalProducts = shirts.length;
  const totalOrders = orders.length;
  const totalCustomers = users.filter((user) => !user.isAdmin).length;
  const outOfStock = shirts.filter((shirt) => shirt.featured === false).length;

  const featuredRows = shirts.slice(0, 5);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const recentProductsMarkup = featuredRows.length
    ? featuredRows
        .map(
          (shirt) => `
                <tr>
                  <td><strong>${escapeHtml(shirt.title)}</strong><br/><small>${escapeHtml(shirt.season)} ${escapeHtml(shirt.variant)}</small></td>
                  <td>${money.format(shirt.price)}</td>
                  <td>${shirt.featured ? '<span class="status-pill active">Featured</span>' : '<span class="status-pill pending">Standard</span>'}</td>
                  <td><span class="status-pill active">Active</span></td>
                </tr>`,
        )
        .join('')
    : '<tr><td colspan="4">No products found.</td></tr>';

  const recentOrdersMarkup = recentOrders.length
    ? recentOrders
        .map(
          (order) => `
              <tr><td>#${escapeHtml(order.id.slice(-6).toUpperCase())}</td><td>${escapeHtml(order.customerName)}</td><td>${relativeOrderDate(order.createdAt)}</td></tr>`,
        )
        .join('')
    : '<tr><td colspan="3">No orders yet.</td></tr>';

  const orderStatusMarkup = recentOrders.length
    ? recentOrders
        .map(
          (order) => `
              <tr><td>#${escapeHtml(order.id.slice(-6).toUpperCase())}</td><td>${escapeHtml(order.customerName)}</td><td><span class="status-pill ${statusTone(order.status)}">${statusLabel(order.status)}</span></td></tr>`,
        )
        .join('')
    : '<tr><td colspan="3">No orders yet.</td></tr>';

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
          <tr><th>Product</th><th>Price</th><th>Type</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${recentProductsMarkup}
        </tbody>
      </table>
    </section>

    <section class="simple-grid">
      <article class="panel">
        <h2 class="panel-title">Recent Orders</h2>
        <table class="table">
          <tbody>
            ${recentOrdersMarkup}
          </tbody>
        </table>
      </article>

      <article class="panel">
        <h2 class="panel-title">Order Status</h2>
        <table class="table">
          <tbody>
            ${orderStatusMarkup}
          </tbody>
        </table>
      </article>
    </section>
  `;
};

const renderProductsManager = async () => {
  const shirts = await shirtRepository.list();
  const editingProduct = editingProductId ? shirts.find((shirt) => shirt.id === editingProductId) ?? null : null;

  const fallback: CreateShirtInput = {
    clubOrNation: '',
    title: '',
    season: '',
    variant: '',
    price: 100,
    imageUrl: '',
    tags: [],
    featured: false,
  };

  const seed = editingProduct ?? fallback;

  return `
    <h1 class="section-title">Products</h1>
    <section class="panel">
      <h2 class="panel-title">${editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
      <p class="admin-helper">Enter all football shirt details below. You can create a new product or edit an existing one.</p>
      <form id="product-form" class="product-form">
        <label>Club or Nation
          <input name="clubOrNation" value="${escapeHtml(seed.clubOrNation)}" required />
        </label>
        <label>Product Title
          <input name="title" value="${escapeHtml(seed.title)}" required />
        </label>
        <label>Season
          <input name="season" value="${escapeHtml(seed.season)}" required placeholder="e.g. 1998-1999" />
        </label>
        <label>Variant
          <input name="variant" value="${escapeHtml(seed.variant)}" required placeholder="Home / Away / Third" />
        </label>
        <label>Price (ZAR)
          <input name="price" type="number" min="1" step="1" value="${seed.price}" required />
        </label>
        <label>Image URL
          <input name="imageUrl" type="url" value="${escapeHtml(seed.imageUrl)}" required placeholder="https://..." />
        </label>
        <label class="full">Tags (comma-separated)
          <input name="tags" value="${escapeHtml(seed.tags.join(', '))}" placeholder="retro, classic, premier league" />
        </label>
        <label class="check-row full">
          <input name="featured" type="checkbox" ${seed.featured ? 'checked' : ''} />
          Mark as featured
        </label>

        <div class="product-form-actions full">
          <button class="primary" type="submit">${editingProduct ? 'Save Changes' : 'Add Product'}</button>
          ${editingProduct ? '<button id="cancel-edit" class="secondary" type="button">Cancel Edit</button>' : ''}
        </div>
      </form>
      <p id="product-status" class="status"></p>
    </section>

    <section class="panel">
      <h2 class="panel-title">Available Store Products</h2>
      <p class="admin-helper">All products currently in the storefront are listed below.</p>
      <div class="panel-scroll">
        <table class="table product-table">
          <thead>
            <tr><th>Product</th><th>Season</th><th>Price</th><th>Tags</th><th>Featured</th><th>Action</th></tr>
          </thead>
          <tbody>
            ${shirts
              .map(
                (shirt) => `
                  <tr>
                    <td>
                      <div class="product-cell">
                        <img src="${escapeHtml(shirt.imageUrl)}" alt="${escapeHtml(shirt.title)}" />
                        <div>
                          <strong>${escapeHtml(shirt.title)}</strong>
                          <p>${escapeHtml(shirt.clubOrNation)} · ${escapeHtml(shirt.variant)}</p>
                        </div>
                      </div>
                    </td>
                    <td>${escapeHtml(shirt.season)}</td>
                    <td>${money.format(shirt.price)}</td>
                    <td>${escapeHtml(shirt.tags.join(', '))}</td>
                    <td>${shirt.featured ? '<span class="status-pill active">Yes</span>' : '<span class="status-pill pending">No</span>'}</td>
                    <td><button class="secondary edit-product" data-id="${shirt.id}" type="button">Edit</button></td>
                  </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
};

const renderCustomersManager = async () => {
  const users = await adminRepository.listUsers();
  const filteredUsers = users
    .filter((user) => {
      if (customerRoleFilter === 'admin') return Boolean(user.isAdmin);
      if (customerRoleFilter === 'customer') return !user.isAdmin;
      return true;
    })
    .filter((user) => {
      if (!customerQuery.trim()) return true;
      const needle = customerQuery.trim().toLowerCase();
      return [user.fullName, user.email, user.phone ?? '', user.address ?? ''].join(' ').toLowerCase().includes(needle);
    });

  const totalUsers = users.length;
  const totalAdmins = users.filter((user) => user.isAdmin).length;
  const profileCompleteCount = users.filter((user) => user.phone && user.address).length;

  return `
    <h1 class="section-title">Customers</h1>

    <section class="metrics">
      <article class="metric-card"><p class="label">Total Accounts</p><p class="value">${totalUsers}</p></article>
      <article class="metric-card"><p class="label">Admins</p><p class="value">${totalAdmins}</p></article>
      <article class="metric-card"><p class="label">Customers</p><p class="value">${totalUsers - totalAdmins}</p></article>
      <article class="metric-card"><p class="label">Profiles Completed</p><p class="value">${profileCompleteCount}</p></article>
    </section>

    <section class="panel">
      <h2 class="panel-title">Customer Accounts</h2>
      <p class="admin-helper">View all registered accounts, search/filter users, promote or demote admins, and remove accounts.</p>

      <form id="customers-filter" class="customers-filter-row">
        <input id="customers-query" type="search" placeholder="Search name, email, phone, address..." value="${escapeHtml(customerQuery)}" />
        <select id="customers-role-filter" name="roleFilter">
          <option value="all" ${customerRoleFilter === 'all' ? 'selected' : ''}>All Roles</option>
          <option value="admin" ${customerRoleFilter === 'admin' ? 'selected' : ''}>Admins</option>
          <option value="customer" ${customerRoleFilter === 'customer' ? 'selected' : ''}>Customers</option>
        </select>
        <button class="secondary" type="submit">Apply</button>
      </form>

      <p id="customers-status" class="status"></p>

      <div class="panel-scroll">
        <table class="table customer-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filteredUsers
              .map(
                (user) => `
                  <tr>
                    <td>${escapeHtml(user.fullName)}</td>
                    <td>${escapeHtml(user.email)}</td>
                    <td>${escapeHtml(user.phone || '—')}</td>
                    <td>${escapeHtml(user.address || '—')}</td>
                    <td>${user.isAdmin ? '<span class="status-pill active">Admin</span>' : '<span class="status-pill pending">Customer</span>'}</td>
                    <td>${formatDate(user.createdAt)}</td>
                    <td class="customer-actions">
                      <button class="secondary toggle-role" data-user-id="${user.id}" data-is-admin="${user.isAdmin ? '1' : '0'}" type="button">${user.isAdmin ? 'Demote' : 'Promote'}</button>
                      <button class="secondary danger remove-user" data-user-id="${user.id}" type="button">Remove</button>
                    </td>
                  </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
};

const renderSection = async (pathname: string) => {
  if (pathname === '/admin.html' || pathname === '/admin') {
    return renderDashboard();
  }

  if (pathname === '/admin-products.html') {
    return renderProductsManager();
  }

  if (pathname === '/admin-customers.html') {
    return renderCustomersManager();
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

const productInputFromForm = (form: HTMLFormElement): CreateShirtInput => {
  const data = new FormData(form);
  return {
    clubOrNation: String(data.get('clubOrNation') ?? '').trim(),
    title: String(data.get('title') ?? '').trim(),
    season: String(data.get('season') ?? '').trim(),
    variant: String(data.get('variant') ?? '').trim(),
    price: Number(data.get('price') ?? 0),
    imageUrl: String(data.get('imageUrl') ?? '').trim(),
    tags: String(data.get('tags') ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    featured: Boolean(data.get('featured')),
  };
};

const bindProductsActions = () => {
  const form = document.querySelector<HTMLFormElement>('#product-form');
  const status = document.querySelector<HTMLParagraphElement>('#product-status');
  const cancelEdit = document.querySelector<HTMLButtonElement>('#cancel-edit');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const input = productInputFromForm(form);

    if (!input.clubOrNation || !input.title || !input.season || !input.variant || !input.imageUrl || input.price <= 0) {
      if (status) {
        status.className = 'status error';
        status.textContent = 'Please complete all required fields with valid values.';
      }
      return;
    }

    if (editingProductId) {
      const updated = await shirtRepository.update(editingProductId, input);
      editingProductId = null;
      if (status) {
        status.className = updated ? 'status success' : 'status error';
        status.textContent = updated ? 'Product updated successfully.' : 'Unable to update product.';
      }
    } else {
      await shirtRepository.create(input);
      if (status) {
        status.className = 'status success';
        status.textContent = 'Product added successfully.';
      }
    }

    await renderPage();
  });

  document.querySelectorAll<HTMLButtonElement>('.edit-product').forEach((button) => {
    button.addEventListener('click', async () => {
      editingProductId = button.dataset.id ?? null;
      await renderPage();
    });
  });

  cancelEdit?.addEventListener('click', async () => {
    editingProductId = null;
    await renderPage();
  });
};

const bindCustomerActions = async (currentUser: AdminUserRecord) => {
  const status = document.querySelector<HTMLParagraphElement>('#customers-status');
  const filterForm = document.querySelector<HTMLFormElement>('#customers-filter');
  const queryInput = document.querySelector<HTMLInputElement>('#customers-query');
  const roleFilter = document.querySelector<HTMLSelectElement>('#customers-role-filter');

  filterForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    customerQuery = queryInput?.value ?? '';
    const role = roleFilter?.value;
    customerRoleFilter = role === 'admin' || role === 'customer' ? role : 'all';
    await renderPage();
  });

  document.querySelectorAll<HTMLButtonElement>('.toggle-role').forEach((button) => {
    button.addEventListener('click', async () => {
      const userId = button.dataset.userId;
      const currentRole = button.dataset.isAdmin === '1';

      if (!userId) return;
      if (userId === currentUser.id) {
        if (status) {
          status.className = 'status error';
          status.textContent = 'You cannot change your own role from this screen.';
        }
        return;
      }

      const result = await adminRepository.updateUserRole(userId, !currentRole);
      if (status) {
        status.className = result ? 'status success' : 'status error';
        status.textContent = result ? 'User role updated successfully.' : 'Unable to update role (must keep at least one admin).';
      }
      await renderPage();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.remove-user').forEach((button) => {
    button.addEventListener('click', async () => {
      const userId = button.dataset.userId;
      if (!userId) return;
      if (userId === currentUser.id) {
        if (status) {
          status.className = 'status error';
          status.textContent = 'You cannot remove your own account while signed in.';
        }
        return;
      }

      const removed = await adminRepository.deleteUser(userId);
      if (status) {
        status.className = removed ? 'status success' : 'status error';
        status.textContent = removed ? 'User removed successfully.' : 'Unable to remove user (must keep at least one admin).';
      }
      await renderPage();
    });
  });
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

  if (pathname === '/admin-products.html') {
    bindProductsActions();
  }

  if (pathname === '/admin-customers.html') {
    const users = await adminRepository.listUsers();
    const currentRecord = users.find((entry) => entry.id === user.id);
    if (currentRecord) {
      await bindCustomerActions(currentRecord);
    }
  }
};

void renderPage();
