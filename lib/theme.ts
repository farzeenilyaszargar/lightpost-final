// Apply the saved edition before the browser paints, including when storage is blocked.
export const themeInitScript = `(function(){try{document.documentElement.classList.toggle('dark',localStorage.getItem('darkMode')==='true')}catch(e){}})();`;

export function isDarkTheme() {
  return document.documentElement.classList.contains("dark");
}

export function subscribeTheme(notify: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key !== "darkMode" && event.key !== null) return;
    document.documentElement.classList.toggle("dark", event.newValue === "true");
    notify();
  }
  window.addEventListener("lightpost-theme", notify);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("lightpost-theme", notify);
    window.removeEventListener("storage", onStorage);
  };
}

export function toggleTheme() {
  const dark = !isDarkTheme();
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("darkMode", String(dark));
  } catch {
    // The current edition still works without persistent browser storage.
  }
  window.dispatchEvent(new Event("lightpost-theme"));
}

export function serverTheme() {
  return false;
}
