<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<nav class="navbar">
	<div class="navbar-container">
		<div class="navbar-content">
			<svg class="navbar-icon" width="32" height="32" viewBox="0 0 32 32" fill="none">
				<rect x="4" y="4" width="24" height="24" rx="4" fill="url(#gradient)" />
				<path
					d="M12 14h8m-8 4h6m-2-8h.01"
					stroke="white"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<defs>
					<linearGradient id="gradient" x1="4" y1="4" x2="28" y2="28">
						<stop offset="0%" stop-color="#0ea5e9" />
						<stop offset="100%" stop-color="#10b981" />
					</linearGradient>
				</defs>
			</svg>
			<div class="navbar-text">
				<h1 class="navbar-title">In-Hand Salary Calci</h1>
				<p class="navbar-subtitle">Smart tax calculator for India</p>
			</div>
		</div>
	</div>
</nav>

<style>
	.navbar {
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		padding: 1.5rem 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.3);
	}

	.navbar-container {
		max-width: 72rem;
		margin: 0 auto;
	}

	.navbar-content {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.navbar-icon {
		flex-shrink: 0;
		filter: drop-shadow(0 4px 8px rgba(14, 165, 233, 0.3));
	}

	.navbar-text {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.navbar-title {
		font-family: 'Playfair Display', serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: white;
		margin: 0;
		line-height: 1;
	}

	.navbar-subtitle {
		font-family: 'DM Sans', sans-serif;
		font-size: 0.875rem;
		color: #94a3b8;
		margin: 0;
	}

	@media (max-width: 640px) {
		.navbar-title {
			font-size: 1.25rem;
		}

		.navbar-subtitle {
			font-size: 0.75rem;
		}
	}
</style>
