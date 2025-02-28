<script lang="ts">
	import { onMount } from 'svelte';

	let scheme: 'old' | 'new' = $state('new');
	let salary = $state<number | string>('');
	let results = $state<{
		yearly: number;
		monthly: number;
		inHandYearly: number;
		inHandMonthly: number;
	} | null>(null);

	function calculateTax(amount: number, scheme: 'old' | 'new'): number {
		let tax = 0;
		const income = amount * 100000; // Convert LPA to actual amount
		const standardDeduction = scheme === 'new' ? 75000 : 50000;
		let taxableIncome = income - standardDeduction;

		if (scheme === 'new') {
			// New Tax Regime
			if (taxableIncome <= 1200000) {
				const professionalTax = 200 * 12;
				return professionalTax;
			}
			if (taxableIncome > 2400000) {
				tax += (taxableIncome - 2400000) * 0.3;
				taxableIncome = 2400000;
			}
			if (taxableIncome > 2000000) {
				tax += (taxableIncome - 2000000) * 0.25;
				taxableIncome = 2000000;
			}
			if (taxableIncome > 1600000) {
				tax += (taxableIncome - 1600000) * 0.2;
				taxableIncome = 1600000;
			}
			if (taxableIncome > 1200000) {
				tax += (taxableIncome - 1200000) * 0.15;
				taxableIncome = 1200000;
			}
			if (taxableIncome > 800000) {
				tax += (taxableIncome - 800000) * 0.1;
				taxableIncome = 800000;
			}
			if (taxableIncome > 400000) {
				tax += (taxableIncome - 400000) * 0.05;
			}
		} else {
			// Old Tax Regime
			if (taxableIncome > 1000000) {
				tax += (taxableIncome - 1000000) * 0.3;
				taxableIncome = 1000000;
			}
			if (taxableIncome > 500000) {
				tax += (taxableIncome - 500000) * 0.2;
				taxableIncome = 500000;
			}
			if (taxableIncome > 250000) {
				tax += (taxableIncome - 250000) * 0.05;
			}
		}

		// Calculate cess (4% of tax) only when amount is greater than 50LPA
		let totalTax = tax;
		if (amount > 50_00_000) {
			const cessAmount = tax * 0.04;
			totalTax += cessAmount;
		}

		const cessEducation = tax * 0.04;
		totalTax += cessEducation;

		const professionalTax = 200 * 12;

		totalTax += professionalTax;
		return totalTax;
	}

	function handleSubmit() {
		const yearlyTax = calculateTax(Number(salary), scheme);
		const monthlyTax = yearlyTax / 12;
		const yearlyIncome = Number(salary) * 100000;
		results = {
			yearly: yearlyTax,
			monthly: monthlyTax,
			inHandYearly: yearlyIncome - yearlyTax,
			inHandMonthly: (yearlyIncome - yearlyTax) / 12
		};
	}

	function handleReset() {
		scheme = 'new';
		salary = '';
		results = null;
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

	// Add event listener for 'Escape' key
	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div class="mx-auto mt-10 max-w-2xl rounded-lg bg-white p-6 shadow-md">
	<h1 class="mb-8 text-center text-xl font-bold text-gray-800 md:text-3xl">
		In-Hand Salary Calculator (AY 2025-26)
	</h1>

	<form onsubmit={handleSubmit} class="space-y-6" aria-labelledby="form-title">
		<div class="space-y-4">
			<label for="tax-scheme" class="block font-medium text-gray-700">Tax Scheme</label>
			<div class="flex space-x-4">
				<label class="flex items-center">
					<input
						id="tax-scheme-new"
						type="radio"
						bind:group={scheme}
						value="new"
						class="form-radio text-blue-600"
						aria-labelledby="new-scheme-label"
					/>
					<span id="new-scheme-label" class="ml-2">New Scheme</span>
				</label>
				<label class="flex items-center">
					<input
						type="radio"
						bind:group={scheme}
						value="old"
						class="form-radio text-blue-600"
						aria-labelledby="old-scheme-label"
					/>
					<span id="old-scheme-label" class="ml-2">Old Scheme</span>
				</label>
			</div>
		</div>

		<div>
			<label for="annual-salary" class="mb-1 block font-medium text-gray-700">
				Annual Salary in LPA (Lakh Per Annum). For Eg: 12.75
			</label>
			<input
				id="annual-salary"
				type="number"
				placeholder="(For example: 12.75) Enter your annual salary in LPA"
				bind:value={salary}
				step="0.001"
				class="w-full"
				aria-describedby="salary-description"
			/>
			<p class="mt-2 text-sm font-medium text-green-600">
				Your Salary is <strong>
					{!salary ? '(Enter your Salary in LPA in above box)' : formattedSalary}
				</strong> per Annum
			</p>
			<p id="salary-description" class="text-grey-400 text-sm font-thin">
				Hit Calculate to find out your In-hand Salary
			</p>

			{#if Number(salary) > 1000}
				<p class="text-sm font-medium text-red-500">
					Are your sure you are earning more than 1,000 LPA (10 crore+) ?🤔
				</p>
			{/if}
		</div>

		<div class="flex space-x-4">
			<button type="submit" class="btn" aria-label="Calculate your in-hand salary">
				Calculate
			</button>
			<button type="button" onclick={handleReset} class="btn" aria-label="Reset the form">
				Reset
			</button>
		</div>
	</form>

	{#if results}
		<div class="mt-8" aria-live="polite">
			<table class="mb-4 min-w-full divide-y divide-gray-200 border border-gray-200">
				<thead>
					<tr>
						<th
							class="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
						>
							Details
						</th>
						<th
							class="bg-gray-50 px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
							>Monthly
						</th>
						<th
							class="bg-gray-50 px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
							>Yearly
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					<tr>
						<td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
							Tax Amount
						</td>
						<td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
							{formatNumber(results.monthly)}
						</td>
						<td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
							{formatNumber(results.yearly)}
						</td>
					</tr>
					<tr>
						<td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
							In-hand Income
						</td>
						<td class="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-gray-500">
							{formatNumber(results.inHandMonthly)}
						</td>
						<td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
							{formatNumber(results.inHandYearly)}
						</td>
					</tr>
				</tbody>
			</table>
			<div class="mb-4 rounded-lg bg-yellow-100 p-4 text-yellow-800">
				<strong>Disclaimer:</strong> This is an approximate calculation. Your in-hand salary and tax
				may vary slightly from the displayed amount.
			</div>
		</div>
	{/if}
</div>
