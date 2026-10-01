try {
  const theme = JSON.parse(localStorage.getItem("preview-theme") || "null");
  document.documentElement.classList.toggle(
    "dark",
    theme ?? matchMedia("(prefers-color-scheme:dark)").matches,
  );
} catch {}
