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
        wishlist: resolve(__dirname, 'wishlist.html'),
        signin: resolve(__dirname, 'signin.html'),
        register: resolve(__dirname, 'register.html'),
        profile: resolve(__dirname, 'profile.html'),
      },
    },
  },
});
