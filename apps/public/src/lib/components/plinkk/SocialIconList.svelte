<script lang="ts">
  type SocialIcon = {
    id?: string;
    icon?: string | null;
    url?: string | null;
  };

  export let profileData: {
    socialIcon?: SocialIcon[] | null;
  } = {};

  const MAX_ICON_NUMBER = 10;

  $: icons = (profileData?.socialIcon || []).slice(0, MAX_ICON_NUMBER);

  function getIconSrc(iconValRaw?: string | null): string {
    const iconVal = String(iconValRaw || '').trim();
    if (!iconVal) return '';

    if (/^(https?:\/\/|\/|data:)/i.test(iconVal)) {
      return iconVal;
    }
    return `https://cdn.plinkk.fr/icons/${iconVal.toLowerCase().replace(/ /g, '-')}.svg`;
  }

  function isCdnIcon(src: string, iconValRaw?: string | null): boolean {
    const srcLower = src.toLowerCase();
    const iconVal = String(iconValRaw || '').trim();
    const isBootstrap = iconVal.startsWith('bi-');

    const isCatalogue =
      srcLower.includes('s3.marvideo.fr') ||
      srcLower.includes('cdn.plinkk.fr') ||
      srcLower.startsWith('/icons/');
    const isBootstrapIcon =
      isBootstrap || srcLower.includes('bi-') || srcLower.includes('bootstrap-icons');
    const isJsDelivr = srcLower.includes('cdn.jsdelivr.net');

    return isJsDelivr || isCatalogue || isBootstrapIcon;
  }

  function isValidUrl(url?: string | null): boolean {
    if (!url) return false;
    const trimmed = url.trim().toLowerCase();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:');
  }

  let loadedMap: Record<number, boolean> = {};

  function handleLoad(index: number) {
    loadedMap[index] = true;
  }

  function handleError(index: number) {
    loadedMap[index] = true;
  }

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
</script>

{#if icons.length > 0}
  <div class="icon-list">
    {#each icons as iconData, i (iconData.id || i)}
      {@const src = getIconSrc(iconData.icon)}
      {@const isCdn = isCdnIcon(src, iconData.icon)}
      {@const validUrl = isValidUrl(iconData.url)}

      <div class="icon-item" class:animate-pulse={!loadedMap[i]}>
        <a
          href={validUrl ? iconData.url : '#'}
          target={validUrl ? '_blank' : undefined}
          rel={validUrl ? 'noopener noreferrer' : undefined}
          title={!validUrl ? 'Lien non valide' : undefined}
          class="flex items-center justify-center w-full h-full"
        >
          <img
            {src}
            alt={iconData.icon || 'Social icon'}
            loading="lazy"
            class:icon-cdn={isCdn}
            class:opacity-0={!loadedMap[i]}
            use:preventDragAndContext
            on:load={() => handleLoad(i)}
            on:error={() => handleError(i)}
          />
        </a>
      </div>
    {/each}
  </div>
{/if}

<style>
</style>