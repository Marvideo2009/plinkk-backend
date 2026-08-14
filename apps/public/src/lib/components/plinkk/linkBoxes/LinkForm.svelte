<script>
  export let link;
  export let isLight = false;
  export let profileData = {};

  let isOpen = false;
  let formValues = {};
  let statusMessage = '';

  const defaultFields = [
    { label: 'Nom', type: 'text', required: true, name: 'name', placeholder: 'Votre nom' },
    { label: 'Email', type: 'email', required: true, name: 'email', placeholder: 'votre@email.com' },
    { label: 'Message', type: 'textarea', required: true, name: 'message', placeholder: 'Votre message...' }
  ];

  $: fields = (link.formData && link.formData.fields && link.formData.fields.length > 0)
    ? link.formData.fields
    : defaultFields;

  function toggleForm() {
    isOpen = !isOpen;
  }

  /**
   * @param {{ preventDefault: () => void; }} event
   */
  function handleSubmit(event) {
    event.preventDefault();
    statusMessage = 'Envoi en cours...';

    setTimeout(() => {
      statusMessage = 'Message envoyé avec succès !';
    }, 1000);
  }

  function getIconForLabel(label = '') {
    const text = label.toUpperCase();
    if (text.includes('NOM') || text.includes('NAME')) return 'user';
    if (text.includes('MAIL')) return 'mail';
    if (text.includes('MESSAGE') || text.includes('SUJET')) return 'message';
    return null;
  }
</script>

<div class="discord-box form-box transition-all duration-500 overflow-visible">
  <button type="button" class="form-toggle-btn" on:click={toggleForm}>
    <img
      src={link.icon || 'https://cdn.plinkk.fr/icons/mail.svg'}
      alt=""
      class="w-6 h-6 object-contain icon-img"
      style={isLight ? 'filter: brightness(0);' : ''}
      loading="lazy"
    />
    <span style="color: {isLight ? '#000000' : (profileData.buttonTextColor || '#fff')}">
      {link.text || 'Contactez-nous'}
    </span>

    <div
      class="action-container"
      style="background: {isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}"
    >
      <span class="action-text">{isOpen ? 'Fermer' : 'Ouvrir'}</span>
      <div class="chevron" class:open={isOpen}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
    </div>
  </button>

  {#if isOpen}
    <form on:submit={handleSubmit} class="form-content">
      {#each fields as field}
        <div class="form-field-wrapper">
          <label for={field.name || field.label}>
            {#if getIconForLabel(field.label) === 'user'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            {:else if getIconForLabel(field.label) === 'mail'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            {:else if getIconForLabel(field.label) === 'message'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            {/if}
            {field.label}
          </label>

          {#if field.type === 'textarea'}
            <textarea
              id={field.name || field.label}
              rows="4"
              placeholder={field.placeholder || ''}
              required={field.required !== false}
              bind:value={formValues[field.name || field.label]}
            ></textarea>
          {:else}
            <input
              type={field.type || 'text'}
              id={field.name || field.label}
              placeholder={field.placeholder || ''}
              required={field.required !== false}
              bind:value={formValues[field.name || field.label]}
            />
          {/if}
        </div>
      {/each}

      <button type="submit" class="form-submit-btn">
        <div class="shine"></div>
        <span class="btn-text">{link.formData?.buttonText || 'Envoyer'}</span>
      </button>

      {#if statusMessage}
        <p class="status-msg">{statusMessage}</p>
      {/if}
    </form>
  {/if}
</div>

<style>
  .form-box {
    height: auto;
    min-height: 60px;
    display: flex;
    flex-direction: column;
  }

  .form-toggle-btn {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 12px 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    gap: 12px;
  }

  .icon-img {
    position: relative;
    z-index: 5;
  }

  .action-container {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    position: relative;
    z-index: 5;
  }

  .action-text {
    font-size: 0.75rem;
    font-weight: 600;
  }

  .chevron {
    display: flex;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .form-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .form-field-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-field-wrapper label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .form-field-wrapper input,
  .form-field-wrapper textarea {
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: inherit;
  }

  .form-submit-btn {
    position: relative;
    padding: 10px;
    border-radius: 8px;
    border: none;
    background: #0070f3;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    overflow: hidden;
  }

  .btn-text {
    position: relative;
    z-index: 2;
  }

  .status-msg {
    font-size: 0.85rem;
    text-align: center;
    margin-top: 6px;
  }
</style>