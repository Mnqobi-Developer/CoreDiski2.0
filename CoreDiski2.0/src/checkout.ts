import './checkout.css';
import './nav-brand.css';
import { requireSignedIn } from './auth';
import { renderNav } from './nav';
import { authRepository, cartRepository, orderRepository, shirtRepository, yocoGateway } from './repository';
import type { PaymentMethod } from './types';

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

  const [user, cartItems] = await Promise.all([authRepository.getCurrentUser(), cartRepository.list()]);

  if (!user) {
    window.location.href = '/signin.html?redirect=%2Fcheckout.html';
    return;
  }

  const resolved = await Promise.all(
    cartItems.map(async (item) => ({
      item,
      shirt: await shirtRepository.getById(item.shirtId),
    })),
  );

  const validItems = resolved.filter((entry) => entry.shirt);

  if (!validItems.length) {
    app.innerHTML = `
      <main class="checkout-page">
        <h1>Checkout</h1>
        <section class="card">
          <h2>Your cart is empty</h2>
          <p class="muted">Add shirts to your cart before checking out.</p>
          <a href="/shop.html">Continue shopping</a>
        </section>
      </main>
    `;
    return;
  }

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

      <main class="checkout-page">
        <h1>Checkout</h1>
        <div class="checkout-layout">
          <section>
            <article class="card">
              <div class="customer-head">
                <h3>Customer Information</h3>
                <button id="edit-profile" class="small-btn" type="button">Edit</button>
              </div>
              <p><strong>${user.fullName}</strong></p>
              <p class="muted">${user.email}</p>
              <hr />
              <p><strong>Shipping Address</strong></p>
              <p class="muted">${user.address || 'Please add your delivery address below before ordering.'}</p>
            </article>

            <article class="card">
              <h3>Shipping Method</h3>
              <p class="method-pill">✅ Free Shipping (3-7 business days)</p>
            </article>

            <article class="card">
              <h3>Payment Information</h3>
              <div class="segment">
                <button type="button" class="payment-toggle active" data-method="yoco_card">Yoco Card</button>
                <button type="button" class="payment-toggle" data-method="yoco_eft">Yoco Instant EFT</button>
              </div>

              <form id="checkout-form">
                <div class="form-grid">
                  <label class="full">
                    Shipping address
                    <textarea name="shippingAddress" required>${user.address || ''}</textarea>
                  </label>
                  <label class="full checkbox">
                    <input type="checkbox" name="sameBilling" checked />
                    Billing address same as shipping
                  </label>
                  <label class="full" id="billing-wrap" hidden>
                    Billing address
                    <textarea name="billingAddress"></textarea>
                  </label>
                  <label>
                    Card number
                    <input name="cardNumber" placeholder="1234 5678 9012 3456" minlength="12" />
                  </label>
                  <label>
                    CVC
                    <input name="cvc" placeholder="123" minlength="3" maxlength="4" />
                  </label>
                </div>
                <button type="submit" class="complete-btn">Complete Order</button>
                <p class="status" id="status"></p>
              </form>
            </article>
          </section>

          <aside class="card">
            <h3>Order Summary</h3>
            ${validItems
              .map(
                ({ item, shirt }) => `
                  <article class="order-line">
                    <img src="${shirt?.imageUrl}" alt="${shirt?.title}" />
                    <div>
                      <h4>${shirt?.title}</h4>
                      <p class="muted">${shirt?.season} ${shirt?.variant}</p>
                      <p class="muted">Size: ${item.size} • Qty: ${item.quantity}</p>
                    </div>
                    <p class="price">${money.format((shirt?.price ?? 0) * item.quantity)}</p>
                  </article>
                `,
              )
              .join('')}
            <div class="totals">
              <p><span>Subtotal:</span><strong>${money.format(subtotal)}</strong></p>
              <p><span>Shipping:</span><strong>Free</strong></p>
              <p class="grand"><span>Total:</span><strong>${money.format(subtotal)}</strong></p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  `;

  let method: PaymentMethod = 'yoco_card';
  const form = app.querySelector<HTMLFormElement>('#checkout-form');
  const status = app.querySelector<HTMLParagraphElement>('#status');
  const toggles = app.querySelectorAll<HTMLButtonElement>('.payment-toggle');
  const sameBilling = app.querySelector<HTMLInputElement>('input[name="sameBilling"]');
  const billingWrap = app.querySelector<HTMLElement>('#billing-wrap');

  app.querySelector('#edit-profile')?.addEventListener('click', () => {
    window.location.href = '/profile.html#profile-form';
  });

  sameBilling?.addEventListener('change', () => {
    const isChecked = Boolean(sameBilling.checked);
    if (billingWrap) {
      billingWrap.hidden = isChecked;
    }
  });

  toggles.forEach((button) => {
    button.addEventListener('click', () => {
      method = (button.dataset.method as PaymentMethod) || 'yoco_card';
      toggles.forEach((entry) => entry.classList.remove('active'));
      button.classList.add('active');
    });
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const formData = new FormData(form);

    const shippingAddress = String(formData.get('shippingAddress') || '').trim();
    const billingAddressInput = String(formData.get('billingAddress') || '').trim();
    const same = Boolean(formData.get('sameBilling'));

    if (!shippingAddress) {
      if (status) {
        status.className = 'status error';
        status.textContent = 'Shipping address is required.';
      }
      return;
    }

    if (method === 'yoco_card') {
      const cardNumber = String(formData.get('cardNumber') || '').replace(/\s+/g, '');
      const cvc = String(formData.get('cvc') || '').trim();
      if (cardNumber.length < 12 || cvc.length < 3) {
        if (status) {
          status.className = 'status error';
          status.textContent = 'Please enter a valid card number and CVC.';
        }
        return;
      }
    }

    submitButton?.setAttribute('disabled', 'true');

    const cardNumber = String(formData.get('cardNumber') || '').replace(/\s+/g, '');
    const cvc = String(formData.get('cvc') || '').trim();

    const paymentResult = await yocoGateway.processPayment({
      amount: subtotal,
      currency: 'ZAR',
      provider: 'yoco',
      method,
      customerEmail: user.email,
      cardNumber: method === 'yoco_card' ? cardNumber : undefined,
      cvc: method === 'yoco_card' ? cvc : undefined,
    });

    if (!paymentResult.success || !paymentResult.transactionId) {
      if (status) {
        status.className = 'status error';
        status.textContent = paymentResult.message;
      }
      submitButton?.removeAttribute('disabled');
      return;
    }

    const result = await orderRepository.createCurrentUserOrder({
      customerName: user.fullName,
      customerEmail: user.email,
      shippingAddress,
      billingAddress: same ? shippingAddress : billingAddressInput,
      shippingMethod: 'free-standard',
      paymentMethod: method,
      paymentReference: paymentResult.transactionId,
    });

    if (result.error) {
      if (status) {
        status.className = 'status error';
        status.textContent = result.error;
      }
      submitButton?.removeAttribute('disabled');
      return;
    }

    if (status) {
      status.className = 'status success';
      status.textContent = `Order #${result.order?.id.slice(0, 8)} paid via Yoco. Ref: ${paymentResult.transactionId}`;
    }

    setTimeout(() => {
      window.location.href = '/profile.html';
    }, 1000);
  });
};

void renderPage();
