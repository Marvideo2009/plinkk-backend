<script lang="ts">
  import { onMount } from 'svelte';
  import StatusBar from './StatusBar.svelte';

  type Cosmetics = {
    frame?: 'none' | 'neon' | 'glow' | 'gold' | string | null;
  };

  export let profileData: {
    profileLink?: string | null;
    profileImage?: string | null;
    profileIcon?: string | null;
    profileSiteText?: string | null;
    profileHoverColor?: string | null;
    userName?: string | null;
    cosmetics?: Cosmetics | null;
    statusbar?: {
      text: string | null;
      id: string;
      plinkkId: string;
      colorBg: string | null;
      colorText: string | null;
      fontTextColor: number | null;
      statusText: string | null;
    } | null;
  } = {};

  const DEFAULT_AVATAR = 'https://cdn.plinkk.fr/logo.svg';
  const DEFAULT_ICON = 'https://cdn.plinkk.fr/default_profile.png';

  // Extractions réactives
  $: link = profileData?.profileLink?.trim() || '';
  $: imageSrc = profileData?.profileImage?.trim() || '';
  $: iconSrc = profileData?.profileIcon?.trim() || '';
  $: siteText = profileData?.profileSiteText?.trim() || '';
  $: hoverColor = profileData?.profileHoverColor?.trim() || '';
  $: frame = profileData?.cosmetics?.frame || 'none';
  $: userName = profileData?.userName?.trim() || '';

  $: isValidColor = Boolean(hoverColor && hoverColor !== '#');

  let imgLoaded = false;
  let imgFailed = false;
  let iconLoaded = false;
  let iconFailed = false;
  let currentImageSrc = imageSrc || DEFAULT_AVATAR;
  let currentIconSrc = iconSrc || DEFAULT_ICON;
  let triedImageFallback = false;
  let triedIconFallback = false;

  $: if (imageSrc) {
    currentImageSrc = imageSrc;
    imgFailed = false;
    imgLoaded = false;
    triedImageFallback = false;
  }

  $: if (iconSrc) {
    currentIconSrc = iconSrc;
    iconFailed = false;
    iconLoaded = false;
    triedIconFallback = false;
  }

  function handleImageError() {
    if (!triedImageFallback) {
      triedImageFallback = true;
      currentImageSrc = DEFAULT_AVATAR;
    } else {
      imgFailed = true;
      imgLoaded = true;
    }
  }

  function handleIconError() {
    if (!triedIconFallback) {
      triedIconFallback = true;
      currentIconSrc = DEFAULT_ICON;
    } else {
      iconFailed = true;
      iconLoaded = true;
    }
  }

  // Masquer les menus contextuels et drag & drop sur les images
  function preventDragAndContext(node: HTMLElement) {
    const handleDrag = (e: DragEvent) => e.preventDefault();
    const handleContext = (e: MouseEvent) => e.preventDefault();
    node.addEventListener('dragstart', handleDrag);
    node.addEventListener('contextmenu', handleContext);
    return {
      destroy() {
        node.removeEventListener('dragstart', handleDrag);
        node.removeEventListener('contextmenu', handleContext);
      }
    };
  }

  function isValidUrl(url: string): boolean {
    if (!url) return false;
    const trimmed = url.toLowerCase();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/');
  }
</script>

{#if isValidColor && link}
  <div class="profile-container">
    <a
      href={isValidUrl(link) ? link : '#'}
      target={isValidUrl(link) ? '_blank' : undefined}
      rel={isValidUrl(link) ? 'noopener noreferrer' : undefined}
      title={!isValidUrl(link) ? 'Lien non valide' : undefined}
      tabindex="0"
    >
      <!-- Avatar Wrapper -->
      {#if imageSrc}
        <div
          class="profile-pic-wrapper"
          class:animate-pulse={!imgLoaded}
          class:bg-white-10={!imgLoaded}
          style="position: relative;"
        >
          <!-- Frame Cosmetic -->
          {#if frame && frame !== 'none'}
            <div class="avatar-frame frame-{frame}"></div>
          {/if}

          {#if !imgFailed}
            <img
              src={currentImageSrc}
              alt="Profile"
              class="profile-pic"
              class:opacity-0={!imgLoaded}
              loading="lazy"
              use:preventDragAndContext
              on:load={() => (imgLoaded = true)}
              on:error={handleImageError}
            />
          {:else}
            <!-- Fallback initiale si l'image plante totalement -->
            <span class="profile-pic-initial">
              {userName.charAt(0).toUpperCase()}
            </span>
          {/if}
        </div>
      {/if}

      <!-- Profile Link & Icon -->
      {#if iconSrc || siteText}
        <div class="profile-link">
          <span>
            {#if iconSrc && !iconFailed}
              <span
                class="profile-icon-wrapper"
                class:animate-pulse={!iconLoaded}
                class:bg-white-10={!iconLoaded}
              >
                <img
                  src={currentIconSrc}
                  alt="globe"
                  class="profile-icon"
                  class:opacity-0={!iconLoaded}
                  loading="lazy"
                  use:preventDragAndContext
                  on:load={() => (iconLoaded = true)}
                  on:error={handleIconError}
                />
              </span>
            {/if}

            {#if siteText}
              <p class="profile-site-text">{siteText}</p>
            {/if}
          </span>
        </div>
      {/if}
    </a>
    <StatusBar profileData={{ statusbar: profileData.statusbar }} />
  </div>
{/if}

<style>
</style>