async function loadUIBindings() {
  try {
    const res = await fetch('data/ui.json');
    const ui = await res.json();
    document.querySelectorAll('[data-bind="appTitle"]').forEach(n => n.textContent = ui.appTitle);
    document.querySelectorAll('[data-bind="brandName"]').forEach(n => n.textContent = ui.brandName);
    document.querySelectorAll('[data-bind="tagline"]').forEach(n => n.textContent = ui.tagline);
    document.querySelectorAll('[data-bind="supportPhone"]').forEach(n => n.textContent = ui.supportPhone);
    document.querySelectorAll('[data-bind="supportEmail"]').forEach(n => n.textContent = ui.supportEmail);
    document.querySelectorAll('[data-bind="addressLine"]').forEach(n => n.textContent = ui.addressLine);
    document.title = ui.appTitle || document.title;
    const logoMark = document.querySelector('img[src*="logoipsum-396"]');
    if (logoMark) logoMark.style.filter = 'hue-rotate(310deg) saturate(1.2)';
    const logoFull = document.querySelector('img[src*="logoipsum-395"]');
    if (logoFull) logoFull.style.filter = 'hue-rotate(310deg) saturate(1.2)';
  } catch {}
}
loadUIBindings();
