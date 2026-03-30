<script lang="ts">
	import { onMount } from 'svelte';

	let dark = $state(true);

	onMount(() => {
		const saved = localStorage.getItem('theme');
		if (saved === 'light') {
			dark = false;
			document.documentElement.setAttribute('data-theme', 'light');
		}
	});

	function toggleTheme() {
		dark = !dark;
		const theme = dark ? 'dark' : 'light';
		if (dark) {
			document.documentElement.removeAttribute('data-theme');
		} else {
			document.documentElement.setAttribute('data-theme', 'light');
		}
		localStorage.setItem('theme', theme);
	}
</script>

<nav class="navbar">
	<div class="navbar-inner">
		<div class="brand">
			<div class="brand-icon">
				<span class="icon-rupee">₹</span>
			</div>
			<div class="brand-text">
				<h1 class="brand-title">In-Hand Salary</h1>
				<p class="brand-sub">AY 2025-26 · India</p>
			</div>
		</div>
		<button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
			{#if dark}
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<circle cx="10" cy="10" r="4" stroke="currentColor" stroke-width="1.5" />
					<path d="M10 2v2m0 12v2M2 10h2m12 0h2M4.93 4.93l1.41 1.41m7.32 7.32l1.41 1.41M4.93 15.07l1.41-1.41m7.32-7.32l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			{:else}
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path d="M17.293 13.293A8 8 0 016.707 2.707a8.003 8.003 0 1010.586 10.586z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			{/if}
		</button>
	</div>
</nav>

<style>
	.navbar {
		padding: 1.25rem 1rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	.navbar-inner {
		max-width: 680px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.875rem;
	}

	.brand-icon {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.625rem;
		background: linear-gradient(135deg, var(--gold) 0%, var(--gold-bright) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 20px rgba(251, 191, 36, 0.15);
	}

	.icon-rupee {
		font-family: 'Instrument Serif', serif;
		font-size: 1.375rem;
		color: #09090b;
		font-weight: 400;
		line-height: 1;
	}

	.brand-title {
		font-family: 'Outfit', sans-serif;
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text);
		margin: 0;
		line-height: 1.2;
		letter-spacing: -0.01em;
	}

	.brand-sub {
		font-size: 0.75rem;
		color: var(--text-muted);
		margin: 0;
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.5rem;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-muted);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.theme-toggle:hover {
		color: var(--gold);
		border-color: var(--gold);
	}

	@media (max-width: 480px) {
		.brand-title {
			font-size: 1.125rem;
		}
	}
</style>
