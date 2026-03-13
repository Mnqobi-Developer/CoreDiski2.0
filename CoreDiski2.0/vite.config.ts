import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        shop: resolve(__dirname, 'shop.html'),
        product: resolve(__dirname, 'product.html'),
        cart: resolve(__dirname, 'cart.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        wishlist: resolve(__dirname, 'wishlist.html'),
        signin: resolve(__dirname, 'signin.html'),
        register: resolve(__dirname, 'register.html'),
        profile: resolve(__dirname, 'profile.html'),
        admin: resolve(__dirname, 'admin.html'),
        adminProducts: resolve(__dirname, 'admin-products.html'),
        adminOrders: resolve(__dirname, 'admin-orders.html'),
        adminCustomers: resolve(__dirname, 'admin-customers.html'),
        adminCategories: resolve(__dirname, 'admin-categories.html'),
        adminAnalytics: resolve(__dirname, 'admin-analytics.html'),
        adminSettings: resolve(__dirname, 'admin-settings.html'),
      },
    },
  },
});
