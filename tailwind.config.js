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
            'h2, h3, h4, h5, h6': {
              fontFamily: 'Playfair',
              color: 'rgb(var(--ctp-subtext2))',
              position: 'relative',
            },
            h2: {
              '& > a:hover': {
                borderColor: 'rgb(var(--ctp-peach))',
              },
            },
            h3: {
              '& > a:hover': {
                borderColor: 'rgb(var(--ctp-yellow))',
              },
            },
            h4: {
              '& > a:hover': {
                borderColor: 'rgb(var(--ctp-green))',
              },
            },
            h5: {
              '& > a:hover': {
                borderColor: 'rgb(var(--ctp-sapphire))',
              },
            },
            h6: {
              '& > a:hover': {
                borderColor: 'rgb(var(--ctp-lavender))',
              },
            },
            th: {
              color: 'rgb(var(--ctp-text))',
            },
            details: {
              border: '2px solid rgb(var(--ctp-blue))',
              borderRadius: '5px',
              padding: '10px 10px 20px 10px',
              backgroundColor: 'rgb(var(--ctp-mantle))',
            },
            "details summary": {
              cursor: 'pointer',
              marginBottom: '-10px',
              transition: 'margin 150ms ease-out',
            },
            "details[open] summary": {
              marginBottom: '10px',
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
            code: {
              fontWeight: 400,
            },
            blockquote: {
              backgroundColor: 'rgb(var(--ctp-base))',
              padding: '5px 15px',
              borderRadius: '5px',
              borderLeftColor: 'rgb(var(--ctp-mauve))',
              borderLeftWidth: '10px',
              color: 'rgb(var(--ctp-overlay2))',
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
              color: 'rgb(var(--ctp-text))',
            },
            'figcaption strong': {
              color: 'inherit',
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
              transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDuration: '150ms',
              '&:hover': {
                textDecoration: 'none',
                color: 'rgb(var(--ctp-rosewater))',
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
