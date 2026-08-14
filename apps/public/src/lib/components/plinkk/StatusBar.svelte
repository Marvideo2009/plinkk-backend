<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let profileData: {
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

  const MAX_CHARACTER = 50;

  $: rawText = profileData?.statusbar?.text || '';
  $: hasText = rawText.trim().length > 0;
  $: text = rawText.substring(0, MAX_CHARACTER) + (rawText.length > MAX_CHARACTER ? '...' : '');

  $: statusClass = getStatusClass(profileData?.statusbar?.statusText);

  function getStatusClass(statusText?: string | null): string {
    const status = String(statusText || "").toLowerCase();

    if (
      status.includes("busy") ||
      status.includes("occupé") ||
      status.includes("work")
    ) {
      return "status-busy";
    }
    if (
      status.includes("away") ||
      status.includes("absent") ||
      status.includes("afk")
    ) {
      return "status-away";
    }
    if (
      status.includes("offline") ||
      status.includes("off") ||
      status.includes("déconnecté")
    ) {
      return "status-offline";
    }
    return "status-online";
  }

  let visible = false;
  let isTextVisible = false;
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    const entryTimeout = setTimeout(() => {
      visible = true;
    }, 800);

    return () => clearTimeout(entryTimeout);
  });

  onDestroy(() => {
    if (hideTimeout) clearTimeout(hideTimeout);
  });

  function showText() {
    if (hideTimeout) clearTimeout(hideTimeout);
    isTextVisible = true;
  }

  function hideText() {
    hideTimeout = setTimeout(() => {
      isTextVisible = false;
    }, 500);
  }

  function toggleText(e: MouseEvent) {
    e.stopPropagation();
    if (isTextVisible) {
      isTextVisible = false;
      if (hideTimeout) clearTimeout(hideTimeout);
    } else {
      showText();
    }
  }
</script>

{#if hasText}
  <div
    class="status-bar-container"
    class:visible
    on:mouseenter={showText}
    on:mouseleave={hideText}
    role="region"
    aria-label="Statut utilisateur"
  >
    <div class="statusBarText" class:show={isTextVisible}>
      {text}
    </div>

    <button
      type="button"
      class="circle-status-bar {statusClass}"
      on:click={toggleText}
      aria-label="Basculer le texte de statut"
    />
  </div>
{/if}

<style>
  .status-bar-container.visible {
    opacity: 1;
  }
</style>
