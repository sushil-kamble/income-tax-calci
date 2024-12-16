import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		fontFamily: {
			sans: ['EB Garamond', 'serif']
		},
		extend: {
			colors: {
				primary: '#1f2937' // Add primary color
			}
		}
	},

	plugins: []
} satisfies Config;
