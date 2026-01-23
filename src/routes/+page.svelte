<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let scheme: 'old' | 'new' = $state('new');
	let salary = $state<number | string>('');
	let showBreakdown = $state(false);
	let results = $state<{
		yearly: number;
		monthly: number;
		inHandYearly: number;
		inHandMonthly: number;
		breakdown: TaxBreakdown[];
	} | null>(null);

	interface TaxBreakdown {
		slab: string;
		rate: string;
		taxableAmount: number;
		tax: number;
	}

	function calculateTaxWithBreakdown(amount: number, scheme: 'old' | 'new'): { tax: number; breakdown: TaxBreakdown[] } {
		let tax = 0;
		const breakdown: TaxBreakdown[] = [];
		const income = amount * 100000; // Convert LPA to actual amount
		const standardDeduction = scheme === 'new' ? 75000 : 50000;
		let taxableIncome = income - standardDeduction;

		// Add standard deduction info
		breakdown.push({
			slab: 'Standard Deduction',
			rate: '-',
			taxableAmount: standardDeduction,
			tax: 0
		});

		if (scheme === 'new') {
			// New Tax Regime
			if (taxableIncome <= 1200000) {
				const professionalTax = 200 * 12;
				breakdown.push({
					slab: 'Professional Tax',
					rate: '₹200/month',
					taxableAmount: 0,
					tax: professionalTax
				});
				return { tax: professionalTax, breakdown };
			}

			// Calculate slabs from highest to lowest
			if (taxableIncome > 2400000) {
				const slabAmount = taxableIncome - 2400000;
				const slabTax = slabAmount * 0.3;
				tax += slabTax;
				breakdown.push({
					slab: 'Above ₹24,00,000',
					rate: '30%',
					taxableAmount: slabAmount,
					tax: slabTax
				});
				taxableIncome = 2400000;
			}
			if (taxableIncome > 2000000) {
				const slabAmount = taxableIncome - 2000000;
				const slabTax = slabAmount * 0.25;
				tax += slabTax;
				breakdown.push({
					slab: '₹20,00,001 - ₹24,00,000',
					rate: '25%',
					taxableAmount: slabAmount,
					tax: slabTax
				});
				taxableIncome = 2000000;
			}
			if (taxableIncome > 1600000) {
				const slabAmount = taxableIncome - 1600000;
				const slabTax = slabAmount * 0.2;
				tax += slabTax;
				breakdown.push({
					slab: '₹16,00,001 - ₹20,00,000',
					rate: '20%',
					taxableAmount: slabAmount,
					tax: slabTax
				});
				taxableIncome = 1600000;
			}
			if (taxableIncome > 1200000) {
				const slabAmount = taxableIncome - 1200000;
				const slabTax = slabAmount * 0.15;
				tax += slabTax;
				breakdown.push({
					slab: '₹12,00,001 - ₹16,00,000',
					rate: '15%',
					taxableAmount: slabAmount,
					tax: slabTax
				});
				taxableIncome = 1200000;
			}
			if (taxableIncome > 800000) {
				const slabAmount = taxableIncome - 800000;
				const slabTax = slabAmount * 0.1;
				tax += slabTax;
				breakdown.push({
					slab: '₹8,00,001 - ₹12,00,000',
					rate: '10%',
					taxableAmount: slabAmount,
					tax: slabTax
				});
				taxableIncome = 800000;
			}
			if (taxableIncome > 400000) {
				const slabAmount = taxableIncome - 400000;
				const slabTax = slabAmount * 0.05;
				tax += slabTax;
				breakdown.push({
					slab: '₹4,00,001 - ₹8,00,000',
					rate: '5%',
					taxableAmount: slabAmount,
					tax: slabTax
				});
			}

			// Add up to 4L as 0% slab
			const zeroSlabAmount = Math.min(taxableIncome, 400000);
			if (zeroSlabAmount > 0) {
				breakdown.push({
					slab: 'Up to ₹4,00,000',
					rate: '0%',
					taxableAmount: zeroSlabAmount,
					tax: 0
				});
			}
		} else {
			// Old Tax Regime
			if (taxableIncome > 1000000) {
				const slabAmount = taxableIncome - 1000000;
				const slabTax = slabAmount * 0.3;
				tax += slabTax;
				breakdown.push({
					slab: 'Above ₹10,00,000',
					rate: '30%',
					taxableAmount: slabAmount,
					tax: slabTax
				});
				taxableIncome = 1000000;
			}
			if (taxableIncome > 500000) {
				const slabAmount = taxableIncome - 500000;
				const slabTax = slabAmount * 0.2;
				tax += slabTax;
				breakdown.push({
					slab: '₹5,00,001 - ₹10,00,000',
					rate: '20%',
					taxableAmount: slabAmount,
					tax: slabTax
				});
				taxableIncome = 500000;
			}
			if (taxableIncome > 250000) {
				const slabAmount = taxableIncome - 250000;
				const slabTax = slabAmount * 0.05;
				tax += slabTax;
				breakdown.push({
					slab: '₹2,50,001 - ₹5,00,000',
					rate: '5%',
					taxableAmount: slabAmount,
					tax: slabTax
				});
				taxableIncome = 250000;
			}

			// Add up to 2.5L as 0% slab
			if (taxableIncome > 0) {
				breakdown.push({
					slab: 'Up to ₹2,50,000',
					rate: '0%',
					taxableAmount: taxableIncome,
					tax: 0
				});
			}
		}

		// Calculate cess (4% of tax) only when amount is greater than 50LPA
		let totalTax = tax;
		if (amount > 50_00_000) {
			const cessAmount = tax * 0.04;
			totalTax += cessAmount;
			breakdown.push({
				slab: 'Higher Education Cess',
				rate: '4% of tax',
				taxableAmount: 0,
				tax: cessAmount
			});
		}

		const cessEducation = tax * 0.04;
		totalTax += cessEducation;
		breakdown.push({
			slab: 'Education Cess',
			rate: '4% of tax',
			taxableAmount: 0,
			tax: cessEducation
		});

		const professionalTax = 200 * 12;
		totalTax += professionalTax;
		breakdown.push({
			slab: 'Professional Tax',
			rate: '₹200/month',
			taxableAmount: 0,
			tax: professionalTax
		});

		return { tax: totalTax, breakdown };
	}

	function handleSubmit() {
		const { tax: yearlyTax, breakdown } = calculateTaxWithBreakdown(Number(salary), scheme);
		const monthlyTax = yearlyTax / 12;
		const yearlyIncome = Number(salary) * 100000;
		results = {
			yearly: yearlyTax,
			monthly: monthlyTax,
			inHandYearly: yearlyIncome - yearlyTax,
			inHandMonthly: (yearlyIncome - yearlyTax) / 12,
			breakdown
		};
	}

	function handleReset() {
		scheme = 'new';
		salary = '';
		results = null;
		showBreakdown = false;
	}

	function toggleBreakdown() {
		showBreakdown = !showBreakdown;
	}

	function formatNumber(num: number): string {
		if (num >= 100000) {
			return `₹${(num / 100000).toFixed(2)}L`;
		} else if (num >= 1000) {
			return `₹${(num / 1000).toFixed(2)}K`;
		}
		return `₹${num.toFixed(2)}`;
	}

	// Format Salary (make it comma separated in Indian format)
	function formatSalary(num: number): string {
		return `₹${Number(num).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
	}

	const formattedSalary = $derived.by(() => {
		return formatSalary(Number(salary) * 100000);
	});

	function focusSalaryInput() {
		const salaryInput = document.getElementById('annual-salary');
		if (salaryInput) {
			salaryInput.focus();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleReset();
			focusSalaryInput();
		}
	}

	// Add event listener for 'Escape' key and handle URL query parameters
	onMount(() => {
		// Handle query parameters
		const urlParams = new URLSearchParams(window.location.search);
		const salaryParam = urlParams.get('salary');
		const schemeParam = urlParams.get('scheme');

		if (salaryParam) {
			const parsedSalary = parseFloat(salaryParam);
			if (!isNaN(parsedSalary)) {
				salary = parsedSalary;
				// Auto-calculate if salary is provided via URL
				setTimeout(() => {
					handleSubmit();
				}, 100);
			}
		}

		if (schemeParam && (schemeParam === 'new' || schemeParam === 'old')) {
			scheme = schemeParam;
		}

		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="calculator-container">
	<div class="background-decoration"></div>

	<div class="calculator-card">
		<div class="header-section">
			<h1 class="main-title">
				In-Hand Salary <span class="title-accent">Calculator</span>
			</h1>
			<p class="subtitle">Assessment Year 2025-26</p>
		</div>

		<form onsubmit={handleSubmit} class="calculator-form" aria-labelledby="form-title">
			<div class="form-group">
				<label for="tax-scheme" class="form-label">Tax Regime</label>
				<div class="radio-group">
					<label class="radio-option" class:active={scheme === 'new'}>
						<input
							id="tax-scheme-new"
							type="radio"
							bind:group={scheme}
							value="new"
							class="radio-input"
							aria-labelledby="new-scheme-label"
						/>
						<span class="radio-label" id="new-scheme-label">New Regime</span>
						<div class="radio-indicator"></div>
					</label>
					<label class="radio-option" class:active={scheme === 'old'}>
						<input
							type="radio"
							bind:group={scheme}
							value="old"
							class="radio-input"
							aria-labelledby="old-scheme-label"
						/>
						<span class="radio-label" id="old-scheme-label">Old Regime</span>
						<div class="radio-indicator"></div>
					</label>
				</div>
			</div>

			<div class="form-group">
				<label for="annual-salary" class="form-label">
					Annual Salary <span class="label-hint">(in Lakhs)</span>
				</label>
				<div class="input-wrapper">
					<input
						id="annual-salary"
						type="number"
						placeholder="e.g., 12.75"
						bind:value={salary}
						step="0.001"
						class="salary-input"
						aria-describedby="salary-description"
					/>
					<div class="input-suffix">LPA</div>
				</div>

				{#if salary}
					<p class="salary-display">
						<span class="salary-label">Annual Amount:</span>
						<span class="salary-amount">{formattedSalary}</span>
					</p>
				{/if}

				{#if Number(salary) > 1000}
					<p class="warning-text">
						⚠️ Earning more than ₹10 crore annually? Please verify your input.
					</p>
				{/if}
			</div>

			<div class="button-group">
				<button type="submit" class="btn btn-primary" aria-label="Calculate your in-hand salary">
					<span>Calculate</span>
					<svg class="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
				<button type="button" onclick={handleReset} class="btn btn-secondary" aria-label="Reset the form">
					Reset
				</button>
			</div>
		</form>

		{#if results}
			<div class="results-section" aria-live="polite">
				<div class="results-grid">
					<div class="result-card tax-card">
						<div class="result-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
								<path d="M9 7h6m0 10v-3m-3 3h.01M9 11h.01M12 11h.01M15 11h.01M9 14h.01M12 14h.01M15 14h.01M9 17h.01M15 17h.01M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							</svg>
						</div>
						<h3 class="result-title">Total Tax</h3>
						<div class="result-amounts">
							<div class="result-amount">
								<span class="amount-label">Monthly</span>
								<span class="amount-value">{formatNumber(results.monthly)}</span>
							</div>
							<div class="result-amount">
								<span class="amount-label">Yearly</span>
								<span class="amount-value">{formatNumber(results.yearly)}</span>
							</div>
						</div>
					</div>

					<div class="result-card income-card">
						<div class="result-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
								<path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v4m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
						<h3 class="result-title">In-Hand Salary</h3>
						<div class="result-amounts">
							<div class="result-amount">
								<span class="amount-label">Monthly</span>
								<span class="amount-value highlight">{formatNumber(results.inHandMonthly)}</span>
							</div>
							<div class="result-amount">
								<span class="amount-label">Yearly</span>
								<span class="amount-value highlight">{formatNumber(results.inHandYearly)}</span>
							</div>
						</div>
					</div>
				</div>

				<button class="breakdown-toggle" onclick={toggleBreakdown}>
					<span>Tax Breakdown Details</span>
					<svg
						class="toggle-icon"
						class:rotated={showBreakdown}
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
					>
						<path d="M5 7.5l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>

				{#if showBreakdown}
					<div class="breakdown-section">
						<h3 class="breakdown-title">Tax Slab Breakdown</h3>
						<div class="breakdown-table">
							{#each results.breakdown as item, index}
								<div class="breakdown-row" style="animation-delay: {index * 50}ms">
									<div class="breakdown-cell slab-cell">
										<span class="slab-label">{item.slab}</span>
										<span class="rate-badge">{item.rate}</span>
									</div>
									<div class="breakdown-cell amount-cell">
										{#if item.taxableAmount > 0}
											<span class="taxable-amount">{formatNumber(item.taxableAmount)}</span>
										{/if}
										<span class="tax-amount">{formatNumber(item.tax)}</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<div class="disclaimer">
					<svg class="disclaimer-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path d="M10 9v4m0-8h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<p>
						<strong>Disclaimer:</strong> This is an approximate calculation based on standard deductions.
						Your actual in-hand salary may vary based on additional exemptions and company policies.
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
		min-height: 100vh;
	}

	.calculator-container {
		position: relative;
		min-height: 100vh;
		padding: 2rem 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.background-decoration {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0.1;
		background-image:
			radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
			radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
			radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.2) 0%, transparent 50%);
		pointer-events: none;
		z-index: 0;
	}

	.calculator-card {
		position: relative;
		z-index: 1;
		max-width: 56rem;
		width: 100%;
		background: rgba(255, 255, 255, 0.98);
		backdrop-filter: blur(20px);
		border-radius: 1.5rem;
		padding: 3rem;
		box-shadow:
			0 20px 60px -15px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(255, 255, 255, 0.1);
		animation: slideUp 0.6s ease-out;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.header-section {
		text-align: center;
		margin-bottom: 3rem;
		animation: fadeIn 0.8s ease-out 0.2s both;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.main-title {
		font-family: 'Playfair Display', serif;
		font-size: 3rem;
		font-weight: 900;
		color: #0f172a;
		line-height: 1.1;
		margin: 0 0 0.5rem 0;
		letter-spacing: -0.02em;
	}

	.title-accent {
		background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		font-size: 1.125rem;
		color: #64748b;
		font-weight: 500;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.calculator-form {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		animation: fadeIn 0.8s ease-out 0.4s both;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.form-label {
		font-size: 0.875rem;
		font-weight: 700;
		color: #1e293b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.label-hint {
		font-weight: 400;
		color: #64748b;
		text-transform: none;
	}

	.radio-group {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.radio-option {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: #f8fafc;
		border: 2px solid #e2e8f0;
		border-radius: 0.75rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.radio-option:hover {
		border-color: #0ea5e9;
		background: #f0f9ff;
	}

	.radio-option.active {
		border-color: #0ea5e9;
		background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%);
		box-shadow: 0 4px 12px -2px rgba(14, 165, 233, 0.2);
	}

	.radio-input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.radio-label {
		font-weight: 600;
		color: #334155;
		font-size: 1rem;
	}

	.radio-option.active .radio-label {
		color: #0ea5e9;
	}

	.radio-indicator {
		position: absolute;
		right: 1rem;
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid #cbd5e1;
		border-radius: 50%;
		transition: all 0.3s ease;
	}

	.radio-option.active .radio-indicator {
		border-color: #0ea5e9;
		background: #0ea5e9;
		box-shadow:
			inset 0 0 0 3px white,
			0 0 0 4px rgba(14, 165, 233, 0.2);
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.salary-input {
		width: 100%;
		padding: 1rem 4rem 1rem 1.5rem;
		font-size: 1.125rem;
		font-weight: 600;
		color: #0f172a;
		background: #f8fafc;
		border: 2px solid #e2e8f0;
		border-radius: 0.75rem;
		outline: none;
		transition: all 0.3s ease;
	}

	.salary-input:focus {
		border-color: #0ea5e9;
		background: white;
		box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
	}

	.input-suffix {
		position: absolute;
		right: 1.5rem;
		font-size: 0.875rem;
		font-weight: 700;
		color: #64748b;
		letter-spacing: 0.05em;
	}

	.salary-display {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%);
		border-radius: 0.5rem;
		border: 1px solid #a7f3d0;
	}

	.salary-label {
		font-size: 0.875rem;
		color: #064e3b;
		font-weight: 600;
	}

	.salary-amount {
		font-size: 1.125rem;
		font-weight: 700;
		color: #059669;
	}

	.warning-text {
		padding: 0.75rem 1rem;
		background: #fef3c7;
		border: 1px solid #fbbf24;
		border-radius: 0.5rem;
		color: #92400e;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.button-group {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1rem;
		margin-top: 1rem;
	}

	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem 2rem;
		font-weight: 700;
		font-size: 1rem;
		border-radius: 0.75rem;
		border: none;
		cursor: pointer;
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.btn-primary {
		background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%);
		color: white;
		box-shadow: 0 4px 12px -2px rgba(14, 165, 233, 0.4);
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px -4px rgba(14, 165, 233, 0.5);
	}

	.btn-primary:active {
		transform: translateY(0);
	}

	.btn-secondary {
		background: #f1f5f9;
		color: #475569;
	}

	.btn-secondary:hover {
		background: #e2e8f0;
	}

	.btn-icon {
		transition: transform 0.3s ease;
	}

	.btn-primary:hover .btn-icon {
		transform: translateX(4px);
	}

	.results-section {
		margin-top: 3rem;
		padding-top: 3rem;
		border-top: 2px solid #e2e8f0;
		animation: fadeIn 0.6s ease-out;
	}

	.results-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.result-card {
		padding: 2rem;
		border-radius: 1rem;
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border: 2px solid #e2e8f0;
		transition: all 0.3s ease;
	}

	.result-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
	}

	.tax-card {
		border-color: #fed7aa;
		background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
	}

	.income-card {
		border-color: #a7f3d0;
		background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
	}

	.result-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 0.75rem;
		margin-bottom: 1rem;
	}

	.tax-card .result-icon {
		background: #fed7aa;
		color: #92400e;
	}

	.income-card .result-icon {
		background: #6ee7b7;
		color: #064e3b;
	}

	.result-title {
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #64748b;
		margin: 0 0 1.5rem 0;
	}

	.result-amounts {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.result-amount {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.amount-label {
		font-size: 0.875rem;
		color: #64748b;
		font-weight: 600;
	}

	.amount-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #0f172a;
	}

	.amount-value.highlight {
		color: #059669;
	}

	.breakdown-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		background: #f8fafc;
		border: 2px solid #e2e8f0;
		border-radius: 0.75rem;
		cursor: pointer;
		font-weight: 600;
		color: #334155;
		transition: all 0.3s ease;
		margin-bottom: 1.5rem;
	}

	.breakdown-toggle:hover {
		background: #f1f5f9;
		border-color: #cbd5e1;
	}

	.toggle-icon {
		transition: transform 0.3s ease;
	}

	.toggle-icon.rotated {
		transform: rotate(180deg);
	}

	.breakdown-section {
		padding: 2rem;
		background: #f8fafc;
		border-radius: 1rem;
		border: 2px solid #e2e8f0;
		margin-bottom: 2rem;
		animation: slideDown 0.4s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.breakdown-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 1.5rem 0;
	}

	.breakdown-table {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.breakdown-row {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1rem;
		padding: 1rem;
		background: white;
		border-radius: 0.5rem;
		border: 1px solid #e2e8f0;
		animation: fadeInRow 0.4s ease-out both;
	}

	@keyframes fadeInRow {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.breakdown-cell {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.slab-cell {
		flex-direction: column;
		align-items: flex-start;
	}

	.slab-label {
		font-weight: 600;
		color: #334155;
		font-size: 0.9375rem;
	}

	.rate-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background: #e0f2fe;
		color: #0369a1;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 700;
	}

	.amount-cell {
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.taxable-amount {
		font-size: 0.8125rem;
		color: #64748b;
	}

	.tax-amount {
		font-size: 1rem;
		font-weight: 700;
		color: #0f172a;
	}

	.disclaimer {
		display: flex;
		gap: 1rem;
		padding: 1.25rem;
		background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
		border: 2px solid #fbbf24;
		border-radius: 0.75rem;
		color: #78350f;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.disclaimer-icon {
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.disclaimer p {
		margin: 0;
	}

	@media (max-width: 768px) {
		.calculator-card {
			padding: 2rem 1.5rem;
		}

		.main-title {
			font-size: 2rem;
		}

		.subtitle {
			font-size: 0.875rem;
		}

		.results-grid {
			grid-template-columns: 1fr;
		}

		.button-group {
			grid-template-columns: 1fr;
		}

		.radio-group {
			grid-template-columns: 1fr;
		}

		.breakdown-row {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}

		.amount-cell {
			align-items: flex-start;
		}
	}
</style>
