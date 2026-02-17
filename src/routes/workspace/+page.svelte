<script lang="ts">
	import { base } from '$app/paths';
	import { project } from '$lib/stores/project.js';
	import { causes } from '$lib/stores/causes.js';
	import { impacts } from '$lib/stores/impacts.js';
	import { mitigations } from '$lib/stores/mitigations.js';

	type ChecklistKey =
		| 'clinicalSafetyOfficer'
		| 'projectDetails'
		| 'hazardLogRiskAssessment'
		| 'mitigationsInPlace'
		| 'vendorComplianceReview'
		| 'alternativeOptionsAnalysis';

	type ChecklistTemplate = {
		key: ChecklistKey;
		title: string;
		description: string;
		link: string;
		cta: string;
	};

	type ChecklistRow = ChecklistTemplate & {
		done: boolean;
		statusText: string;
		indicatorText: string;
		indicatorClass: string;
	};

	const checklistTemplate: ChecklistTemplate[] = [
		{
			key: 'clinicalSafetyOfficer',
			title: 'Named Clinical Safety Officer',
			description: 'Record the accountable person for clinical safety oversight.',
			link: '/workspace/project',
			cta: 'Add safety officer'
		},
		{
			key: 'projectDetails',
			title: 'Project Details Described',
			description: 'Document project scope, context, and intended use.',
			link: '/workspace/project',
			cta: 'Complete project details'
		},
		{
			key: 'hazardLogRiskAssessment',
			title: 'Hazard Log and Risk Assessment',
			description: 'Capture hazards and assess risk levels for each hazard impact.',
			link: '/workspace/hazards',
			cta: 'Review hazard log'
		},
		{
			key: 'mitigationsInPlace',
			title: 'Mitigations In Place',
			description: 'Define and maintain mitigation controls for identified risks.',
			link: '/workspace/mitigations',
			cta: 'Manage mitigations'
		},
		{
			key: 'vendorComplianceReview',
			title: 'Vendor Compliance Reviewed',
			description: 'Track completion of the vendor compliance checklist.',
			link: '/workspace/compliance',
			cta: 'Open compliance checklist'
		},
		{
			key: 'alternativeOptionsAnalysis',
			title: 'Clinical Safety Case Report Entries',
			description: 'Document case report entries, including risk/benefit analysis of alternatives.',
			link: '/workspace/case-report',
			cta: 'Update case report'
		}
	];

	let checklistRows: ChecklistRow[] = [];
	let summaryCards: { label: string; value: string; helper: string; link: string }[] = [];
	let nextActions: ChecklistRow[] = [];

	let completedCount = 0;
	let completionPercent = 0;

	$: {
		const p = $project;
		const hazardCount = p.hazards?.length ?? 0;
		const causeCount = $causes.length;
		const impactCount = $impacts.length;
		const mitigationCount = $mitigations.length;

		const caseReportSections = p.caseReportSections ?? {};
		const alternativesText = caseReportSections.alternatives ?? p.alternatives ?? '';

		const checks: Record<ChecklistKey, boolean> = {
			clinicalSafetyOfficer: Boolean(p.safetyOfficer?.trim()),
			projectDetails: Boolean(p.description?.trim()),
			hazardLogRiskAssessment: hazardCount > 0,
			mitigationsInPlace: mitigationCount > 0,
			vendorComplianceReview: Boolean(p.compliance?.vendorComplianceReviewed),
			alternativeOptionsAnalysis: Boolean(alternativesText.trim())
		};

		const statusByKey: Record<ChecklistKey, string> = {
			clinicalSafetyOfficer: checks.clinicalSafetyOfficer ? 'Recorded' : 'Not recorded',
			projectDetails: checks.projectDetails ? 'Recorded' : 'Not recorded',
			hazardLogRiskAssessment:
				hazardCount === 1 ? '1 hazard logged' : `${hazardCount} hazards logged`,
			mitigationsInPlace:
				mitigationCount === 1 ? '1 mitigation logged' : `${mitigationCount} mitigations logged`,
			vendorComplianceReview: checks.vendorComplianceReview
				? 'Checklist reviewed'
				: 'Checklist not reviewed',
			alternativeOptionsAnalysis: checks.alternativeOptionsAnalysis
				? 'Alternatives documented'
				: 'Alternatives not documented'
		};

		const indicatorByKey: Record<ChecklistKey, { text: string; className: string }> = {
			clinicalSafetyOfficer: checks.clinicalSafetyOfficer
				? { text: 'Recorded', className: 'text-bg-success' }
				: { text: 'Needs input', className: 'text-bg-secondary' },
			projectDetails: checks.projectDetails
				? { text: 'Recorded', className: 'text-bg-success' }
				: { text: 'Needs input', className: 'text-bg-secondary' },
			hazardLogRiskAssessment: checks.hazardLogRiskAssessment
				? { text: 'In progress', className: 'text-bg-info' }
				: { text: 'Needs input', className: 'text-bg-secondary' },
			mitigationsInPlace: checks.mitigationsInPlace
				? { text: 'In progress', className: 'text-bg-info' }
				: { text: 'Needs input', className: 'text-bg-secondary' },
			vendorComplianceReview: checks.vendorComplianceReview
				? { text: 'Reviewed', className: 'text-bg-success' }
				: { text: 'Needs input', className: 'text-bg-secondary' },
			alternativeOptionsAnalysis: checks.alternativeOptionsAnalysis
				? { text: 'In progress', className: 'text-bg-info' }
				: { text: 'Needs input', className: 'text-bg-secondary' }
		};

		checklistRows = checklistTemplate.map((item) => ({
			...item,
			done: checks[item.key],
			statusText: statusByKey[item.key],
			indicatorText: indicatorByKey[item.key].text,
			indicatorClass: indicatorByKey[item.key].className
		}));

		completedCount = checklistRows.filter((item) => item.done).length;
		completionPercent = Math.round((completedCount / checklistRows.length) * 100);

		summaryCards = [
			{
				label: 'Hazards',
				value: String(hazardCount),
				helper: 'Documented in register',
				link: '/workspace/hazards'
			},
			{
				label: 'Causes',
				value: String(causeCount),
				helper: 'Mapped to hazards',
				link: '/workspace/hazards'
			},
			{
				label: 'Mitigations',
				value: String(mitigationCount),
				helper: 'Active control actions',
				link: '/workspace/mitigations'
			},
			{
				label: 'Impacts',
				value: String(impactCount),
				helper: 'Clinical outcomes tracked',
				link: '/workspace/impacts'
			}
		];

		nextActions = checklistRows.filter((item) => !item.done).slice(0, 3);
	}
</script>

<main class="overview-page container py-4">
	<section class="overview-intro mb-4">
		<p class="kicker">Workspace Overview</p>
		<div class="d-flex flex-column flex-lg-row justify-content-between gap-3">
			<div>
				<h1 class="mb-2">{$project.title || 'Untitled Project'}</h1>
				<p class="text-muted mb-0">
					Use this page to track DCB0160 readiness and jump straight to the highest-priority tasks.
				</p>
			</div>
			<div class="card overview-card shadow-sm" style="min-width: 240px;">
				<div class="card-body py-3">
					<p class="small text-muted mb-2">Checklist completion</p>
					<div class="d-flex align-items-end mb-2 gap-2">
						<span class="display-6 fw-semibold mb-0">{completionPercent}%</span>
						<span class="text-muted small mb-1">{completedCount}/{checklistRows.length}</span>
					</div>
					<div class="progress" style="height: 8px;">
						<div
							class="progress-bar"
							role="progressbar"
							style={`width: ${completionPercent}%`}
							aria-valuenow={completionPercent}
							aria-valuemin="0"
							aria-valuemax="100"
						></div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="row g-3 mb-4" aria-label="Summary metrics">
		{#each summaryCards as card}
			<div class="col-xl-3 col-6">
				<a class="card summary-card text-decoration-none h-100" href={base + card.link}>
					<div class="card-body">
						<p class="summary-label">{card.label}</p>
						<p class="summary-value">{card.value}</p>
						<p class="summary-helper mb-0">{card.helper}</p>
					</div>
				</a>
			</div>
		{/each}
	</section>

	<section class="row g-3">
		<div class="col-lg-5">
			<div class="card overview-card h-100">
				<div class="card-body">
					<h2 class="h5 mb-3">Recommended next actions</h2>
					{#if nextActions.length === 0}
						<div class="alert alert-success mb-0" role="status">
							Core checklist items are currently addressed. Continue refining hazards and
							mitigations as the project evolves.
						</div>
					{:else}
						<ul class="list-group list-group-flush">
							{#each nextActions as item}
								<li class="list-group-item px-0">
									<h3 class="h6 mb-1">{item.title}</h3>
									<p class="text-muted small mb-2">{item.description}</p>
									<a class="btn btn-sm btn-outline-primary" href={base + item.link}>{item.cta}</a>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		</div>

		<div class="col-lg-7">
			<div class="card overview-card h-100">
				<div class="card-body">
					<h2 class="h5 mb-3">DCB0160 checklist</h2>
					<div class="table-responsive">
						<table class="mb-0 table align-middle">
							<thead>
								<tr>
									<th scope="col">Item</th>
									<th scope="col" class="text-nowrap">Status</th>
									<th scope="col" class="text-end">Action</th>
								</tr>
							</thead>
							<tbody>
								{#each checklistRows as item}
									<tr>
										<td>
											<h3 class="h6 mb-1">{item.title}</h3>
											<p class="text-muted small mb-0">{item.description}</p>
										</td>
										<td>
											<span class="badge status-badge {item.indicatorClass}">
												{item.indicatorText}
											</span>
											<div class="small text-muted mt-1">{item.statusText}</div>
										</td>
										<td class="text-end">
											<a class="btn btn-sm btn-link" href={base + item.link}>
												{item.done ? 'Review' : 'Update'}
											</a>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</section>
</main>

<style>
	.overview-page {
		max-width: 1100px;
	}

	.overview-intro {
		background: linear-gradient(135deg, #f8fcff 0%, #eef6fb 100%);
		border: 1px solid #d8e8f3;
		border-radius: 0.9rem;
		padding: 1.3rem;
	}

	.kicker {
		color: #0a5d91;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		font-weight: 700;
		margin-bottom: 0.35rem;
	}

	.summary-card {
		border: 1px solid #dee2e6;
		border-radius: 0.85rem;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
		color: inherit;
	}

	.summary-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 18px rgba(1, 111, 184, 0.12);
	}

	.summary-label {
		color: #6c757d;
		font-size: 0.85rem;
		margin-bottom: 0.2rem;
	}

	.summary-value {
		font-size: 1.7rem;
		line-height: 1.1;
		font-weight: 700;
		color: #1c1f23;
	}

	.summary-helper {
		margin-top: 0.3rem;
		color: #6c757d;
		font-size: 0.8rem;
	}

	.overview-card {
		border-radius: 0.9rem;
	}

	.status-badge {
		min-width: 104px;
	}

	@media (max-width: 768px) {
		.overview-intro {
			padding: 1rem;
		}

		.summary-value {
			font-size: 1.35rem;
		}
	}
</style>
