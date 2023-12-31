/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./content/**/*.{html,js,md}', './layouts/**/*.{html,js}'],
  theme: {
    extend: {
      typography: (/* theme */) => ({
        DEFAULT: {
          css: {
            color: 'rgb(var(--ctp-text))',
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'Playfair',
              color: 'rgb(var(--ctp-text))',
            },
            th: {
              color: 'rgb(var(--ctp-text))',
            },
            summary: {
              cursor: 'pointer',
            },
            pre: {
              color: 'inherit',
              backgroundColor: 'rgb(var(--ctp-base))',
              border: 0,
              padding: 10,
              margin: 0,
              code: {
                color: 'inherit',
                border: 0,
                padding: 0,
                margin: 0,
              },
            },
            blockquote: {
              borderLeftColor: 'rgb(var(--ctp-mauve))',
              color: 'rgb(var(--ctp-overlay0))',
              '& p:first-of-type, & p:last-of-type': {
                '&:before, &:after': {
                  color: 'rgb(var(--ctp-mauve))',
                },
              },
            },
            'blockquote code, code': {
              color: 'rgb(var(--ctp-mauve))',
            },
            strong: {
              color: 'rgb(var(--ctp-subtext0))',
              fontWeight: '700',
            },
            '.content strong': {
              textDecorationColor: 'rgb(var(--ctp-subtext2))',
              textDecorationLine: 'underline',
              textDecorationStyle: 'wavy',
              textDecorationThickness: '1px',
              textUnderlineOffset: '2px',
            },
            a: {
              color: 'rgb(var(--ctp-blue))',
              textDecoration: 'underline',
              '&:hover': {
                textDecoration: 'none',
                color: 'inherit',
              },
            },
          },
        },
      }),
      fontFamily: {
        display: ['Playfair', ...defaultTheme.fontFamily.sans],
        body: ['Quattrocento', ...defaultTheme.fontFamily.serif],
        mono: ['mplus-2m-nerd-font-patched', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@catppuccin/tailwindcss')({
      defaultFlavour: 'latte',
    }),
  ],
};
