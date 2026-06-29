import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          login: path.resolve(__dirname, 'login.html'),
          signup: path.resolve(__dirname, 'signup.html'),
          profile: path.resolve(__dirname, 'profile.html'),
          cart: path.resolve(__dirname, 'cart.html'),
          product: path.resolve(__dirname, 'product.html'),
          checkout: path.resolve(__dirname, 'checkout.html'),
          wishlist: path.resolve(__dirname, 'wishlist.html'),
          admin: path.resolve(__dirname, 'admin.html'),
        },
      },
    },
  };
});
