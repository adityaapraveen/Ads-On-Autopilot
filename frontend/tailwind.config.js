export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                amber: { DEFAULT: '#f59e0b', dim: '#92400e' },
                surface: '#111111',
                elevated: '#1a1a1a',
                border: '#2a2a2a',
            },
            fontFamily: {
                mono: ['IBM Plex Mono', 'monospace'],
                sans: ['IBM Plex Sans', 'sans-serif'],
            },
        },
    },
    plugins: [],
};