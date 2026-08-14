<script>
  /**
   * @type {{ embedData: { url: string; }; text: any; }}
   */
   export let link;

  let embedType = 'generic';
  let embedUrl = link?.embedData?.url || '';

  $: if (embedUrl) {
    parseEmbed(embedUrl);
  }

  /**
   * @param {string | URL} url
   */
  function parseEmbed(url) {
    try {
      const urlObj = new URL(url);
      const host = urlObj.hostname.toLowerCase();

      if (host.includes('youtube.com') || host.includes('youtu.be')) {
        embedType = 'youtube';
        let videoId = null;
        if (host.includes('youtu.be')) videoId = urlObj.pathname.slice(1);
        else if (urlObj.pathname.includes('/watch')) videoId = urlObj.searchParams.get('v');
        else if (urlObj.pathname.includes('/embed/')) videoId = urlObj.pathname.split('/embed/')[1];
        else if (urlObj.pathname.includes('/shorts/')) videoId = urlObj.pathname.split('/shorts/')[1];
        
        if (videoId) {
          videoId = videoId.split(/[?&#]/)[0];
          embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
        }
      } else if (host.includes('spotify.com')) {
        embedType = 'spotify';
        if (!urlObj.pathname.includes('/embed')) {
          let cleanPath = urlObj.pathname.replace(/^\/intl-[^/]+/, '');
          embedUrl = `https://open.spotify.com/embed${cleanPath}`;
        }
      } else if (host.includes('soundcloud.com')) {
        embedType = 'soundcloud';
        if (!host.includes('w.soundcloud.com')) {
          embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(embedUrl)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
        }
      } else if (host.includes('music.apple.com')) {
        embedType = 'apple-music';
        if (!urlObj.pathname.includes('/embed')) {
          embedUrl = embedUrl.replace('music.apple.com', 'embed.music.apple.com');
        }
      } else if (host.includes('deezer.com') || host.includes('deezer.page.link') || host.includes('link.deezer.com')) {
        const deezerMatch = urlObj.pathname.match(/\/(track|album|playlist|artist)\/(\d+)/);
        if (deezerMatch) {
          embedType = 'deezer';
          embedUrl = `https://widget.deezer.com/widget/dark/${deezerMatch[1]}/${deezerMatch[2]}`;
        } else {
          embedType = 'deezer-card';
        }
      } else if (host.includes('twitch.tv')) {
        embedType = 'twitch';
        const parentHost = typeof window !== 'undefined' ? window.location.hostname || 'plinkk.fr' : 'plinkk.fr';
        const channelMatch = urlObj.pathname.match(/^\/([a-zA-Z0-9_]+)\/?$/);
        const videoMatch = urlObj.pathname.match(/\/videos\/(\d+)/);
        if (videoMatch) {
          embedUrl = `https://player.twitch.tv/?video=${videoMatch[1]}&parent=${parentHost}`;
        } else if (channelMatch && !['directory', 'videos', 'settings', 'subscriptions', 'inventory', 'wallet'].includes(channelMatch[1])) {
          embedUrl = `https://player.twitch.tv/?channel=${channelMatch[1]}&parent=${parentHost}`;
        }
      } else if (host.includes('tiktok.com')) {
        embedType = 'tiktok';
        const tiktokMatch = urlObj.pathname.match(/\/video\/(\d+)/);
        if (tiktokMatch) embedUrl = `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`;
      } else if (host.includes('discord.gg') || host.includes('discord.com')) {
        const serverIdParam = urlObj.searchParams.get('id');
        if (serverIdParam || urlObj.pathname.includes('/widget')) {
          embedType = 'discord';
          if (serverIdParam) embedUrl = `https://discord.com/widget?id=${serverIdParam}&theme=dark`;
        } else {
          embedType = 'discord-invite';
        }
      } else if (host.includes('calendly.com')) {
        embedType = 'calendly';
        if (!embedUrl.includes('embed_type=')) {
          embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'embed_type=Inline&embed_domain=1';
        }
      } else if (host.includes('typeform.com')) {
        embedType = 'typeform';
        const typeformMatch = urlObj.pathname.match(/\/to\/([a-zA-Z0-9]+)/);
        if (typeformMatch) embedUrl = `https://form.typeform.com/to/${typeformMatch[1]}?typeform-embed=embed-widget`;
      } else if (host.includes('tally.so')) {
        embedType = 'tally';
        const tallyMatch = urlObj.pathname.match(/\/(r|forms?)\/([a-zA-Z0-9]+)/);
        if (tallyMatch) embedUrl = `https://tally.so/embed/${tallyMatch[2]}?alignLeft=1&hideTitle=1&dynamicHeight=1`;
      } else if ((host.includes('google.com') && urlObj.pathname.includes('/maps')) || host.includes('maps.google.com') || host.includes('goo.gl')) {
        embedType = 'google-maps';
        if (!embedUrl.includes('/embed')) {
          const q = urlObj.searchParams.get('q') || urlObj.pathname.replace('/maps/place/', '').replace('/maps/', '');
          if (q && q !== '/') embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
          else embedUrl = link.embedData.url.replace('/maps/', '/maps/embed?');
        }
      } else if (host.includes('buymeacoffee.com')) {
        embedType = 'buymeacoffee-card';
      } else if (host.includes('ko-fi.com')) {
        embedType = 'kofi';
        const kofiUser = urlObj.pathname.replace(/^\//, '').split('/')[0];
        if (kofiUser) embedUrl = `https://ko-fi.com/${kofiUser}/?hidefeed=true&widget=true&embed=true`;
      } else if (host.includes('gumroad.com')) {
        embedType = 'gumroad';
        if (!embedUrl.includes('wanted=true')) {
          embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'wanted=true';
        }
      } else if (host.includes('substack.com')) {
        embedType = 'substack';
        if (!urlObj.pathname.includes('/embed')) embedUrl = `https://${host}/embed`;
      } else if (host.includes('pinterest.com') || host.includes('pin.it')) {
        embedType = 'pinterest';
        const pinMatch = urlObj.pathname.match(/\/pin\/(\d+)/);
        if (pinMatch) embedUrl = `https://assets.pinterest.com/ext/embed.html?id=${pinMatch[1]}`;
      } else if (host.includes('dailymotion.com') || host.includes('dai.ly')) {
        embedType = 'dailymotion';
        let dmVideoId = host.includes('dai.ly') ? urlObj.pathname.slice(1) : (urlObj.pathname.match(/\/video\/([a-zA-Z0-9]+)/) || [])[1];
        if (dmVideoId) embedUrl = `https://www.dailymotion.com/embed/video/${dmVideoId}`;
      } else if (host.includes('vimeo.com')) {
        embedType = 'vimeo';
        const vimeoMatch = urlObj.pathname.match(/\/(\d+)/);
        if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      } else if (host.includes('figma.com')) {
        embedType = 'figma';
        embedUrl = `https://www.figma.com/embed?embed_host=plinkk&url=${encodeURIComponent(embedUrl)}`;
      }
    } catch (e) {
      console.warn("Invalid embed URL:", embedUrl);
    }
  }
</script>

<div class="discord-box embed-box" class:border-none={embedType.includes('card') || embedType === 'discord-invite'}>
  {#if !link?.embedData?.url}
    <div class="invalid-embed">Contenu intégré invalide</div>

  {:else if embedType === 'discord-invite'}
    <a href={link.embedData.url} target="_blank" rel="noopener noreferrer" class="discord-card">
      <img src="https://cdn.jsdelivr.net/gh/nicklvh/cdn@main/discord-mark-white.svg" alt="Discord" class="discord-icon" />
      <div class="card-text">
        <span class="card-title">{link.text || 'Rejoindre le serveur Discord'}</span>
        <span class="card-sub">Cliquer pour rejoindre</span>
      </div>
    </a>

  {:else if embedType === 'buymeacoffee-card'}
    <a href={link.embedData.url} target="_blank" rel="noopener noreferrer" class="bmc-card">
      <img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="BMC" class="bmc-icon" />
      <span class="bmc-text">{link.text || 'Buy me a coffee'}</span>
    </a>

  {:else if embedType === 'deezer-card'}
    <a href={link.embedData.url} target="_blank" rel="noopener noreferrer" class="deezer-card">
      <div class="deezer-icon-wrapper">
        <div class="equalizer">
          <div class="bar" style="height: 12px;"></div>
          <div class="bar" style="height: 20px;"></div>
          <div class="bar" style="height: 16px;"></div>
          <div class="bar" style="height: 24px;"></div>
        </div>
      </div>
      <div class="card-text">
        <span class="card-title">{link.text || 'Ecouter sur Deezer'}</span>
        <span class="card-sub">Ouvrir tracks/playlists</span>
      </div>
    </a>

  {:else}
    <iframe
      src={embedUrl}
      title={link.text || 'Embedded Content'}
      loading="lazy"
      class="embed-iframe {embedType}"
      allow={embedType === 'youtube' || embedType === 'twitch' || embedType === 'dailymotion' || embedType === 'vimeo'
        ? "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
        : embedType === 'spotify'
        ? "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        : embedType === 'apple-music'
        ? "autoplay; encrypted-media; fullscreen"
        : "autoplay"}
      allowfullscreen={['youtube', 'twitch', 'dailymotion', 'vimeo', 'figma'].includes(embedType)}
      sandbox={embedType === 'apple-music' ? "allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation" : undefined}
    ></iframe>
  {/if}
</div>

<style>
  .embed-box {
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .border-none {
    border: none !important;
  }

  .invalid-embed {
    padding: 16px;
    text-align: center;
    opacity: 0.7;
  }

  .discord-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #5865F2;
    border-radius: 12px;
    text-decoration: none;
    color: #fff;
    transition: filter 0.2s;
  }
  .discord-card:hover { filter: brightness(1.1); }
  .discord-icon { width: 40px; height: 40px; flex-shrink: 0; }

  .bmc-card {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px;
    background: #FFDD00;
    border-radius: 12px;
    text-decoration: none;
    color: #000;
    font-family: "Cookie", cursive, sans-serif;
    transition: transform 0.2s;
  }
  .bmc-card:hover { transform: scale(1.02); }
  .bmc-icon { width: 35px; height: auto; flex-shrink: 0; }
  .bmc-text { font-weight: 700; font-size: 20px; letter-spacing: 0.5px; }

  .deezer-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: linear-gradient(90deg, #323232 0%, #191414 100%);
    border-radius: 12px;
    text-decoration: none;
    color: #fff;
    transition: opacity 0.2s;
  }
  .deezer-card:hover { opacity: 0.9; }
  .deezer-icon-wrapper {
    width: 48px;
    height: 48px;
    background: #EF5466;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .equalizer { display: flex; gap: 2px; align-items: center; height: 20px; }
  .equalizer .bar { width: 4px; background: #fff; border-radius: 2px; }

  .card-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .card-title { font-weight: 600; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card-sub { font-size: 12px; opacity: 0.8; }

  .embed-iframe {
    width: 100%;
    border: none;
    min-height: 200px;
  }

  .youtube, .twitch, .dailymotion, .vimeo, .figma { aspect-ratio: 16 / 9; height: auto; }
  .spotify { height: 152px; }
  .soundcloud { height: 166px; }
  .apple-music { height: 175px; }
  .deezer { height: 300px; }
  .tiktok { height: 740px; max-width: 325px; margin: 0 auto; }
  .discord { height: 400px; }
  .calendly { height: 630px; }
  .typeform, .tally { height: 500px; }
  .google-maps { height: 300px; border-radius: 8px; }
  .buymeacoffee, .gumroad { height: 600px; }
  .kofi { height: 712px; }
  .substack { height: 320px; }
  .pinterest { height: 500px; }
</style>