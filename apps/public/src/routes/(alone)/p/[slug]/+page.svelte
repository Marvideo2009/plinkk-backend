<script lang="ts">
  import { onMount } from "svelte";
  import Head from "$lib/components/Head.svelte";
  import type { PageData } from "./$types.js";
  import LinkBoxes from "$lib/components/plinkk/linkBoxes/LinkBoxes.svelte";
  import EmailAndDescription from "$lib/components/plinkk/EmailAndDescription.svelte";
  import SocialIconList from "$lib/components/plinkk/SocialIconList.svelte";
  import LabelButtons from "$lib/components/plinkk/LabelButtons.svelte";
  import UserName from "$lib/components/plinkk/UserName.svelte";
  import ProfileContainer from "$lib/components/plinkk/ProfileContainer.svelte";

  export let data: PageData;

  let profileConfig = data;

  $: pageTitle =
    profileConfig?.page?.name || profileConfig?.user?.name
      ? `${profileConfig?.page?.name || profileConfig?.user?.name} — Plinkk`
      : "Plinkk By PlinkkCorp";

  const DEFAULT_LAYOUT = [
    "username",
    "profile",
    "labels",
    "social",
    "email",
    "links",
  ];

  $: sortedLayout = (() => {
    const rawOrder: string[] =
      profileConfig?.settings?.layoutOrder || DEFAULT_LAYOUT;
    const knownSet = new Set(DEFAULT_LAYOUT);

    const filtered = rawOrder.filter((k) => knownSet.has(k));

    DEFAULT_LAYOUT.forEach((k) => {
      if (!filtered.includes(k)) filtered.push(k);
    });

    return filtered;
  })();

  onMount(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "plinkk:sync-config") {
        console.log("[Plinkk] Syncing configuration...", event.data.config);
        profileConfig = { ...profileConfig, ...event.data.config };
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  });

  onMount(async () => {
    (window as any).__PLINKK_USERNAME__ = profileConfig.user?.id || "";
    (window as any).__PLINKK_IDENTIFIER__ = profileConfig.page?.slug || "";
    (window as any).__PLINKK_IS_PREVIEW__ =
      new URLSearchParams(window.location.search).get("preview") === "1";
  });
</script>

<Head title={pageTitle} description={profileConfig.page.description} />

<div class="background"></div>
<article
  id="profile-article"
  class="w-full max-w-xl flex flex-col items-center"
  style="background: rgba(0, 0, 0, 0.6); color: white; animation: 1s ease-in-out 0s 1 normal none running fade; --darkreader-inline-bgimage: initial; --darkreader-inline-bgcolor: var(--darkreader-background-00000099, rgba(0, 0, 0, 0.6)); --darkreader-inline-color: var(--darkreader-text-ffffff, #e8e6e3);"
>
  {#each sortedLayout as key (key)}
    {#if key === "profile"}
      <ProfileContainer
        profileData={{
          profileLink: profileConfig.settings?.profileLink,
          profileImage: profileConfig.user?.image,
          profileIcon: profileConfig.settings?.profileIcon,
          profileSiteText: profileConfig.settings?.profileSiteText,
          profileHoverColor: profileConfig.bgColor?.[0]?.color || "#ffffff",
          userName: profileConfig.user?.name,
          cosmetics: profileConfig.settings?.cosmetics,
          statusbar: profileConfig.statusBar,
        }}
      />
    {:else if key === "username"}
      <UserName
        profileData={{
          userName: profileConfig.user?.name || profileConfig.page?.name,
          isVerified: profileConfig.user?.isVerified,
          showVerifiedBadge: profileConfig.settings?.showVerifiedBadge,
          isPartner: profileConfig.user?.isPartner,
          showPartnerBadge: profileConfig.settings?.showPartnerBadge,
        }}
      />
    {:else if key === "labels"}
      <LabelButtons profileData={{ labels: profileConfig.labels }} />
    {:else if key === "social"}
      <SocialIconList profileData={{ socialIcon: profileConfig.socialIcon }} />
    {:else if key === "email"}
      <EmailAndDescription
        profileData={{
          email: profileConfig.user?.email,
          description: profileConfig.page?.description,
        }}
      />
    {:else if key === "links"}
      <LinkBoxes profileData={profileConfig} />
    {/if}
  {/each}
</article>
<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
  <a
    href="/"
    class="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
  >
    <img src="https://cdn.plinkk.fr/logo.svg" alt="Plinkk" class="w-5 h-5" />
    Créé avec Plinkk
  </a>
</div>

<style>
  :global(body) {
    background-color: #07080d;
  }
</style>
