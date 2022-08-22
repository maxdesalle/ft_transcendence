/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      height: {
        hh: '5vh',
        mh: '8vh',
        92: '92vh',
        95: '95vh',
      },
      textColor: {
        skin: {
          base: 'var(--color-text-base)',
          gray: 'var(--color-menu-background)',
        },
      },
      backgroundColor: {
        skin: {
          'menu-background': 'var(--menu-background)',
          'header-background': 'var(--header-bg-color)',
          page: 'var(--page-bg-color)',
        },
      },
      borderColor: {
        header: {
          menu: 'var(--menu-background)',
        },
      },
    },
    container: {
      center: true,
    },
  },
  plugins: [require('tailwind-scrollbar')],
};
