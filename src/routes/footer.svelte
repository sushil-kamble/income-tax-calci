<footer class="footer">
	<div class="footer-inner">
		<p class="footer-text">
			Built by
			<a href="https://sushilkamble.vercel.app" class="footer-link" target="_blank" rel="noopener noreferrer">
				Sushil Kamble
			</a>
		</p>
		<p class="footer-note">
			Estimates only · Consult a CA for exact figures
		</p>
	</div>
</footer>

<style>
	.footer {
		padding: 2rem 1rem;
		border-top: 1px solid var(--border-subtle);
		margin-top: 3rem;
	}

	.footer-inner {
		max-width: 680px;
		margin: 0 auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.footer-text {
		font-size: 0.8125rem;
		color: var(--text-muted);
		margin: 0;
	}

	.footer-link {
		color: var(--gold);
		text-decoration: none;
		font-weight: 600;
		transition: color 0.2s;
	}

	.footer-link:hover {
		color: var(--gold-bright);
	}

	.footer-note {
		font-size: 0.6875rem;
		color: var(--text-muted);
		margin: 0;
		opacity: 0.6;
	}
</style>
