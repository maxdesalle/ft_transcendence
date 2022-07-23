/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      height: {
        90: "96vh",
        82: "83vh",
      },
      textColor: {
        skin: {
          base: "var(--color-text-base)",
          gray: "var(--color-menu-background)",
        },
      },
      backgroundColor: {
        skin: {
          "menu-background": "var(--menu-background)",
          "header-background": "var(--header-bg-color)",
          page: "var(--page-bg-color)",
        },
      },
      borderColor: {
        header: {
          menu: "var(--menu-background)",
        },
      },
    },
    container: {
      center: true,
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
