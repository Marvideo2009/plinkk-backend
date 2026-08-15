<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import Pricing from '$lib/components/Pricing.svelte';
	import { PUBLIC_DASHBOARD_URL } from "$env/static/public";
</script>

<Head 
	title="Tarifs" 
	description="Découvrez les offres Plinkk : un plan gratuit pour démarrer et un plan Premium pour aller plus loin."
/>

<main class="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
	<Pricing dashboardUrl={PUBLIC_DASHBOARD_URL} />
</main>
