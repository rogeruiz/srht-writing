/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ["./content/**/*.{html,js,md}", "./layouts/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Merriweather', ...defaultTheme.fontFamily.serif],
        sans: ['Lato', ...defaultTheme.fontFamily.sans],
        body: ['Merriweather', ...defaultTheme.fontFamily.serif],
        mono: ['mplus-2m-nerd-font-patched', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [
    require('@catppuccin/tailwindcss')({
      defaultFlavour: 'latte',
    }),
  ],
};
