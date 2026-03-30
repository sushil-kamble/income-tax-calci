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
		background: linear-gradient(135deg, var(--gold) 0%, #f59e0b 100%);
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

	@media (max-width: 480px) {
		.brand-title {
			font-size: 1.125rem;
		}
	}
</style>
