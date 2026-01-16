/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'arc-red': '#ff4444', // Placeholder for ARC style red
                'arc-green': '#44ff44', // Placeholder for ARC style green
                'arc-dark': '#1a1a1a',
            }
        },
    },
    plugins: [],
}
