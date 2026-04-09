/* ═══════════════════════════════════════════════
   APP.JS — Controlador principal de la aplicación
   LabTrack · Suite Analítica
═══════════════════════════════════════════════ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Inicializar módulos ─── */
  dilInit();
  faInit();

  /* ─── Module switcher ─── */
  document.querySelectorAll('.module-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = btn.dataset.app;
      document.querySelectorAll('.module-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.app-module').forEach(m => m.classList.remove('active'));
      const mod = document.getElementById('mod-' + app);
      if (mod) mod.classList.add('active');
    });
  });

  /* ─── Language selector ─── */
  document.getElementById('langSel').addEventListener('change', e => {
    dilSetLang(e.target.value);
  });

});
