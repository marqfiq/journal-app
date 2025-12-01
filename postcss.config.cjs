module.exports = {
  plugins: [
    // Tailwind v4 requires the PostCSS plugin package. Install
    // `@tailwindcss/postcss` and enable it here.
    require('@tailwindcss/postcss')(),
    require('autoprefixer')(),
  ],
}
