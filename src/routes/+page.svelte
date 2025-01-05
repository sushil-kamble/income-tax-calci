<script lang="ts">
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
			if (taxableIncome > 1500000) {
				tax += (taxableIncome - 1500000) * 0.3;
				taxableIncome = 1500000;
			}
			if (taxableIncome > 1200000) {
				tax += (taxableIncome - 1200000) * 0.2;
				taxableIncome = 1200000;
			}
			if (taxableIncome > 1000000) {
				tax += (taxableIncome - 1000000) * 0.15;
				taxableIncome = 1000000;
			}
			if (taxableIncome > 700000) {
				tax += (taxableIncome - 700000) * 0.1;
				taxableIncome = 700000;
			}
			if (taxableIncome > 300000) {
				tax += (taxableIncome - 300000) * 0.05;
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
</script>

<div class="mx-auto mt-10 max-w-2xl rounded-lg bg-white p-6 shadow-md">
	<h1 class="mb-8 text-center text-3xl font-bold text-gray-800">Income Tax Calculator</h1>

	<form onsubmit={handleSubmit} class="space-y-6">
		<div class="space-y-4">
			<label for="tax-scheme" class="block font-medium text-gray-700">Tax Scheme</label>
			<div class="flex space-x-4">
				<label class="flex items-center">
					<input
						id="tax-scheme"
						type="radio"
						bind:group={scheme}
						value="new"
						class="form-radio text-blue-600"
					/>
					<span class="ml-2">New Scheme</span>
				</label>
				<label class="flex items-center">
					<input type="radio" bind:group={scheme} value="old" class="form-radio text-blue-600" />
					<span class="ml-2">Old Scheme</span>
				</label>
			</div>
		</div>

		<div>
			<label for="annual-salary" class="mb-1 block font-medium text-gray-700"
				>Annual Salary (LPA)
			</label>
			<input
				id="annual-salary"
				type="number"
				placeholder="Enter your annual salary in LPA (For example: 10.15)"
				bind:value={salary}
				step="0.001"
				class="w-full"
			/>
		</div>

		<div class="flex space-x-4">
			<button type="submit" class="btn"> Calculate </button>
			<button type="button" onclick={handleReset} class="btn"> Reset </button>
		</div>
	</form>

	{#if results}
		<div class="mt-8">
			<table class="min-w-full divide-y divide-gray-200">
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
						<td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
							{formatNumber(results.inHandMonthly)}
						</td>
						<td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
							{formatNumber(results.inHandYearly)}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	{/if}
</div>
