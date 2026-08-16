<script>
  import { onMount, onDestroy } from "svelte";
  import canvaData from "./config/canvaConfig";

  export let profileData = {};
  let selectedCanvasIndex = profileData.settings?.selectedCanvasIndex === null ? undefined : profileData.settings?.selectedCanvasIndex;

  /**
   * @type {HTMLCanvasElement}
   */
  let canvas;
  /**
   * @type {HTMLScriptElement[]}
   */
  let loadedScripts = [];

  let mounted = false;
  let isLoading = false;

  /**
   * @param {string} src
   */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (typeof document === "undefined") return resolve("");

      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        if (existingScript.getAttribute("data-loaded") === "true") {
          resolve("");
        } else {
          existingScript.addEventListener("load", () => resolve(""), { once: true });
          existingScript.addEventListener("error", (err) => reject(err), { once: true });
        }
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;

      script.onload = () => {
        script.setAttribute("data-loaded", "true");
        resolve("");
      };
      script.onerror = (err) => reject(err);

      document.body.appendChild(script);
      loadedScripts.push(script);
    });
  }

  function waitForAnimationFunction(maxRetries = 20) {
    return new Promise((resolve, reject) => {
      let retries = 0;
      const check = () => {
        // @ts-ignore
        if (typeof window.runCanvasAnimation === "function") {
          resolve(true);
        } else if (retries >= maxRetries) {
          reject(new Error("runCanvasAnimation timeout"));
        } else {
          retries++;
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  /**
   * @param {number} index
   */
  async function loadAndRunAnimation(index) {
    if (typeof window === "undefined" || !canvas || isLoading) return;

    isLoading = true

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      isLoading = false;
      return;
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const animation = canvaData[index];
    if (!animation) {
      isLoading = false;
      return;
    };

    try {
      if (animation.extensions) {
        const extList = Array.isArray(animation.extensions)
          ? animation.extensions
          : [animation.extensions];

        for (const extUrl of extList) {
          if (extUrl && extUrl !== "none") {
            await loadScript(extUrl);
          }
        }
      }

      const fileList = Array.isArray(animation.fileNames)
        ? animation.fileNames
        : [animation.fileNames];

      for (const fileName of fileList) {
        const src = fileName.startsWith("http")
          ? fileName
          : `/canvaAnimation/${fileName}`;
        await loadScript(src);
      }

      await waitForAnimationFunction();

      // @ts-ignore
      window.runCanvasAnimation(ctx, canvas);

    } catch (error) {
      console.error("Erreur lors du chargement des scripts d'animation :", error);
      setBackgroundStyles(profileData);
    } finally {
      isLoading = false
    }
  }

  /**
   * @param {{}} pData
   */
  function setBackgroundStyles(pData) {
    if (typeof document === "undefined") return;

    const _p = pData || {};
    const settings = _p.settings || {};

    const cosmetics = _p.cosmetics || {};
    const data = cosmetics.data || {};
    const effect = data.effect;

    const bgType = settings.backgroundType || _p.backgroundType || "color";

    const existingVideo = document.getElementById("background-video");
    if (existingVideo) existingVideo.remove();

    const existingEffect = document.getElementById("cosmetic-effect-overlay");
    if (existingEffect) existingEffect.remove();

    document.body.style.background = "";
    document.body.style.backgroundSize = "";
    document.body.style.backgroundAttachment = "";
    document.body.style.backgroundPosition = "";

    if (bgType === "canvas") {
      if (canvas) canvas.style.display = "block";
      loadAndRunAnimation(selectedCanvasIndex);
    } else {
      if (canvas) {
        canvas.style.display = "none";
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (bgType === "video" && (settings.backgroundVideo || _p.backgroundVideo)) {
        const videoSrc = settings.backgroundVideo || _p.backgroundVideo;
        const video = document.createElement("video");
        video.id = "background-video";
        video.src = videoSrc;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;

        Object.assign(video.style, {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: "-2",
          pointerEvents: "none",
        });

        const bgContainer = document.querySelector(".background") || document.body;
        if (bgContainer === document.body) {
          document.body.prepend(video);
        } else {
          bgContainer.innerHTML = "";
          bgContainer.appendChild(video);
        }

        document.body.style.backgroundColor = "black";

      } else if (bgType === "image" && (settings.backgroundImage || _p.backgroundImage)) {
        const imageSrc = settings.backgroundImage || _p.backgroundImage;
        document.body.style.backgroundImage = `url("${imageSrc}")`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundAttachment = "fixed";
        document.body.style.backgroundPosition = "center";

      } else if (bgType === "gradient" || bgType === "color") {
        const rawBg = _p.bgColor;
        const colors = Array.isArray(rawBg) ? rawBg.filter(Boolean) : null;
        const deg = Number.isFinite(settings.degBackgroundColor)
          ? settings.degBackgroundColor
          : Number.isFinite(_p.degBackgroundColor)
          ? _p.degBackgroundColor
          : 45;

        if (colors && colors.length > 0) {
          if (colors.length === 1 || bgType === "color") {
            const colorValue = typeof colors[0] === "string" ? colors[0] : colors[0]?.color;
            if (colorValue) {
              document.body.style.backgroundImage = "none";
              document.body.style.backgroundColor = colorValue
            };
          } else {
            const gradientStr = colors
              .map((c) => {
                if (typeof c === "string") return c;
                const stop = c.stop !== null && c.stop !== undefined ? ` ${c.stop}%` : "";
                return `${c.color}${stop}`;
              })
              .join(", ");

            document.body.style.backgroundColor = "";
            document.body.style.backgroundImage = `linear-gradient(${deg}deg in oklch, ${gradientStr})`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundAttachment = "fixed";
          }
        } else if (typeof rawBg === "string" && rawBg.trim() !== "") {
          const bgVal = rawBg.trim();
          if (
            bgVal.startsWith("http://") ||
            bgVal.startsWith("https://") ||
            bgVal.startsWith("/")
          ) {
            document.body.style.backgroundImage = `url("${bgVal}")`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundAttachment = "fixed";
            document.body.style.backgroundPosition = "center";
          } else {
            document.body.style.backgroundColor = bgVal;
          }
        }
      }
    }

    if (effect && effect !== "none") {
      const effectDiv = document.createElement("div");
      effectDiv.id = "cosmetic-effect-overlay";

      Object.assign(effectDiv.style, {
        position: "fixed",
        inset: "0",
        pointerEvents: "none",
        zIndex: "-1",
      });

      if (effect === "sparkles") {
        effectDiv.style.backgroundImage = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0L12 8L20 10L12 12L10 20L8 12L0 10L8 8L10 0Z' fill='rgba(255,255,255,0.1)'/%3E%3C/svg%3E")`;
      } else if (effect === "noise") {
        effectDiv.style.backgroundImage = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`;
      }

      document.body.appendChild(effectDiv);
    }
  }

  onMount(() => {
    mounted = true;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    setBackgroundStyles(profileData);
  })

  $: if (mounted && profileData) {
    setBackgroundStyles(profileData);
  }

  $: if (mounted && selectedCanvasIndex !== undefined) {
    if (profileData?.settings?.backgroundType === "canvas" || profileData?.backgroundType === "canvas") {
      loadAndRunAnimation(selectedCanvasIndex);
    }
  }

  onDestroy(() => {
    loadedScripts.forEach((script) => script.remove());
  });
</script>

<div class="canvas-container">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .canvas-container {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    pointer-events: none;
  }
  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
