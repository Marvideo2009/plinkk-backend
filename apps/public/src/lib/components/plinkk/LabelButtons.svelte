<script lang="ts">
  type LabelItem = {
    id?: string;
    data?: string | null;
    color?: string | null;
    fontColor?: string | null;
  };

  export let profileData: {
    labels?: LabelItem[] | null;
  } = {};

  const MAX_LABEL_NUMBER = 7;

  // Validation d'une couleur sécurisée
  function isSafeColor(color?: string | null): boolean {
    if (!color) return false;
    const trimmed = color.trim();
    if (!trimmed || trimmed === '#') return false;
    // Vérification basique format hex (#fff / #ffffff) ou rgb/rgba/hsl
    return /^#([0-9A-F]{3}){1,2}$/i.test(trimmed) || /^(rgb|hsl)a?\(.*/i.test(trimmed);
  }

  // Filtrage des labels valides et limitation à 7
  $: validLabels = (profileData?.labels || [])
    .filter((label) => {
      const data = label.data?.trim() || '';
      const color = label.color?.trim() || '';
      const fontColor = label.fontColor?.trim() || '';

      // Filtre les labels vides ou invalides
      return data !== '' && color !== '' && color !== '#' && fontColor !== '' && fontColor !== '#';
    })
    .slice(0, MAX_LABEL_NUMBER);

  // État local de survol par bouton
  let hoveredIndex: number | null = null;

  function getBgColor(label: LabelItem, isHovered: boolean): string {
    const safe = isSafeColor(label.color);
    const baseColor = safe ? label.color! : '#cccccc';

    if (isHovered) {
      return baseColor;
    }
    // Ajoute l'opacité 50% (80 en Hex)
    return safe ? `${baseColor}80` : '#cccccc80';
  }

  function getBorder(label: LabelItem): string {
    return isSafeColor(label.color) ? `2px solid ${label.color}` : '2px solid #ccc';
  }

  function getTextColor(label: LabelItem): string {
    return isSafeColor(label.fontColor) ? label.fontColor! : '#222';
  }
</script>

{#if validLabels.length > 0}
  <div class="label-buttons-container">
    {#each validLabels as label, i (label.id || i)}
      <div
        class="label-button"
        style="
          background-color: {getBgColor(label, hoveredIndex === i)};
          border: {getBorder(label)};
          color: {getTextColor(label)};
        "
        on:mouseenter={() => (hoveredIndex = i)}
        on:mouseleave={() => (hoveredIndex = null)}
        role="status"
      >
        {label.data}
      </div>
    {/each}
  </div>
{/if}

<style>
</style>