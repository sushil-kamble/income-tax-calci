<script lang="ts">
	import '../app.css';
	import Footer from './footer.svelte';
	import Navbar from './Navbar.svelte';
	let { children } = $props();
</script>

<div class="app-shell">
	<Navbar />
	<main class="app-main">
		{@render children()}
	</main>
	<Footer />
</div>

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.app-main {
		flex: 1;
		width: 100%;
		max-width: 680px;
		margin: 0 auto;
		padding: 0 1rem;
	}
</style>
