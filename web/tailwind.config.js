/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'mercadito-orange': '#FF6B00',
        'mercadito-green': '#10B981',
        'mercadito-blue': '#3B82F6',
      },
    },
  },
  plugins: [],
}
