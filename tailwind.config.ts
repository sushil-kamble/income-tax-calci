import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		fontFamily: {
			sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
			mono: ['JetBrains Mono', 'monospace'],
			serif: ['Instrument Serif', 'serif']
		},
		extend: {
			colors: {
				primary: '#fbbf24'
			}
		}
	},

	plugins: []
} satisfies Config;
