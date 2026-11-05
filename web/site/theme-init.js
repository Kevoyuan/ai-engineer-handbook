try {
  const theme = JSON.parse(localStorage.getItem("preview-theme") || "null");
  document.documentElement.classList.toggle(
    "dark",
    theme ?? matchMedia("(prefers-color-scheme:dark)").matches,
  );
} catch {}
try {
  const preset = JSON.parse(
    localStorage.getItem("preview-dark-preset") || "null",
  );
  document.documentElement.dataset.darkPreset = [
    "graphite",
    "ink",
    "forest",
  ].includes(preset)
    ? preset
    : "graphite";
} catch {
  document.documentElement.dataset.darkPreset = "graphite";
}
