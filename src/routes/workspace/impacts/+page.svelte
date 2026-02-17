<script lang="ts">
	import { base } from '$app/paths';
	import EditImpactModal from '$lib/components/EditImpactModal.svelte';
	import { impacts } from '$lib/stores/impacts.js';
	import { project } from '$lib/stores/project.js';
	import { DCBRisk } from '$lib/utils/dcbRisk';
	import type { RiskResult } from '$lib/utils/dcbRisk';

	interface Impact {
		id: string;
		description: string;
		severity?: string;
	}

	interface HazardImpactEntry {
		impactID: string;
		likelihood?: string;
	}

	interface ImpactUsage {
		hazardId: string;
		likelihood?: string;
	}

	interface ImpactRow {
		impact: Impact;
		hazardIds: string[];
		usageCount: number;
		worstRisk: RiskResult | null;
	}

	const levels: Record<string, number> = {
		Catastrophic: 5,
		Major: 4,
		Considerable: 3,
		Significant: 2,
		Minor: 1,
		'Almost Certain': 5,
		Likely: 4,
		Possible: 3,
		Unlikely: 2,
		Rare: 1
	};

	const severityOptions = ['Catastrophic', 'Major', 'Considerable', 'Significant', 'Minor'];

	const riskBadgeClasses: Record<number, string> = {
		1: 'bg-success text-white',
		2: 'bg-info text-dark',
		3: 'bg-warning text-dark',
		4: 'bg-danger text-white',
		5: 'bg-danger text-white'
	};

	let searchText = '';
	let selectedImpactId: string | null = null;
	let showEditor = false;
	let newImpactDescription = '';
	let newImpactSeverity = '';

	function getNextImpactId(list: Impact[]): string {
		const maxId = list.reduce((max, item) => {
			const match = item.id?.match(/\d+/);
			if (!match) return max;
			const value = Number.parseInt(match[0], 10);
			return Number.isNaN(value) ? max : Math.max(max, value);
		}, 0);

		return `I${String(maxId + 1).padStart(2, '0')}`;
	}

	function assessRisk(likelihood?: string, severity?: string): RiskResult | null {
		const likNum = likelihood ? levels[likelihood] : undefined;
		const sevNum = severity ? levels[severity] : undefined;
		if (!likNum || !sevNum) return null;
		return DCBRisk.assess(likNum, sevNum);
	}

	function addImpact() {
		const description = newImpactDescription.trim();
		if (!description || !newImpactSeverity) {
			alert('Please enter an impact description and select a severity.');
			return;
		}

		impacts.update((list: Impact[]) => [
			...list,
			{
				id: getNextImpactId(list),
				description,
				severity: newImpactSeverity
			}
		]);

		newImpactDescription = '';
		newImpactSeverity = '';
	}

	function openEditor(impactId: string) {
		selectedImpactId = impactId;
		showEditor = true;
	}

	function closeEditor() {
		showEditor = false;
	}

	function removeImpact(impactId: string) {
		if (!confirm('Are you sure you want to remove this impact?')) return;

		impacts.update((list: Impact[]) => list.filter((i) => i.id !== impactId));

		// Also clean hazard references to avoid stale linked entries.
		project.update((proj: any) => ({
			...proj,
			hazards: (proj.hazards || []).map((hazard: any) => ({
				...hazard,
				impactIds: (hazard.impactIds || []).filter((legacyId: string) => legacyId !== impactId),
				hazardImpacts: (hazard.hazardImpacts || []).filter(
					(entry: HazardImpactEntry) => entry.impactID !== impactId
				)
			}))
		}));

		if (selectedImpactId === impactId) {
			selectedImpactId = null;
			showEditor = false;
		}
	}

	$: usageByImpact = ($project.hazards || []).reduce(
		(acc: Record<string, ImpactUsage[]>, hazard: any) => {
			for (const entry of (hazard.hazardImpacts || []) as HazardImpactEntry[]) {
				if (!entry.impactID) continue;
				if (!acc[entry.impactID]) acc[entry.impactID] = [];
				acc[entry.impactID].push({
					hazardId: hazard.id,
					likelihood: entry.likelihood
				});
			}
			return acc;
		},
		{}
	);

	$: allRows = ($impacts as Impact[])
		.map((impact): ImpactRow => {
			const usages = usageByImpact[impact.id] || [];
			const hazardIds = Array.from(new Set(usages.map((u) => u.hazardId))).filter(
				(hazardId): hazardId is string => Boolean(hazardId)
			);
			const assessed = usages
				.map((u) => assessRisk(u.likelihood, impact.severity))
				.filter((risk): risk is RiskResult => risk !== null);

			const worstRisk = assessed.reduce(
				(worst: RiskResult | null, risk) => (worst && worst.score >= risk.score ? worst : risk),
				null
			);

			return {
				impact,
				hazardIds,
				usageCount: usages.length,
				worstRisk
			};
		})
		.sort((a, b) =>
			a.impact.id.localeCompare(b.impact.id, undefined, {
				numeric: true,
				sensitivity: 'base'
			})
		);

	$: query = searchText.trim().toLowerCase();
	$: impactRows = allRows.filter((row) => {
		if (!query) return true;
		const haystack = [
			row.impact.id,
			row.impact.description,
			row.impact.severity || '',
			row.worstRisk?.rating || '',
			...row.hazardIds
		]
			.join(' ')
			.toLowerCase();
		return haystack.includes(query);
	});
</script>

<main class="container py-4">
	<h1 class="mb-2">Manage Impacts</h1>
	<p class="text-muted mb-4">
		Manage global impact definitions (description and severity). Likelihood and risk are assessed
		per hazard.
	</p>

	<div class="card mb-4">
		<div class="card-body">
			<h5 class="card-title">Add New Impact</h5>
			<div class="mb-3">
				<label for="impactDescription" class="form-label">Description</label>
				<div class="form-text mb-2">
					Describe the potential harm outcome linked to hazards in this case.
				</div>
				<textarea
					id="impactDescription"
					class="form-control"
					rows="2"
					bind:value={newImpactDescription}
				></textarea>
			</div>
			<div class="mb-3">
				<label for="impactSeverity" class="form-label">Severity</label>
				<select id="impactSeverity" class="form-select" bind:value={newImpactSeverity}>
					<option value="" disabled selected={!newImpactSeverity}>Select severity</option>
					{#each severityOptions as option}
						<option value={option}>{option}</option>
					{/each}
				</select>
			</div>
			<button class="btn btn-primary" on:click={addImpact}>Add Impact</button>
		</div>
	</div>

	<div class="mb-3">
		<label for="impactSearch" class="form-label">Search impacts</label>
		<div class="form-text mb-2">
			Filter by ID, description, severity, linked hazard ID, or risk label.
		</div>
		<input
			id="impactSearch"
			type="text"
			class="form-control"
			bind:value={searchText}
		/>
	</div>

	{#if impactRows.length}
		<div class="table-responsive">
			<table class="table-striped table-bordered table align-middle">
				<thead class="table-light">
					<tr>
						<th scope="col" style="width: 8rem;">ID</th>
						<th scope="col">Description</th>
						<th scope="col" style="width: 10rem;">Severity</th>
						<th scope="col" style="width: 16rem;">Linked Hazards</th>
						<th scope="col" style="width: 16rem;">Worst Assessed Risk</th>
						<th scope="col" style="width: 12rem;">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each impactRows as row}
						<tr>
							<td class="text-nowrap">{row.impact.id}</td>
							<td>{row.impact.description}</td>
							<td>{row.impact.severity || 'Not set'}</td>
							<td>
								{#if row.hazardIds.length}
									<div class="d-flex mb-1 flex-wrap gap-1">
										{#each row.hazardIds.slice(0, 4) as hazardId}
											<a
												class="badge text-bg-light text-decoration-none border"
												href={`${base}/workspace/hazard?id=${hazardId}`}
											>
												{hazardId}
											</a>
										{/each}
									</div>
									<small class="text-muted">
										{row.usageCount} assessment{row.usageCount === 1 ? '' : 's'}
										{#if row.hazardIds.length > 4}
											| +{row.hazardIds.length - 4} more hazards
										{/if}
									</small>
								{:else}
									<span class="text-muted">Not linked</span>
								{/if}
							</td>
							<td>
								{#if row.worstRisk}
									<span class={`badge ${riskBadgeClasses[row.worstRisk.score]}`}>
										{row.worstRisk.rating} ({row.worstRisk.score})
									</span>
								{:else}
									<span class="text-muted">Not assessed</span>
								{/if}
							</td>
							<td>
								<div class="btn-group">
									<button
										class="btn btn-sm btn-outline-primary"
										on:click={() => openEditor(row.impact.id)}
									>
										Edit
									</button>
									<button
										class="btn btn-sm btn-outline-danger"
										on:click={() => removeImpact(row.impact.id)}
									>
										Remove
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else if ($impacts as Impact[]).length === 0}
		<div class="alert alert-info mb-0" role="alert">
			No impacts have been created yet. Add your first impact above.
		</div>
	{:else}
		<div class="alert alert-secondary mb-0" role="alert">No impacts match your search.</div>
	{/if}
</main>

{#if showEditor && selectedImpactId}
	<EditImpactModal impactID={selectedImpactId} on:save={closeEditor} on:cancel={closeEditor} />
{/if}
