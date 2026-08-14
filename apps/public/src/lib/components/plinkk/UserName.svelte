<script lang="ts">
  export let profileData: {
    userName?: string | null;
    isVerified?: boolean | null;
    showVerifiedBadge?: boolean | null;
    isPartner?: boolean | null;
    showPartnerBadge?: boolean | null;
  } = {};

  $: name = profileData?.userName?.trim() || '';
  $: hasName = name.length > 0;

  $: isVerified = Boolean(profileData?.isVerified && profileData?.showVerifiedBadge);
  $: isPartner = Boolean(profileData?.isPartner && profileData?.showPartnerBadge);
</script>

{#if hasName}
  <h1 class="profile-name">
    <span style="text-transform: capitalize;" >{name}</span>

    {#if isVerified}
      <span class="verified-badge" title="Vérifié">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M7.75 12.75L10.25 15.25L16.25 8.75"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    {/if}

    {#if isPartner}
      <span class="partner-badge" title="Partenaire">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    {/if}
  </h1>
{/if}

<style>
  .verified-badge {
    color: #3b82f6; /* Bleu style Twitter/Discord */
    display: inline-flex;
    align-items: center;
  }

  .partner-badge {
    color: #eab308; /* Jaune/Doré */
    display: inline-flex;
    align-items: center;
  }
</style>