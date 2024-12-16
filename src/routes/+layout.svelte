<script lang="ts">
	import '../app.css';
	import Footer from './footer.svelte';
	import Navbar from './Navbar.svelte';
	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<Navbar />
	<main class="container mx-auto grow">
		{@render children()}
	</main>
	<Footer />
</div>
