import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { setCookie } from "./cookies";

export const currentTheme = writable<themeStyle | null>(null);
export const isDark = writable(false);

type themeStyle = {
  articleHoverBoxShadow: string;
  background: string;
  buttonBackground: string;
  buttonHoverBackground: string;
  buttonTextColor: string;
  darkTheme: boolean;
  hoverColor: string;
  linkHoverColor: string;
  textColor: string;
  opposite?: {
    articleHoverBoxShadow: string;
    background: string;
    buttonBackground: string;
    buttonHoverBackground: string;
    buttonTextColor: string;
    darkTheme: boolean;
    hoverColor: string;
    linkHoverColor: string;
    textColor: string;
  };
};

export function initTheme(themeConfig: themeStyle, savedCookieTheme: string) {
  if (!browser) return;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  let useDark = false;

  if (savedCookieTheme) {
    useDark = savedCookieTheme === "dark";
  } else {
    useDark = prefersDark;
  }

  const selectedTheme = useDark
    ? themeConfig.darkTheme
      ? themeConfig
      : themeConfig.opposite ?? themeConfig
    : themeConfig.darkTheme
      ? themeConfig.opposite ?? themeConfig
      : themeConfig;

  isDark.set(useDark);
  applyThemeVariables(selectedTheme, useDark);
  setIconBasedOnTheme(selectedTheme);
}

export function applyThemeVariables(theme: themeStyle, darkState: boolean) {
  if (!browser) return;

  const root = document.documentElement;

  root.style.setProperty("--bg-color", theme.background || "#ffffff");
  root.style.setProperty("--text-color", theme.textColor || "#000000");
  root.style.setProperty("--btn-bg", theme.buttonBackground || "#e0e0e0");
  root.style.setProperty("--btn-text", theme.buttonTextColor || "#000000");
  root.style.setProperty(
    "--btn-hover-bg",
    theme.buttonHoverBackground || "#cccccc",
  );
  root.style.setProperty(
    "--link-hover-color",
    theme.linkHoverColor || "#0000ff",
  );
  root.style.setProperty(
    "--article-hover-shadow",
    theme.articleHoverBoxShadow || "none",
  );

  /* if (theme.fontFamily) {
    root.style.setProperty(
      "--font-family",
      `"${theme.fontFamily}", sans-serif`,
    );
    loadGoogleFont(theme.fontFamily);
  } */

  document.body.classList.toggle("dark-theme", darkState);
  currentTheme.set(theme);
}

export function toggleTheme(theme: themeStyle) {
  const currentTheme = document.body.classList.contains("dark-theme")
    ? theme
    : theme.opposite ?? theme;
  document.body.classList.toggle("dark-theme");
  applyThemeVariables(
    currentTheme,
    document.body.classList.contains("dark-theme") ? true : false,
  );
  setIconBasedOnTheme(currentTheme);
  setCookie(
    "theme",
    document.body.classList.contains("dark-theme") ? "dark" : "light",
    365,
  );
}

function setIconBasedOnTheme(theme: themeStyle) {
  const iconElement = document.getElementById("theme-toggle-button");
  if (iconElement) {
      if (document.body.classList.contains("dark-theme") || theme.darkTheme) {
        iconElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="ionicon" ><path d="M256 48v48M256 416v48M403.08 108.92l-33.94 33.94M142.86 369.14l-33.94 33.94M464 256h-48M96 256H48M403.08 403.08l-33.94-33.94M142.86 142.86l-33.94-33.94" fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32px" /><circle cx="256" cy="256" r="80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32px"/></svg>`;
      } else {
        iconElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="ionicon"><path d="M160 136c0-30.62 4.51-61.61 16-88C99.57 81.27 48 159.32 48 248c0 119.29 96.71 216 216 216 88.68 0 166.73-51.57 200-128-26.39 11.49-57.38 16-88 16-119.29 0-216-96.71-216-216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32px" /></svg>`;
      }
  }
}

/* function loadGoogleFont(fontFamily) {
  const fontId = "google-font-" + fontFamily.replace(/\s+/g, "-").toLowerCase();
  if (!document.getElementById(fontId)) {
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, "+")}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }
} */
