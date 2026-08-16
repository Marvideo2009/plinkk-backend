<script lang="ts">
  import type { PageData } from '../../../../routes/(app)/$types';
  import LinkEmbed from './LinkEmbed.svelte';
  import LinkForm from './LinkForm.svelte';

  export let profileData: PageData = {};

  $: bgType = profileData.backgroundType || 'color';
  $: actualBgColor = getActualBgColor(profileData, bgType);
  $: isLight = isLightTheme(actualBgColor);

  /**
   * @param {{ backgroundColor?: any; background?: any; }} data
   * @param {string} type
   */
  function getActualBgColor(data: { [x: string]: any; }, type: any) {
    let color = data.backgroundColor || '#0c0c0c';
    if (Array.isArray(data.background) && data.background.length > 0) {
      color = data.background[0].color;
    }
    return color;
  }

  /**
   * @param {string} color
   */
  function isLightTheme(color: string) {
    if (!color) return false;
    let r, g, b;
    if (color.startsWith('#')) {
      let hex = color.replace('#', '');
      if (hex.length === 3 || hex.length === 4) {
        hex = hex.substring(0, 3).split('').map(c => c + c).join('');
      }
      if (hex.length >= 6) {
        r = parseInt(hex.substring(0, 2), 16) / 255;
        g = parseInt(hex.substring(2, 4), 16) / 255;
        b = parseInt(hex.substring(4, 6), 16) / 255;
      } else return false;
    } else if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        r = parseInt(match[0]) / 255;
        g = parseInt(match[1]) / 255;
        b = parseInt(match[2]) / 255;
      } else return false;
    } else return false;

    const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    const luminance = 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    return luminance > 0.5;
  }

  $: validLinks = (profileData.links || []).filter((link: { scheduledAt: string | number | Date; expiresAt: string | number | Date; clickLimit: number; clicks: number; }) => {
    const now = new Date();
    if (link.scheduledAt && new Date(link.scheduledAt) > now) return false;
    if (link.expiresAt && new Date(link.expiresAt) < now) return false;
    if (link.clickLimit > 0 && typeof link.clicks === 'number' && link.clicks >= link.clickLimit) {
      return false;
    }
    return true;
  });
</script>

<div class="link-boxes-container">
  {#if !profileData.links || profileData.links.length === 0}
    <!-- Aucun lien -->
  {:else}
    {#each validLinks as link (link.id || link.text)}
      {#if link.type === 'EMBED' && link.embedData}
        <LinkEmbed {link} />
      {:else if link.type === 'HEADER'}
        <h3
          class="link-header"
          style="color: {isLight ? '#000000' : (profileData.textColor || '#fff')};"
        >
          {link.text}
        </h3>

      {:else if link.type === 'FORM' && link.formData}
        <LinkForm {link} {isLight} {profileData} />

      {:else}
        <a
          href={`https://plinkk.fr/click/${link.id}`}
          target="_blank"
          rel="noopener noreferrer"
          class="discord-box standard-link"
          style="color: {isLight ? '#000000' : (profileData.buttonTextColor || '#fff')}"
        >
          {#if link.icon}
            <img
              src={link.icon.startsWith("https://") ? link.icon : `https://cdn.plinkk.fr/plinkk-image/icons/${link.icon}.svg`}
              alt=""
              class="w-6 h-6 object-contain"
              style={isLight ? 'filter: brightness(0);' : ''}
            />
          {/if}
          <span>{link.text}</span>
        </a>
      {/if}
    {/each}
  {/if}
</div>

<style>
  .link-boxes-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .link-header {
    margin-top: 16px;
    margin-bottom: 8px;
    text-align: center;
    width: 100%;
    font-size: 1.2rem;
  }

  .standard-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 12px;
    text-decoration: none;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    transition: transform 0.2s ease;
  }

  .standard-link:hover {
    transform: translateY(-2px);
  }
</style>