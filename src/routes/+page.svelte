<script lang="ts">
	import { onMount } from 'svelte';

	let scheme: 'old' | 'new' = $state('new');
	let salary = $state<number | string>('');
	let pfMonthly = $state<number>(1800);
	let showBreakdown = $state(false);

	interface SlabDetail {
		label: string;
		rate: number;
		amount: number;
		tax: number;
	}

	function formatIndian(num: number): string {
		return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
	}

	function formatShort(num: number): string {
		const abs = Math.abs(num);
		const sign = num < 0 ? '-' : '';
		if (abs >= 100000) {
			return `${sign}₹${(abs / 100000).toFixed(2)}L`;
		} else if (abs >= 1000) {
			return `${sign}₹${(abs / 1000).toFixed(1)}K`;
		}
		return `${sign}₹${abs.toFixed(0)}`;
	}

	const results = $derived.by(() => {
		const sal = Number(salary);
		if (!sal || sal <= 0) return null;

		const income = sal * 100000;
		const stdDeduction = scheme === 'new' ? 75000 : 50000;
		const taxableIncome = Math.max(0, income - stdDeduction);

		// Define slabs
		const slabDefs =
			scheme === 'new'
				? [
						{ min: 0, max: 400000, rate: 0 },
						{ min: 400000, max: 800000, rate: 0.05 },
						{ min: 800000, max: 1200000, rate: 0.1 },
						{ min: 1200000, max: 1600000, rate: 0.15 },
						{ min: 1600000, max: 2000000, rate: 0.2 },
						{ min: 2000000, max: 2400000, rate: 0.25 },
						{ min: 2400000, max: Infinity, rate: 0.3 }
					]
				: [
						{ min: 0, max: 250000, rate: 0 },
						{ min: 250000, max: 500000, rate: 0.05 },
						{ min: 500000, max: 1000000, rate: 0.2 },
						{ min: 1000000, max: Infinity, rate: 0.3 }
					];

		let baseTax = 0;
		const slabs: SlabDetail[] = [];
		let remaining = taxableIncome;

		for (const slab of slabDefs) {
			if (remaining <= 0) break;
			const slabWidth = slab.max === Infinity ? remaining : slab.max - slab.min;
			const taxableInSlab = Math.min(remaining, slabWidth);
			const tax = taxableInSlab * slab.rate;
			baseTax += tax;

			const label =
				slab.min === 0
					? `Up to ₹${formatIndian(slab.max)}`
					: slab.max === Infinity
						? `Above ₹${formatIndian(slab.min)}`
						: `₹${formatIndian(slab.min + 1)} — ₹${formatIndian(slab.max)}`;

			slabs.push({ label, rate: slab.rate, amount: taxableInSlab, tax });
			remaining -= taxableInSlab;
		}

		// Section 87A rebate for new regime
		let rebateApplied = false;
		let effectiveTax = baseTax;
		if (scheme === 'new' && taxableIncome <= 1200000) {
			rebateApplied = true;
			effectiveTax = 0;
		}

		const educationCess = effectiveTax * 0.04;
		const professionalTax = 2400;
		const totalTax = effectiveTax + educationCess + professionalTax;

		const pfEmployeeYearly = pfMonthly * 12;
		const pfEmployerYearly = pfMonthly * 12;
		const totalPF = pfEmployeeYearly + pfEmployerYearly;

		const inHandYearly = income - totalTax - totalPF;
		const inHandMonthly = inHandYearly / 12;

		return {
			income,
			stdDeduction,
			taxableIncome,
			baseTax: effectiveTax,
			educationCess,
			professionalTax,
			totalTax,
			slabs,
			rebateApplied,
			pfEmployeeYearly,
			pfEmployerYearly,
			totalPF,
			inHandYearly,
			inHandMonthly,
			taxMonthly: totalTax / 12
		};
	});

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const salaryParam = urlParams.get('salary');
		const schemeParam = urlParams.get('scheme');

		if (salaryParam) {
			const parsed = parseFloat(salaryParam);
			if (!isNaN(parsed)) salary = parsed;
		}
		if (schemeParam === 'new' || schemeParam === 'old') {
			scheme = schemeParam;
		}
	});
</script>

<div class="page">
	<!-- Regime Toggle -->
	<div class="section regime-section">
		<div class="regime-toggle">
			<button
				class="regime-btn"
				class:active={scheme === 'new'}
				onclick={() => (scheme = 'new')}
			>
				New Regime
			</button>
			<button
				class="regime-btn"
				class:active={scheme === 'old'}
				onclick={() => (scheme = 'old')}
			>
				Old Regime
			</button>
			<div class="regime-slider" class:slide-right={scheme === 'old'}></div>
		</div>
	</div>

	<!-- Salary Input -->
	<div class="section input-section">
		<label for="salary-input" class="input-label">Annual CTC</label>
		<div class="salary-input-wrap">
			<input
				id="salary-input"
				type="number"
				placeholder="0"
				bind:value={salary}
				step="0.01"
				class="salary-field"
			/>
			<span class="input-unit">Lakhs</span>
		</div>
		{#if salary && Number(salary) > 0}
			<p class="salary-converted">
				₹{formatIndian(Number(salary) * 100000)} per year
			</p>
		{/if}
		{#if Number(salary) > 1000}
			<p class="input-warning">Please verify — that's over ₹10 crore annually</p>
		{/if}
	</div>

	<!-- PF Input -->
	<div class="section pf-section">
		<div class="pf-row">
			<label for="pf-input" class="pf-label">PF per month</label>
			<div class="pf-input-wrap">
				<span class="pf-currency">₹</span>
				<input
					id="pf-input"
					type="number"
					bind:value={pfMonthly}
					step="100"
					class="pf-field"
				/>
			</div>
		</div>
		<p class="pf-note">Employee + Employer contribution deducted from CTC</p>
	</div>

	<!-- Results -->
	{#if results}
		<div class="results" role="region" aria-label="Calculation results">
			<!-- Summary Cards -->
			<div class="summary-grid">
				<div class="summary-card tax-card">
					<span class="card-label">Income Tax</span>
					<span class="card-value tax-value">{formatShort(results.totalTax)}</span>
					<span class="card-sub">{formatShort(results.taxMonthly)}/mo</span>
				</div>
				<div class="summary-card pf-card">
					<span class="card-label">Total PF</span>
					<span class="card-value pf-value">{formatShort(results.totalPF)}</span>
					<span class="card-sub">{formatShort(results.totalPF / 12)}/mo</span>
				</div>
				<div class="summary-card inhand-card">
					<span class="card-label">In-Hand Salary</span>
					<span class="card-value inhand-value">{formatShort(results.inHandYearly)}</span>
					<span class="card-sub inhand-sub">{formatShort(results.inHandMonthly)}/mo</span>
				</div>
			</div>

			<!-- Breakdown Toggle -->
			<button class="breakdown-toggle" onclick={() => (showBreakdown = !showBreakdown)}>
				<span>View Calculations</span>
				<svg
					class="chevron"
					class:open={showBreakdown}
					width="18"
					height="18"
					viewBox="0 0 18 18"
					fill="none"
				>
					<path
						d="M4.5 6.75L9 11.25L13.5 6.75"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>

			<!-- Detailed Breakdown -->
			{#if showBreakdown}
				<div class="breakdown">
					<!-- Step 1: Taxable Income -->
					<div class="calc-group">
						<h3 class="calc-heading">Taxable Income</h3>
						<div class="calc-rows">
							<div class="calc-row">
								<span class="calc-desc">Gross Salary (CTC)</span>
								<span class="calc-amt">₹{formatIndian(results.income)}</span>
							</div>
							<div class="calc-row deduction-row">
								<span class="calc-desc">(-) Standard Deduction</span>
								<span class="calc-amt dim">₹{formatIndian(results.stdDeduction)}</span>
							</div>
							<div class="calc-row total-row">
								<span class="calc-desc">Taxable Income</span>
								<span class="calc-amt bold">₹{formatIndian(results.taxableIncome)}</span>
							</div>
						</div>
					</div>

					<!-- Step 2: Slab-wise Tax -->
					<div class="calc-group">
						<h3 class="calc-heading">Tax Slab Breakdown</h3>
						<div class="slab-table">
							<div class="slab-header">
								<span>Slab</span>
								<span>Rate</span>
								<span>Taxable Amt</span>
								<span>Tax</span>
							</div>
							{#each results.slabs as slab, i}
								<div class="slab-row" style="animation-delay: {i * 40}ms">
									<span class="slab-label">{slab.label}</span>
									<span class="slab-rate">{(slab.rate * 100).toFixed(0)}%</span>
									<span class="slab-amount">₹{formatIndian(slab.amount)}</span>
									<span class="slab-tax">₹{formatIndian(slab.tax)}</span>
								</div>
							{/each}
						</div>
					</div>

					<!-- Step 3: Tax Totals -->
					<div class="calc-group">
						<h3 class="calc-heading">Tax Computation</h3>
						<div class="calc-rows">
							<div class="calc-row">
								<span class="calc-desc">Base Tax</span>
								<span class="calc-amt">₹{formatIndian(results.baseTax)}</span>
							</div>
							{#if results.rebateApplied}
								<div class="calc-row rebate-row">
									<span class="calc-desc">Section 87A Rebate</span>
									<span class="calc-amt rebate-text">Tax waived</span>
								</div>
							{/if}
							<div class="calc-row">
								<span class="calc-desc">Education & Health Cess (4%)</span>
								<span class="calc-amt">₹{formatIndian(results.educationCess)}</span>
							</div>
							<div class="calc-row">
								<span class="calc-desc">Professional Tax (₹200/mo)</span>
								<span class="calc-amt">₹{formatIndian(results.professionalTax)}</span>
							</div>
							<div class="calc-row total-row highlight-tax">
								<span class="calc-desc">Total Income Tax</span>
								<span class="calc-amt bold">₹{formatIndian(results.totalTax)}</span>
							</div>
						</div>
					</div>

					<!-- Step 4: PF -->
					<div class="calc-group">
						<h3 class="calc-heading">PF Deduction</h3>
						<div class="calc-rows">
							<div class="calc-row">
								<span class="calc-desc">Employee PF (₹{formatIndian(pfMonthly)} x 12)</span>
								<span class="calc-amt">₹{formatIndian(results.pfEmployeeYearly)}</span>
							</div>
							<div class="calc-row">
								<span class="calc-desc">Employer PF (₹{formatIndian(pfMonthly)} x 12)</span>
								<span class="calc-amt">₹{formatIndian(results.pfEmployerYearly)}</span>
							</div>
							<div class="calc-row total-row">
								<span class="calc-desc">Total PF</span>
								<span class="calc-amt bold">₹{formatIndian(results.totalPF)}</span>
							</div>
						</div>
					</div>

					<!-- Step 5: In-Hand -->
					<div class="calc-group final-group">
						<h3 class="calc-heading">In-Hand Salary</h3>
						<div class="calc-rows">
							<div class="calc-row">
								<span class="calc-desc">CTC</span>
								<span class="calc-amt">₹{formatIndian(results.income)}</span>
							</div>
							<div class="calc-row deduction-row">
								<span class="calc-desc">(-) Income Tax</span>
								<span class="calc-amt dim">₹{formatIndian(results.totalTax)}</span>
							</div>
							<div class="calc-row deduction-row">
								<span class="calc-desc">(-) Total PF</span>
								<span class="calc-amt dim">₹{formatIndian(results.totalPF)}</span>
							</div>
							<div class="calc-row total-row highlight-green">
								<span class="calc-desc">In-Hand (Yearly)</span>
								<span class="calc-amt bold green">₹{formatIndian(results.inHandYearly)}</span>
							</div>
							<div class="calc-row total-row highlight-green">
								<span class="calc-desc">In-Hand (Monthly)</span>
								<span class="calc-amt bold green">₹{formatIndian(Math.round(results.inHandMonthly))}</span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.page {
		padding: 1.5rem 0 2rem;
	}

	/* ─── Regime Toggle ─── */
	.regime-section {
		display: flex;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.regime-toggle {
		position: relative;
		display: grid;
		grid-template-columns: 1fr 1fr;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		padding: 0.25rem;
		width: 100%;
		max-width: 320px;
	}

	.regime-btn {
		position: relative;
		z-index: 1;
		padding: 0.625rem 1.25rem;
		background: none;
		border: none;
		color: var(--text-muted);
		font-family: 'Outfit', sans-serif;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: color 0.25s;
		border-radius: 0.5rem;
	}

	.regime-btn.active {
		color: #09090b;
	}

	.regime-slider {
		position: absolute;
		top: 0.25rem;
		left: 0.25rem;
		width: calc(50% - 0.25rem);
		height: calc(100% - 0.5rem);
		background: var(--gold);
		border-radius: 0.5rem;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 0;
	}

	.regime-slider.slide-right {
		transform: translateX(100%);
	}

	/* ─── Input Section ─── */
	.input-section {
		margin-bottom: 0.75rem;
	}

	.input-label {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 0.5rem;
	}

	.salary-input-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.salary-field {
		width: 100%;
		padding: 1rem 5rem 1rem 1.25rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--text);
		background: var(--surface);
		border: 1.5px solid var(--border);
		border-radius: 0.875rem;
		outline: none;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.salary-field::placeholder {
		color: var(--text-muted);
		opacity: 0.4;
	}

	.salary-field:focus {
		border-color: var(--gold);
		box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
	}

	.input-unit {
		position: absolute;
		right: 1.25rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-muted);
		letter-spacing: 0.04em;
		pointer-events: none;
	}

	.salary-converted {
		margin: 0.5rem 0 0;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8125rem;
		color: var(--gold);
		font-weight: 500;
	}

	.input-warning {
		margin: 0.5rem 0 0;
		font-size: 0.8125rem;
		color: var(--red);
		font-weight: 500;
	}

	/* ─── PF Section ─── */
	.pf-section {
		margin-bottom: 2rem;
		padding: 0.875rem 1rem;
		background: var(--surface);
		border: 1px solid var(--border-subtle);
		border-radius: 0.75rem;
	}

	.pf-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.pf-label {
		font-size: 0.8125rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.pf-input-wrap {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background: var(--surface-alt);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		padding: 0.375rem 0.625rem;
	}

	.pf-currency {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	.pf-field {
		width: 5rem;
		padding: 0;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-secondary);
		background: transparent;
		border: none;
		outline: none;
	}

	.pf-note {
		margin: 0.375rem 0 0;
		font-size: 0.6875rem;
		color: var(--text-muted);
		opacity: 0.7;
	}

	/* ─── Results ─── */
	.results {
		animation: fadeUp 0.4s ease-out;
	}

	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.summary-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.summary-card {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 1.125rem 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.875rem;
		transition: border-color 0.2s;
	}

	.summary-card:hover {
		border-color: var(--border);
	}

	.inhand-card {
		grid-column: 1 / -1;
		border-color: rgba(52, 211, 153, 0.2);
		background: linear-gradient(135deg, rgba(52, 211, 153, 0.05) 0%, var(--surface) 100%);
	}

	.inhand-card:hover {
		border-color: rgba(52, 211, 153, 0.35);
	}

	.card-label {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.card-value {
		font-family: 'JetBrains Mono', monospace;
		font-size: 1.375rem;
		font-weight: 700;
		line-height: 1.2;
	}

	.tax-value {
		color: var(--red);
	}

	.pf-value {
		color: var(--text-secondary);
	}

	.inhand-value {
		color: var(--green);
		font-size: 1.75rem;
	}

	.card-sub {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		color: var(--text-muted);
		font-weight: 500;
	}

	.inhand-sub {
		color: var(--green);
		opacity: 0.7;
	}

	/* ─── Breakdown Toggle ─── */
	.breakdown-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		cursor: pointer;
		font-family: 'Outfit', sans-serif;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-secondary);
		transition: all 0.2s;
	}

	.breakdown-toggle:hover {
		color: var(--text);
		border-color: var(--text-muted);
	}

	.chevron {
		transition: transform 0.3s ease;
		color: var(--text-muted);
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	/* ─── Detailed Breakdown ─── */
	.breakdown {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		animation: fadeUp 0.35s ease-out;
	}

	.calc-group {
		padding: 1.125rem 1rem;
		background: var(--surface);
		border: 1px solid var(--border-subtle);
		border-radius: 0.875rem;
	}

	.final-group {
		border-color: rgba(52, 211, 153, 0.15);
	}

	.calc-heading {
		font-size: 0.6875rem;
		font-weight: 700;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin: 0 0 0.75rem;
	}

	.calc-rows {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.calc-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
	}

	.calc-desc {
		font-size: 0.8125rem;
		color: var(--text-secondary);
		font-weight: 400;
	}

	.calc-amt {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8125rem;
		color: var(--text-secondary);
		font-weight: 500;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	.calc-amt.bold {
		font-weight: 700;
		color: var(--text);
	}

	.calc-amt.dim {
		color: var(--text-muted);
	}

	.calc-amt.green {
		color: var(--green);
	}

	.deduction-row .calc-desc {
		color: var(--text-muted);
	}

	.total-row {
		padding-top: 0.5rem;
		border-top: 1px solid var(--border-subtle);
	}

	.total-row .calc-desc {
		font-weight: 600;
		color: var(--text);
	}

	.highlight-tax {
		border-top-color: var(--border);
	}

	.highlight-green {
		border-top-color: rgba(52, 211, 153, 0.15);
	}

	.rebate-row {
		padding: 0.375rem 0.625rem;
		margin: 0.125rem -0.625rem;
		background: rgba(52, 211, 153, 0.08);
		border-radius: 0.375rem;
	}

	.rebate-row .calc-desc {
		color: var(--green);
		font-weight: 600;
	}

	.rebate-text {
		color: var(--green) !important;
		font-family: 'Outfit', sans-serif !important;
		font-weight: 600 !important;
		font-size: 0.75rem !important;
	}

	/* ─── Slab Table ─── */
	.slab-table {
		display: flex;
		flex-direction: column;
		gap: 0;
		overflow: hidden;
		border-radius: 0.5rem;
		border: 1px solid var(--border-subtle);
	}

	.slab-header {
		display: grid;
		grid-template-columns: 1fr 0.4fr 0.7fr 0.6fr;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--surface-alt);
		font-size: 0.625rem;
		font-weight: 700;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.slab-row {
		display: grid;
		grid-template-columns: 1fr 0.4fr 0.7fr 0.6fr;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-top: 1px solid var(--border-subtle);
		animation: slabIn 0.3s ease-out both;
	}

	@keyframes slabIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.slab-label {
		font-size: 0.75rem;
		color: var(--text-secondary);
		font-weight: 400;
	}

	.slab-rate {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		color: var(--gold);
		font-weight: 600;
	}

	.slab-amount,
	.slab-tax {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		color: var(--text-secondary);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	/* ─── Responsive ─── */
	@media (max-width: 480px) {
		.page {
			padding: 1rem 0 1.5rem;
		}

		.salary-field {
			font-size: 1.25rem;
			padding: 0.875rem 4rem 0.875rem 1rem;
		}

		.summary-grid {
			gap: 0.5rem;
		}

		.card-value {
			font-size: 1.125rem;
		}

		.inhand-value {
			font-size: 1.375rem;
		}

		.slab-header,
		.slab-row {
			grid-template-columns: 1fr 0.35fr 0.65fr 0.55fr;
			gap: 0.375rem;
			padding: 0.5rem 0.5rem;
		}

		.slab-label {
			font-size: 0.6875rem;
		}

		.slab-rate,
		.slab-amount,
		.slab-tax {
			font-size: 0.6875rem;
		}

		.slab-header {
			font-size: 0.5625rem;
		}

		.calc-desc {
			font-size: 0.75rem;
		}

		.calc-amt {
			font-size: 0.75rem;
		}
	}

	.section {
		/* utility for spacing */
	}
</style>
