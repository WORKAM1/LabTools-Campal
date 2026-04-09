/* ═══════════════════════════════════════════════
   APP.JS — Controlador principal
   LabTrack · Suite Analítica — William Martin Campal
═══════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Init módulos ─── */
  dilInit();
  faInit();
  calInit();

  /* ─── Module switcher ─── */
  document.querySelectorAll('.module-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = btn.dataset.app;
      document.querySelectorAll('.module-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.app-module').forEach(m => m.classList.remove('active'));
      const mod = document.getElementById('mod-' + app);
      if (mod) mod.classList.add('active');
      // Cerrar menú móvil
      document.querySelector('.module-tabs').classList.remove('open');
    });
  });

  /* ─── Mobile hamburger ─── */
  const hamburger = document.getElementById('topbarHamburger');
  if (hamburger) {
    hamburger.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelector('.module-tabs').classList.toggle('open');
    });
  }
  document.addEventListener('click', e => {
    const tabs = document.querySelector('.module-tabs');
    const ham  = document.getElementById('topbarHamburger');
    if (tabs && ham && !tabs.contains(e.target) && !ham.contains(e.target)) {
      tabs.classList.remove('open');
    }
  });

  /* ─── Language ─── */
  const langSel = document.getElementById('langSel');
  if (langSel) langSel.addEventListener('change', e => dilSetLang(e.target.value));

});
