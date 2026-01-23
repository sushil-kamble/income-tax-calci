<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<footer class="footer">
	<div class="footer-container">
		<div class="footer-content">
			<p class="footer-text">
				Crafted with
				<svg
					class="heart-icon"
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
				>
					<path
						d="M8 13.5s-5.5-3-5.5-7.5a3 3 0 016 0c0-1.657 1.343-3 3-3a3 3 0 013 3c0 4.5-5.5 7.5-5.5 7.5z"
						fill="#f43f5e"
					/>
				</svg>
				by
				<a href="https://sushilkamble.vercel.app" class="footer-link" target="_blank" rel="noopener noreferrer">
					Sushil Kamble
				</a>
			</p>
			<p class="footer-note">
				Assessment Year 2025-26 • Updated tax slabs
			</p>
		</div>
	</div>
</footer>

<style>
	.footer {
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		padding: 2rem 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		margin-top: 4rem;
	}

	.footer-container {
		max-width: 72rem;
		margin: 0 auto;
	}

	.footer-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		text-align: center;
	}

	.footer-text {
		font-family: 'DM Sans', sans-serif;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #e2e8f0;
		font-size: 0.9375rem;
		margin: 0;
		flex-wrap: wrap;
		justify-content: center;
	}

	.heart-icon {
		animation: heartbeat 1.5s ease-in-out infinite;
	}

	@keyframes heartbeat {
		0%, 100% {
			transform: scale(1);
		}
		10%, 30% {
			transform: scale(1.1);
		}
		20%, 40% {
			transform: scale(1.2);
		}
	}

	.footer-link {
		color: #0ea5e9;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.3s ease;
		position: relative;
	}

	.footer-link::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 0;
		height: 2px;
		background: linear-gradient(90deg, #0ea5e9, #10b981);
		transition: width 0.3s ease;
	}

	.footer-link:hover::after {
		width: 100%;
	}

	.footer-link:hover {
		color: #10b981;
	}

	.footer-note {
		font-family: 'DM Sans', sans-serif;
		font-size: 0.8125rem;
		color: #94a3b8;
		margin: 0;
	}

	@media (max-width: 640px) {
		.footer-text {
			font-size: 0.875rem;
		}

		.footer-note {
			font-size: 0.75rem;
		}
	}
</style>
