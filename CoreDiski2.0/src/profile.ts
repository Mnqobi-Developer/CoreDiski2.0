import './profile.css';
import './nav-brand.css';
import { requireSignedIn } from './auth';
import { renderNav } from './nav';
import { authRepository, orderRepository } from './repository';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App container not found');
}

const toMonthYear = (isoDate: string) => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
};

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'CD';

const renderPage = async () => {
  const signedIn = await requireSignedIn();

  if (!signedIn) {
    return;
  }

  const user = await authRepository.getCurrentUser();
  const orders = await orderRepository.listCurrentUser();

  if (!user) {
    window.location.href = '/signin.html?redirect=%2Fprofile.html';
    return;
  }

  const completedOrders = orders.filter((order) => order.status === 'paid').length;

  app.innerHTML = `
    <div class="profile-page">
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

      <main class="profile-layout">
        <aside class="sidebar">
          <h2>My Account</h2>
          <ul class="menu-list">
            <li><a class="active" href="/profile.html">Account Overview</a></li>
            <li><a href="#">Order History</a></li>
            <li><a href="/wishlist.html">Wishlist</a></li>
            <li><a href="#profile-form">Account Settings</a></li>
            ${user.isAdmin ? '<li><a href="/admin.html">Admin Portal</a></li>' : ''}
            <li><button id="logout-btn" type="button">Log Out</button></li>
          </ul>
        </aside>

        <section class="content">
          <h1>My Profile</h1>

          <article class="profile-card">
            <div class="avatar">${initials(user.fullName)}</div>
            <div>
              <h2>${user.fullName}</h2>
              <p>${user.email}</p>
              <p>Member since: ${toMonthYear(user.createdAt)}</p>
            </div>
            <button id="edit-profile" class="primary-btn" type="button">Edit Profile</button>
          </article>

          <div class="grid">
            <article class="detail-card">
              <h3>Order Summary</h3>
              <ul class="detail-list">
                <li><strong>Pending Orders</strong><span>0</span></li>
                <li><strong>Shipped</strong><span>0</span></li>
                <li><strong>Completed</strong><span>${completedOrders}</span></li>
              </ul>
            </article>

            <article class="detail-card">
              <h3>Account Settings</h3>
              <ul class="detail-list">
                <li><strong>Phone</strong><span>${user.phone || 'Not set'}</span></li>
                <li><strong>Address</strong><span>${user.address || 'Not set'}</span></li>
                <li><strong>Email Preferences</strong><span>${user.emailPreferences || 'General updates'}</span></li>
              </ul>
            </article>
          </div>

          <section class="form-wrap" id="profile-form">
            <h3>Edit Personal Information</h3>
            <form id="account-form" class="profile-form">
              <label>
                Full Name
                <input name="fullName" type="text" required minlength="2" value="${user.fullName}" />
              </label>
              <label>
                Email Address
                <input name="email" type="email" required value="${user.email}" />
              </label>
              <label>
                Phone Number
                <input name="phone" type="tel" value="${user.phone || ''}" placeholder="+27 82 123 4567" />
              </label>
              <label>
                Email Preferences
                <input name="emailPreferences" type="text" value="${user.emailPreferences || ''}" placeholder="General updates" />
              </label>
              <label class="full">
                Address
                <textarea name="address" placeholder="Street, City, Postal Code">${user.address || ''}</textarea>
              </label>
              <div class="form-actions">
                <button class="primary-btn" type="submit">Save Changes</button>
                <button id="cancel-edit" class="secondary-btn" type="button">Cancel</button>
              </div>
            </form>
            <p id="status"></p>
          </section>
        </section>
      </main>
    </div>
  `;

  const form = document.querySelector<HTMLFormElement>('#account-form');
  const status = document.querySelector<HTMLParagraphElement>('#status');
  const editButton = document.querySelector<HTMLButtonElement>('#edit-profile');
  const logoutBtn = document.querySelector<HTMLButtonElement>('#logout-btn');
  const cancelEdit = document.querySelector<HTMLButtonElement>('#cancel-edit');
  const profileForm = document.querySelector<HTMLElement>('#profile-form');

  editButton?.addEventListener('click', () => {
    profileForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  cancelEdit?.addEventListener('click', () => {
    void renderPage();
  });

  logoutBtn?.addEventListener('click', async () => {
    await authRepository.signOut();
    window.location.href = '/signin.html';
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const result = await authRepository.updateCurrentUser({
      fullName: String(formData.get('fullName') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      address: String(formData.get('address') || ''),
      emailPreferences: String(formData.get('emailPreferences') || ''),
    });

    if (result.error) {
      if (status) {
        status.className = 'error';
        status.textContent = result.error;
      }
      return;
    }

    if (status) {
      status.className = 'success';
      status.textContent = 'Profile updated successfully.';
    }

    setTimeout(() => {
      void renderPage();
    }, 500);
  });
};

void renderPage();
