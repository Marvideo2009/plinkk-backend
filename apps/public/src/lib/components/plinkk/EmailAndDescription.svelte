<script lang="ts">
  import { onDestroy } from 'svelte';

  export let profileData: {
    email?: string;
    description?: string;
  } = {};

  $: email = profileData.email?.trim() || '';
  $: description = profileData.description?.trim() || '';

  let copied = false;
  let copyModalMsg = '';
  let showModal = false;

  let spamCount = 0;
  let lastClick = 0;
  let rpLaunched = false;
  let buttonStateClass = ''; // 'btn-crack', 'btn-broken', 'btn-explode'
  let buttonStyle = '';
  let isExploded = false;

  let btnVibrate = false;
  let parentVibrate = false;
  let bodyVibrate = false;

  let resetTimeout: ReturnType<typeof setTimeout> | null = null;
  let iconTimeout: ReturnType<typeof setTimeout> | null = null;
  let modalTimeout: ReturnType<typeof setTimeout> | null = null;
  let rpInterval: ReturnType<typeof setInterval> | null = null;

  onDestroy(() => {
    clearAllTimers();
  });

  function clearAllTimers() {
    if (resetTimeout) clearTimeout(resetTimeout);
    if (iconTimeout) clearTimeout(iconTimeout);
    if (modalTimeout) clearTimeout(modalTimeout);
    if (rpInterval) clearInterval(rpInterval);
  }

  function showCopyModal(msg: string) {
    copyModalMsg = msg;
    showModal = true;
    if (modalTimeout) clearTimeout(modalTimeout);
    modalTimeout = setTimeout(() => {
      showModal = false;
    }, 2000);
  }

  function handleCopy() {
    if (isExploded) return;

    const now = Date.now();
    if (now - lastClick < 400) {
      spamCount++;
    } else {
      spamCount = 1;
      rpLaunched = false;
      buttonStateClass = '';
      buttonStyle = '';
    }
    lastClick = now;

    if (resetTimeout) clearTimeout(resetTimeout);
    resetTimeout = setTimeout(() => {
      spamCount = 0;
      rpLaunched = false;
      buttonStateClass = '';
      buttonStyle = '';
    }, 5000);

    if (spamCount >= 3 && spamCount < 6) {
      btnVibrate = true;
      setTimeout(() => (btnVibrate = false), 200);
    } else if (spamCount >= 6 && spamCount < 10) {
      parentVibrate = true;
      setTimeout(() => (parentVibrate = false), 200);
    } else if (spamCount >= 10 && spamCount < 100) {
      bodyVibrate = true;
      setTimeout(() => (bodyVibrate = false), 200);
    }

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(email)
        .then(() => {
          copied = true;
          if (iconTimeout) clearTimeout(iconTimeout);
          iconTimeout = setTimeout(() => {
            copied = false;
          }, 2000);
        })
        .catch(() => {
          showCopyModal('Erreur lors de la copie');
        });
    } else {
      // Fallback manuel
      const tempInput = document.createElement('input');
      tempInput.value = email;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      showCopyModal('Copié (fallback)');
    }

    if (spamCount >= 100 && !rpLaunched) {
      rpLaunched = true;
      launchCopyRP();
      return;
    }

    if (spamCount >= 200 && spamCount < 500) {
      buttonStateClass = 'btn-crack';
    } else if (spamCount >= 500 && spamCount < 1000) {
      buttonStateClass = 'btn-broken';
    } else if (spamCount >= 1000) {
      buttonStateClass = 'btn-explode';
      setTimeout(() => {
        isExploded = true;
        showCopyModal('Le bouton a explosé !');
      }, 800);
      return;
    }

    // Messages d'easter egg
    let msg = '';
    if (spamCount === 1) msg = 'Copie !';
    else if (spamCount === 2) msg = 'Super Copie !';
    else if (spamCount === 3) msg = 'Hyper Copie !';
    else if (spamCount === 4) msg = 'Ultra Copie !';
    else if (spamCount === 5) msg = 'Mega Copie !';
    else if (spamCount === 6) msg = 'Stop spam 😅';
    else if (spamCount > 6 && spamCount < 10) msg = 'Trop de copies !';
    else if (spamCount >= 10 && spamCount < 20) msg = 'Arrête de spammer !';
    else if (spamCount >= 20 && spamCount < 30) msg = "Tu es vraiment motivé à copier !";
    else if (spamCount >= 30 && spamCount < 40) msg = "Tu ne t'arrêtes jamais ?";
    else if (spamCount >= 40 && spamCount < 50) msg = 'Toujours là ?';
    else if (spamCount >= 50 && spamCount < 60) msg = "C'est infini ?";
    else if (spamCount >= 60 && spamCount < 70) msg = 'Tu veux casser le bouton ?';
    else if (spamCount >= 70 && spamCount < 80) msg = 'Courageux !';
    else if (spamCount >= 80 && spamCount < 90) msg = 'Toujours pas fatigué ?';
    else if (spamCount >= 90 && spamCount < 100) msg = '100 bientôt !';
    else if (spamCount >= 100 && spamCount < 101) msg = 'Tu es un vrai spammeur !';

    if (msg) showCopyModal(msg);
  }

  function launchCopyRP() {
    const rpMessages = [
      '💥 Le bouton commence à chauffer...',
      '😱 Tu sens cette odeur de plastique brûlé ?',
      '⚡ Des fissures apparaissent sur le bouton !',
      '🛑 Le bouton crie : « Arrête de me copier ! »',
      '🔥 Le bouton se fissure de plus en plus...',
      '🤖 Le bouton : « Je vais craquer... »',
      '🌈 Explosion de couleurs !',
      '🎉 Le bouton se déforme et tremble...',
      '👏 Tu es un vrai spammeur !'
    ];
    let i = 0;
    rpInterval = setInterval(() => {
      showCopyModal(rpMessages[i]);

      if (i === 2) buttonStateClass = 'btn-crack';
      if (i === 4) btnVibrate = true;
      if (i === 6) buttonStyle = 'background: linear-gradient(90deg, #ff00cc, #3333ff); color: #fff;';
      if (i === 7) buttonStateClass = 'btn-broken';

      i++;
      if (i >= rpMessages.length) {
        if (rpInterval) clearInterval(rpInterval);
      }
    }, 1200);
  }
</script>

<!-- Classe globale temporaire appliquée sur la page complète si spam élevé -->
<svelte:body class:vibrate_parent={bodyVibrate} />

<div
  class="email-description-container"
  style={!description ? 'background: none;' : ''}
>
  {#if email}
    <div
      class="email"
      class:vibrate_parent={parentVibrate}
      style="position: relative; padding: 0;"
    >
      <a
        href="mailto:{email}"
        style="display: block; padding: 12px; text-align: center;"
      >
        {email}
      </a>

      {#if !isExploded}
        <button
          type="button"
          title="Copier l'email"
          class="copy-btn {buttonStateClass}"
          class:vibrate_btn={btnVibrate}
          style={buttonStyle}
          on:click={handleCopy}
        >
          {#if buttonStateClass === 'btn-explode'}
            💥
          {:else if copied}
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          {:else}
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          {/if}
        </button>
      {/if}

      {#if showModal}
        <div class="copy-modal">
          {copyModalMsg}
        </div>
      {/if}
    </div>
  {/if}

  {#if description}
    <div class="profile-description">
      <p>
        {description}
      </p>
    </div>
  {/if}
</div>

<style>
  .email-description-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .email {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .copy-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .profile-description p {
    white-space: pre-line; /* Conserve automatiquement les sauts de ligne (\n) sans risquer d'injection HTML avec {@html} */
    word-break: break-word;
  }

  .copy-modal {
    position: absolute;
    bottom: -35px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    white-space: nowrap;
    z-index: 10;
    pointer-events: none;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, 5px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }

  /* Classes de vibrations et dégradations */
  :global(.vibrate_parent) {
    animation: vibrate 0.1s linear infinite;
  }

  .vibrate_btn {
    animation: vibrate 0.1s linear infinite;
  }

  @keyframes vibrate {
    0% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
  }
</style>