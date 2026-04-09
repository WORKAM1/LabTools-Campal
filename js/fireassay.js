/* ═══════════════════════════════════════════════
   FIREASSAY.JS — Lógica del módulo Fire Assay Pro
   LabTrack · Suite Analítica
═══════════════════════════════════════════════ */

'use strict';

let muestras   = [];
let batchId    = '';
let logoDataUrl = '';

/* ─── Init ─── */
function faInit() {
  initBatch();
  initFANav();
  initLogoUpload();
  actualizarFechas();
  actualizarStats();
  actualizarInformePreview();
  bindInformeListeners();
}

/* ─── Batch ─── */
function initBatch() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  batchId = `FA-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  document.getElementById('batchId').textContent = batchId;
  const rd = document.getElementById('reportDate');
  if (rd) rd.value = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
}

function actualizarFechas() {
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const el = document.getElementById('sessionDate');
  if (el) el.textContent = new Date().toLocaleDateString('es-AR', opts);
}

function nuevaSession() {
  if (muestras.length > 0 && !confirm('¿Iniciar nuevo lote? Los datos actuales se perderán.')) return;
  muestras = [];
  initBatch();
  limpiarFormulario();
  actualizarTabla();
  actualizarStats();
  actualizarInformePreview();
  faToast('Nuevo lote iniciado', 'info');
}

/* ─── Navegación FA ─── */
function initFANav() {
  document.querySelectorAll('.fa-nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.dataset.section;
      document.querySelectorAll('.fa-nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.fa-section').forEach(s => s.classList.remove('active'));
      const sec = document.getElementById('section-' + target);
      if (sec) sec.classList.add('active');

      const titles = {
        registro:      'Registro de Muestras',
        resultados:    'Resultados del Lote',
        procedimiento: 'Procedimiento Analítico',
        informe:       'Generar Informe PDF'
      };
      const subs = {
        registro:      'Nuevo Análisis',
        resultados:    `${muestras.length} muestras`,
        procedimiento: 'Fire Assay / Parting',
        informe:       'Preview & Export'
      };
      const pt = document.getElementById('pageTitle');
      const bc = document.getElementById('breadcrumbSub');
      if (pt) pt.textContent = titles[target] || '';
      if (bc) bc.textContent = subs[target] || '';

      if (target === 'informe')   actualizarInformePreview();
      if (target === 'resultados') actualizarTabla();
    });
  });
}

/* ─── Logo ─── */
function initLogoUpload() {
  const area  = document.getElementById('logoArea');
  const input = document.getElementById('logoInput');
  if (!area || !input) return;
  area.addEventListener('click', () => input.click());
  input.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      logoDataUrl = ev.target.result;
      document.getElementById('logoPlaceholder').hidden = true;
      const prev = document.getElementById('logoPreview');
      prev.src = logoDataUrl;
      prev.hidden = false;
      actualizarLogoEnInforme();
    };
    reader.readAsDataURL(file);
  });
}

function actualizarLogoEnInforme() {
  const rl = document.getElementById('reportLogo');
  const ph = document.getElementById('reportLogoPlaceholder');
  if (!rl || !ph) return;
  if (logoDataUrl) {
    rl.src = logoDataUrl;
    rl.style.display = 'block';
    ph.style.display = 'none';
  } else {
    rl.style.display = 'none';
    ph.style.display = 'block';
  }
}

/* ─── Cálculos en tiempo real ─── */
function calcularEncuarte() {
  const dore = parseFloat(document.getElementById('pesoDore').value);
  if (!isNaN(dore) && dore > 0) {
    const p = dore * 4;
    document.getElementById('plataAuto').textContent = p.toFixed(4);
    document.getElementById('plataReal').value = p.toFixed(4);
  } else {
    document.getElementById('plataAuto').textContent = '—';
  }
}

function calcularResultados() {
  const dore = parseFloat(document.getElementById('pesoDore').value);
  const oro  = parseFloat(document.getElementById('oroFinal').value);
  if (!isNaN(dore) && !isNaN(oro) && dore > 0 && oro > 0) {
    const pAu = (oro / dore) * 100;
    const kt  = (pAu / 100) * 24;
    const imp = 100 - pAu;
    document.getElementById('prevAu').textContent  = pAu.toFixed(2) + '%';
    document.getElementById('prevKt').textContent  = kt.toFixed(2) + 'K';
    document.getElementById('prevImp').textContent = imp.toFixed(2) + '%';
    document.getElementById('prevAu').style.color  =
      pAu >= 90 ? 'var(--green-fa)' : pAu >= 75 ? 'var(--gold-light)' : 'var(--red-fa)';
  } else {
    ['prevAu','prevKt','prevImp'].forEach(id => {
      document.getElementById(id).textContent = '—';
      document.getElementById(id).style.color = '';
    });
  }
}

/* ─── Guardar muestra ─── */
function guardarMuestra() {
  const id          = document.getElementById('idMuestra').value.trim();
  const pesoVirutas = parseFloat(document.getElementById('pesoVirutas').value);
  const pesoPlomo   = parseFloat(document.getElementById('pesoPlomo').value);
  const pesoDore    = parseFloat(document.getElementById('pesoDore').value);
  const plataReal   = parseFloat(document.getElementById('plataReal').value);
  const doreFinal   = parseFloat(document.getElementById('doreFinal').value);
  const laminado    = parseFloat(document.getElementById('pesoLaminado').value);
  const oroFinal    = parseFloat(document.getElementById('oroFinal').value);
  const obs         = document.getElementById('observaciones').value.trim();

  if (!id)                            { faToast('Ingrese el ID de la muestra', 'error'); return; }
  if (isNaN(pesoDore) || pesoDore<=0) { faToast('Ingrese el peso Doré', 'error'); return; }
  if (isNaN(oroFinal) || oroFinal<=0) { faToast('Ingrese el peso de Au final', 'error'); return; }
  if (oroFinal > pesoDore)            { faToast('El Au final no puede superar el peso Doré', 'error'); return; }
  if (muestras.find(m => m.id === id)){ faToast('Ya existe una muestra con ese ID', 'error'); return; }

  const pAu  = (oroFinal / pesoDore) * 100;
  const kt   = (pAu / 100) * 24;
  const imp  = 100 - pAu;
  const plataAuto = pesoDore * 4;

  muestras.push({
    id, pesoVirutas, pesoPlomo, pesoDore,
    plataAuto, plataReal,
    doreFinal: isNaN(doreFinal) ? null : doreFinal,
    laminado:  isNaN(laminado)  ? null : laminado,
    oroFinal,
    pAu:  parseFloat(pAu.toFixed(4)),
    kt:   parseFloat(kt.toFixed(4)),
    imp:  parseFloat(imp.toFixed(4)),
    obs,
    timestamp: new Date().toLocaleTimeString('es-AR')
  });

  actualizarTabla();
  actualizarStats();
  limpiarFormulario();
  faToast(`Muestra ${id} registrada correctamente`, 'success');
}

/* ─── Limpiar formulario ─── */
function limpiarFormulario() {
  ['idMuestra','pesoVirutas','pesoDore','plataReal','doreFinal','pesoLaminado','oroFinal','observaciones']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('pesoPlomo').value = '30';
  document.getElementById('plataAuto').textContent = '—';
  ['prevAu','prevKt','prevImp'].forEach(id => {
    document.getElementById(id).textContent = '—';
    document.getElementById(id).style.color = '';
  });
}

/* ─── Tabla resultados ─── */
function actualizarTabla() {
  const tbody = document.getElementById('tbodyResultados');
  if (!tbody) return;
  if (muestras.length === 0) {
    tbody.innerHTML = `<tr class="fa-empty-row"><td colspan="13">
      <div class="fa-empty-state">
        <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3"/>
          <line x1="20" y1="12" x2="20" y2="28" stroke="currentColor" stroke-width="1.5"/>
          <line x1="12" y1="20" x2="28" y2="20" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <p>Ninguna muestra registrada aún</p>
      </div></td></tr>`;
    return;
  }
  tbody.innerHTML = muestras.map((m, i) => {
    const auClass = m.pAu >= 90 ? 'td-good' : m.pAu >= 75 ? 'td-medium' : 'td-warn';
    return `<tr>
      <td class="td-au">${String(i+1).padStart(2,'0')}</td>
      <td style="font-weight:500">${m.id}</td>
      <td>${isNaN(m.pesoVirutas) ? '—' : m.pesoVirutas.toFixed(3)}</td>
      <td>${m.pesoDore.toFixed(4)}</td>
      <td>${m.plataAuto.toFixed(4)}</td>
      <td>${isNaN(m.plataReal) ? '—' : m.plataReal.toFixed(4)}</td>
      <td>${m.doreFinal !== null ? m.doreFinal.toFixed(4) : '—'}</td>
      <td>${m.laminado  !== null ? m.laminado.toFixed(4)  : '—'}</td>
      <td class="td-au">${m.oroFinal.toFixed(5)}</td>
      <td class="${auClass}">${m.pAu.toFixed(2)}%</td>
      <td class="${auClass}">${m.kt.toFixed(2)}K</td>
      <td>${m.imp.toFixed(2)}%</td>
      <td><button class="btn-delete-row" onclick="eliminarMuestra(${i})" title="Eliminar">×</button></td>
    </tr>`;
  }).join('');
  const bc = document.getElementById('breadcrumbSub');
  if (bc) bc.textContent = `${muestras.length} muestras`;
}

function filtrarTabla() {
  const q = document.getElementById('filterInput').value.toLowerCase();
  document.querySelectorAll('#tbodyResultados tr').forEach(tr => {
    if (tr.classList.contains('fa-empty-row')) return;
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function eliminarMuestra(index) {
  if (!confirm(`¿Eliminar la muestra "${muestras[index].id}"?`)) return;
  muestras.splice(index, 1);
  actualizarTabla();
  actualizarStats();
  faToast('Muestra eliminada', 'info');
}

function limpiarLote() {
  if (muestras.length === 0) { faToast('El lote ya está vacío', 'info'); return; }
  if (!confirm('¿Eliminar todas las muestras del lote actual?')) return;
  muestras = [];
  actualizarTabla();
  actualizarStats();
  faToast('Lote limpiado', 'info');
}

/* ─── Stats ─── */
function actualizarStats() {
  document.getElementById('statTotal').textContent = muestras.length;
  if (muestras.length === 0) {
    ['statAvgAu','statAvgKt','statAvgImp'].forEach(id => {
      document.getElementById(id).textContent = '—';
    });
    return;
  }
  const avgAu  = muestras.reduce((a,m) => a + m.pAu,  0) / muestras.length;
  const avgKt  = muestras.reduce((a,m) => a + m.kt,   0) / muestras.length;
  const avgImp = muestras.reduce((a,m) => a + m.imp,  0) / muestras.length;
  document.getElementById('statAvgAu').textContent  = avgAu.toFixed(2)  + '%';
  document.getElementById('statAvgKt').textContent  = avgKt.toFixed(2)  + 'K';
  document.getElementById('statAvgImp').textContent = avgImp.toFixed(2) + '%';
}

/* ─── CSV ─── */
function exportarCSV() {
  if (muestras.length === 0) { faToast('No hay muestras para exportar', 'error'); return; }
  const headers = ['ID','Virutas(g)','Dore(g)','Plata_Teorica(g)','Plata_Real(g)',
    'Dore_Enc(g)','Laminado(g)','Au_Final(g)','%Au','Kilates','%Ag+Imp','Observaciones'];
  const rows = muestras.map(m => [
    m.id, isNaN(m.pesoVirutas) ? '' : m.pesoVirutas, m.pesoDore,
    m.plataAuto, isNaN(m.plataReal) ? '' : m.plataReal,
    m.doreFinal !== null ? m.doreFinal : '',
    m.laminado  !== null ? m.laminado  : '',
    m.oroFinal, m.pAu, m.kt, m.imp, `"${m.obs}"`
  ].join(','));
  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `${batchId}_resultados.csv`;
  a.click();
  URL.revokeObjectURL(url);
  faToast('CSV exportado', 'success');
}

/* ─── Informe Preview ─── */
function clasificar(pAu) {
  if (pAu >= 99.5) return { label: '999.5‰ — Fino',    cls: 'class-24k' };
  if (pAu >= 95.0) return { label: '22–24 K',           cls: 'class-24k' };
  if (pAu >= 75.0) return { label: '18 K',              cls: 'class-18k' };
  if (pAu >= 58.5) return { label: '14 K',              cls: 'class-18k' };
  return { label: 'Bajo / Recircular', cls: 'class-low' };
}

function actualizarInformePreview() {
  const get = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('reportBatchId',   batchId);
  set('reportAnalyst',   get('analystName')  || '—');
  set('reportLabName',   get('labName')      || '—');
  set('reportProject2',  get('reportProject') || '—');
  set('reportMainTitle', get('reportTitle')   || 'Informe de Análisis');

  const dateVal = get('reportDate');
  if (dateVal) {
    const [y,m,d] = dateVal.split('-');
    set('reportDateDisplay', `${d}/${m}/${y}`);
  }

  actualizarLogoEnInforme();

  const grid = document.getElementById('reportSummaryGrid');
  if (!grid) return;

  if (muestras.length === 0) {
    grid.innerHTML = '<div style="color:#aaa;font-family:IBM Plex Mono,monospace;font-size:11px;grid-column:1/-1;padding:18px 0">Sin muestras en este lote</div>';
  } else {
    const avgAu  = muestras.reduce((a,m) => a + m.pAu,  0) / muestras.length;
    const avgKt  = muestras.reduce((a,m) => a + m.kt,   0) / muestras.length;
    const avgImp = muestras.reduce((a,m) => a + m.imp,  0) / muestras.length;
    const maxAu  = Math.max(...muestras.map(m => m.pAu));
    const minAu  = Math.min(...muestras.map(m => m.pAu));
    grid.innerHTML = `
      <div class="report-summary-card"><div class="report-summary-val">${muestras.length}</div><div class="report-summary-lbl">MUESTRAS</div></div>
      <div class="report-summary-card gold-card"><div class="report-summary-val">${avgAu.toFixed(2)}%</div><div class="report-summary-lbl">% AU PROM</div></div>
      <div class="report-summary-card gold-card"><div class="report-summary-val">${avgKt.toFixed(2)}K</div><div class="report-summary-lbl">KILATES PROM</div></div>
      <div class="report-summary-card"><div class="report-summary-val">${avgImp.toFixed(2)}%</div><div class="report-summary-lbl">% AG+IMP PROM</div></div>
      <div class="report-summary-card"><div class="report-summary-val">${maxAu.toFixed(2)}%</div><div class="report-summary-lbl">% AU MÁX</div></div>
      <div class="report-summary-card"><div class="report-summary-val">${minAu.toFixed(2)}%</div><div class="report-summary-lbl">% AU MÍN</div></div>`;
  }

  const tbody = document.getElementById('reportTableBody');
  if (tbody) {
    if (muestras.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:18px;color:#aaa;font-size:11px">Sin datos</td></tr>';
    } else {
      tbody.innerHTML = muestras.map(m => {
        const cl = clasificar(m.pAu);
        return `<tr>
          <td style="font-weight:600">${m.id}</td>
          <td>${isNaN(m.pesoVirutas) ? '—' : m.pesoVirutas.toFixed(3)}</td>
          <td>${m.pesoDore.toFixed(4)}</td>
          <td>${isNaN(m.plataReal) ? m.plataAuto.toFixed(4)+'*' : m.plataReal.toFixed(4)}</td>
          <td>${m.oroFinal.toFixed(5)}</td>
          <td class="au-cell">${m.pAu.toFixed(2)}%</td>
          <td class="au-cell">${m.kt.toFixed(2)} K</td>
          <td>${m.imp.toFixed(2)}%</td>
          <td class="${cl.cls}">${cl.label}</td>
        </tr>`;
      }).join('');
    }
  }
  dibujarChart();
}

function dibujarChart() {
  const canvas = document.getElementById('reportChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const W = canvas.width, H = canvas.height;
  const pad = { top:18, right:18, bottom:36, left:44 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top  - pad.bottom;

  if (muestras.length === 0) {
    ctx.fillStyle = '#ccc'; ctx.font = '11px IBM Plex Mono';
    ctx.textAlign = 'center';
    ctx.fillText('Sin datos', W/2, H/2);
    return;
  }

  const barW = Math.min(36, chartW / muestras.length - 5);
  const step = chartW / muestras.length;

  ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.lineTo(pad.left + chartW, pad.top + chartH); ctx.stroke();

  ctx.font = '8px IBM Plex Mono'; ctx.textAlign = 'right';
  [0,25,50,75,100].forEach(val => {
    const y = pad.top + chartH - (val/100)*chartH;
    ctx.beginPath(); ctx.strokeStyle = '#eeeeee';
    ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke();
    ctx.fillStyle = '#aaa'; ctx.fillText(val+'%', pad.left-5, y+3);
  });

  muestras.forEach((m, i) => {
    const x = pad.left + i*step + step/2 - barW/2;
    const auH = (m.pAu/100)*chartH;
    const auY = pad.top + chartH - auH;
    const grad = ctx.createLinearGradient(x, auY, x, auY+auH);
    grad.addColorStop(0, '#c9943a'); grad.addColorStop(1, '#a0720a');
    ctx.fillStyle = grad; ctx.fillRect(x, auY, barW*0.6, auH);
    ctx.fillStyle = '#e5e5e5';
    ctx.fillRect(x+barW*0.65, pad.top, barW*0.35, chartH);
    ctx.fillStyle = '#bbbbbb';
    ctx.fillRect(x+barW*0.65, auY, barW*0.35, (m.imp/100)*chartH);
    ctx.fillStyle = '#666'; ctx.font = '7px IBM Plex Mono'; ctx.textAlign = 'center';
    const label = m.id.length > 8 ? m.id.substring(0,8)+'…' : m.id;
    ctx.fillText(label, x+barW/2, pad.top+chartH+12);
    ctx.fillStyle = '#a0720a'; ctx.font = '8px IBM Plex Mono';
    ctx.fillText(m.pAu.toFixed(1)+'%', x+barW/2, auY-3);
  });

  ctx.font = '8px IBM Plex Mono'; ctx.textAlign = 'left';
  ctx.fillStyle = '#c9943a'; ctx.fillRect(W-90, 7, 9, 9);
  ctx.fillStyle = '#666'; ctx.fillText('% Au', W-77, 15);
  ctx.fillStyle = '#bbbbbb'; ctx.fillRect(W-90, 20, 9, 9);
  ctx.fillStyle = '#666'; ctx.fillText('% Ag+Imp', W-77, 28);
}

/* ─── PDF ─── */
async function generarPDF() {
  if (muestras.length === 0) { faToast('No hay muestras para generar el informe', 'error'); return; }
  actualizarInformePreview();
  faToast('Generando PDF...', 'info');
  await new Promise(r => setTimeout(r, 400));
  const { jsPDF } = window.jspdf;
  const doc = document.getElementById('reportDoc');
  try {
    const canvas = await html2canvas(doc, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const pdfH  = pageW / canvas.width * canvas.height;
    if (pdfH <= pageH) {
      pdf.addImage(imgData, 'PNG', 0, 0, pageW, pdfH);
    } else {
      let currentY = 0;
      const pxPerPage = Math.floor(canvas.width / pageW * pageH);
      while (currentY < canvas.height) {
        const sliceH = Math.min(pxPerPage, canvas.height - currentY);
        const pc = document.createElement('canvas');
        pc.width = canvas.width; pc.height = sliceH;
        pc.getContext('2d').drawImage(canvas, 0, -currentY);
        const sd = pc.toDataURL('image/png');
        if (currentY > 0) pdf.addPage();
        pdf.addImage(sd, 'PNG', 0, 0, pageW, (sliceH/canvas.width)*pageW);
        currentY += sliceH;
      }
    }
    pdf.save(`${batchId}_informe.pdf`);
    faToast('PDF generado correctamente', 'success');
  } catch (err) {
    faToast('Error al generar PDF', 'error');
    console.error(err);
  }
}

/* ─── Toast ─── */
let faToastTimeout;
function faToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `fa-toast ${type} show`;
  clearTimeout(faToastTimeout);
  faToastTimeout = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ─── Bind informe listeners ─── */
function bindInformeListeners() {
  ['reportTitle','reportDate','reportProject','labName','analystName'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', actualizarInformePreview);
  });
}
