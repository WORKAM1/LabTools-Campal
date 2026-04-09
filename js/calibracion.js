// Alias for backward compat with onclick handlers
var showSection = function(a,b){ calShowSection(a,b); };

'use strict';

/* ─── Estado global ─── */
let standards = [];       // array de estándares registrados
let currentTipo = 'mono'; // 'mono' | 'multi'
let multiElems = [];      // elementos multi-elem temp
let editingIndex = -1;    // -1 = nuevo, ≥0 = edición
let logoDataUrl = '';

/* ─── Navegación de secciones ─── */
function calShowSection(secId, btn) {
  document.querySelectorAll('#mod-calibracion .cal-section').forEach(s => s.classList.remove('active'));
  const _sec = document.getElementById(secId); if(_sec) _sec.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (secId === 'sec-informe') actualizarInformePreview();
}

/* ─── MODAL ESTÁNDAR ─── */
function abrirModalStandard(index = -1) {
  editingIndex = index;
  multiElems = [];
  document.getElementById('el-tag-list').innerHTML = '';
  document.getElementById('std-nombre').value = '';
  document.getElementById('std-lote').value = '';
  document.getElementById('std-vto').value = '';
  document.getElementById('std-volFinal').value = '';
  document.getElementById('mono-elemento').value = '';
  document.getElementById('mono-conc').value = '';
  document.getElementById('mono-dens').value = '';
  document.getElementById('multi-dens').value = '';
  document.getElementById('std-cantidad').value = '5';
  document.getElementById('std-cantidad-custom').style.display = 'none';
  document.getElementById('std-cantidad-custom').value = '';

  setTipo('mono');

  if (index >= 0) {
    const s = standards[index];
    document.getElementById('modal-std-title').textContent = 'Editar Estándar';
    document.getElementById('std-nombre').value = s.nombre || '';
    document.getElementById('std-lote').value = s.lote || '';
    document.getElementById('std-vto').value = s.vto || '';
    document.getElementById('std-volFinal').value = s.volFinal || '';
    if (s.tipo === 'multi') {
      setTipo('multi');
      multiElems = [...s.elementos];
      document.getElementById('multi-dens').value = s.densidad || '';
      renderElTags();
    } else {
      document.getElementById('mono-elemento').value = s.elementos[0]?.nombre || '';
      document.getElementById('mono-conc').value = s.elementos[0]?.conc || '';
      document.getElementById('mono-dens').value = s.densidad || '';
    }
    const n = s.niveles.length;
    const cantSelect = document.getElementById('std-cantidad');
    const opts = ['3','5','7','9'];
    if (opts.includes(String(n))) {
      cantSelect.value = String(n);
    } else {
      cantSelect.value = 'custom';
      document.getElementById('std-cantidad-custom').style.display = '';
      document.getElementById('std-cantidad-custom').value = n;
    }
    generarNiveles(s.niveles);
  } else {
    document.getElementById('modal-std-title').textContent = 'Nuevo Estándar de Calibración';
    generarNiveles();
  }

  document.getElementById('modal-std').classList.add('open');
}

function cerrarModalStandard() {
  document.getElementById('modal-std').classList.remove('open');
}

/* ─── Tipo mono/multi ─── */
function setTipo(t) {
  currentTipo = t;
  document.getElementById('tipo-mono').classList.toggle('active', t === 'mono');
  document.getElementById('tipo-multi').classList.toggle('active', t === 'multi');
  document.getElementById('panel-mono').style.display = t === 'mono' ? '' : 'none';
  document.getElementById('panel-multi').style.display = t === 'multi' ? '' : 'none';
}

/* ─── Multi-elemento: agregar elemento ─── */
function agregarElemento() {
  const nombre = document.getElementById('multi-el-nombre').value.trim();
  const conc   = parseFloat(document.getElementById('multi-el-conc').value);
  if (!nombre || isNaN(conc) || conc <= 0) { toast('Ingresá nombre y concentración válidos', 'error'); return; }
  if (multiElems.find(e => e.nombre.toLowerCase() === nombre.toLowerCase())) {
    toast('Ese elemento ya fue agregado', 'error'); return;
  }
  multiElems.push({ nombre, conc })(); }
  document.getElementById('multi-el-nombre').value = '';
  document.getElementById('multi-el-conc').value = '';
  renderElTags();
}

function renderElTags() {
  const list = document.getElementById('el-tag-list');
  list.innerHTML = multiElems.map((e, i) => `
    <div class="el-tag">
      <b>${e.nombre}</b> <span style="opacity:0.6">${e.conc} mg/L</span>
      <button class="el-tag-del" onclick="removerElemento(${i})">×</button>
    </div>`).join('');
}

function removerElemento(i) {
  multiElems.splice(i, 1);
  renderElTags();
}

/* ─── Cantidad de niveles ─── */
document.getElementById('std-cantidad').addEventListener('change', function() {
  const custom = document.getElementById('std-cantidad-custom');
  custom.style.display = this.value === 'custom' ? '' : 'none';
  if (this.value !== 'custom') generarNiveles();
});

function generarNivelesCustom(val) {
  const n = parseInt(val);
  if (n > 0 && n <= 20) generarNiveles();
}

function getCantidad() {
  const sel = document.getElementById('std-cantidad').value;
  if (sel === 'custom') return parseInt(document.getElementById('std-cantidad-custom').value) || 5;
  return parseInt(sel);
}

function generarNiveles(prevNiveles = []) {
  const n = getCantidad();
  const container = document.getElementById('niveles-container');
  let html = `<div style="overflow-x:auto;border:1px solid var(--border-2);border-radius:var(--r-md);">
    <table class="data-tbl" style="min-width:560px;">
      <thead><tr>
        <th style="width:50px;">Nivel</th>
        <th>Conc. objetivo (mg/L) <span style="color:var(--amber);font-size:9px;">▼ INGRESAR</span></th>
        <th>Peso teórico (g)</th>
        <th>Peso estimado (g) <span style="color:#818cf8;font-size:9px;">▼ OPCIONAL</span></th>
        <th>Peso real (g) <span style="color:var(--green);font-size:9px;">▼ INGRESAR</span></th>
      </tr></thead>
      <tbody>`;
  for (let i = 0; i < n; i++) {
    const prev = prevNiveles[i] || {};
    html += `<tr>
      <td><div class="nivel-badge">${i+1}</div></td>
      <td><input type="number" class="nivel-obj input-obj" data-idx="${i}" placeholder="0.0000" step="any" value="${prev.concObj || ''}" oninput="recalcNivel(${i})"></td>
      <td class="nivel-teo tbl-theory" id="nivel-teo-${i}">${prev.pesoTeo ? prev.pesoTeo.toFixed(6) : '—'}</td>
      <td><input type="number" class="nivel-est input-est" data-idx="${i}" placeholder="0.0000" step="any" value="${prev.pesoEst || ''}"></td>
      <td><input type="number" class="nivel-real input-real" data-idx="${i}" placeholder="0.0000" step="any" value="${prev.pesoReal || ''}" oninput="recalcNivel(${i})"></td>
    </tr>`;
  }
  html += `</tbody></table></div>
  <div style="margin-top:10px;font-size:11px;color:var(--text-3);font-family:var(--font-m);">
    <span style="color:var(--amber);">■</span> Concentración objetivo &nbsp;
    <span style="color:var(--green);">■</span> Peso real (obligatorio para conc. real) &nbsp;
    <span style="color:#818cf8;">■</span> Peso estimado (opcional)
  </div>`;
  container.innerHTML = html;
}

/* ─── Recalcular un nivel en tiempo real ─── */
function recalcNivel(idx) {
  const volFinal = parseFloat(document.getElementById('std-volFinal').value);
  let concStd, densidad;
  if (currentTipo === 'mono') {
    concStd  = parseFloat(document.getElementById('mono-conc').value);
    densidad = parseFloat(document.getElementById('mono-dens').value);
  } else {
    // para multi, usar primera densidad
    densidad = parseFloat(document.getElementById('multi-dens').value);
    concStd  = multiElems[0]?.conc || NaN;
  }
  if (!volFinal || !concStd || !densidad) return;

  const rows = document.querySelectorAll('#niveles-container .nivel-obj');
  const row  = rows[idx];
  if (!row) return;
  const concObj = parseFloat(row.value);
  if (!concObj) { document.getElementById(`nivel-teo-${idx}`).textContent = '—'; return; }
  const Vstd = (concObj * (volFinal / 1000)) / (concStd / 1000); // en mL
  const pesoTeo = Vstd * densidad;
  document.getElementById(`nivel-teo-${idx}`).textContent = pesoTeo.toFixed(6) + ' g';
}

/* ─── Calcular y guardar estándar ─── */
function calcularYGuardar() {
  const nombre   = document.getElementById('std-nombre').value.trim();
  const lote     = document.getElementById('std-lote').value.trim();
  const vto      = document.getElementById('std-vto').value;
  const volFinal = parseFloat(document.getElementById('std-volFinal').value);

  if (!nombre)              { toast('Ingresá el nombre del estándar', 'error'); return; }
  if (isNaN(volFinal) || volFinal <= 0) { toast('Ingresá el volumen final del matraz', 'error'); return; }

  let densidad, elementos;
  if (currentTipo === 'mono') {
    const elNombre = document.getElementById('mono-elemento').value.trim();
    const elConc   = parseFloat(document.getElementById('mono-conc').value);
    densidad       = parseFloat(document.getElementById('mono-dens').value);
    if (!elNombre || isNaN(elConc) || elConc <= 0) { toast('Ingresá elemento y concentración', 'error'); return; }
    if (isNaN(densidad) || densidad <= 0)           { toast('Ingresá la densidad del estándar', 'error'); return; }
    elementos = [{ nombre: elNombre, conc: elConc }];
  } else {
    densidad = parseFloat(document.getElementById('multi-dens').value);
    if (isNaN(densidad) || densidad <= 0) { toast('Ingresá la densidad del estándar multielemento', 'error'); return; }
    if (multiElems.length === 0)          { toast('Agregá al menos un elemento', 'error'); return; }
    elementos = [...multiElems];
  }

  // Recolectar niveles
  const objInputs  = document.querySelectorAll('#niveles-container .nivel-obj');
  const estInputs  = document.querySelectorAll('#niveles-container .nivel-est');
  const realInputs = document.querySelectorAll('#niveles-container .nivel-real');

  const niveles = [];
  for (let i = 0; i < objInputs.length; i++) {
    const concObj  = parseFloat(objInputs[i].value);
    const pesoEst  = parseFloat(estInputs[i].value);
    const pesoReal = parseFloat(realInputs[i].value);
    if (!concObj) continue;

    // Peso teórico
    const Vstd   = (concObj * (volFinal / 1000)) / (elementos[0].conc / 1000);
    const pesoTeo = Vstd * densidad;

    // Concentraciones reales por elemento
    let concReales = {};
    elementos.forEach(el => {
      if (!isNaN(pesoReal) && pesoReal > 0) {
        const Vreal = pesoReal / densidad; // mL
        concReales[el.nombre] = (Vreal * (el.conc / 1000)) / (volFinal / 1000); // mg/L
      } else {
        concReales[el.nombre] = null;
      }
    });

    // Delta %
    let delta = null;
    if (!isNaN(pesoReal) && pesoReal > 0) {
      delta = Math.abs((pesoReal - pesoTeo) / pesoTeo) * 100;
    }

    niveles.push({
      num: i + 1,
      concObj,
      pesoTeo,
      pesoEst: isNaN(pesoEst) ? null : pesoEst,
      pesoReal: isNaN(pesoReal) ? null : pesoReal,
      concReales,
      delta
    });
  }

  if (niveles.length === 0) { toast('Ingresá al menos una concentración objetivo', 'error'); return; }

  const std = { nombre, lote, vto, volFinal, tipo: currentTipo, densidad, elementos, niveles };

  if (editingIndex >= 0) {
    standards[editingIndex] = std;
    toast(`Estándar "${nombre}" actualizado`, 'success');
  } else {
    standards.push(std);
    toast(`Estándar "${nombre}" guardado con ${niveles.length} niveles`, 'success');
  }

  cerrarModalStandard();
  renderStandardsList();
  actualizarResumen();
}

/* ─── Render lista de estándares ─── */
function renderStandardsList() {
  const container = document.getElementById('std-list-container');
  const empty     = document.getElementById('empty-state-stds');

  if (standards.length === 0) {
    container.innerHTML = '';
    container.appendChild(empty);
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  container.innerHTML = standards.map((s, si) => {
    const tipoTag = s.tipo === 'multi'
      ? `<span class="badge badge-purple">Multielemento</span>`
      : `<span class="badge badge-cyan">Monoelemento</span>`;
    const elNames = s.elementos.map(e => e.nombre).join(', ');
    const nNiveles = s.niveles.length;

    // Tabla de niveles
    const elCols = s.elementos.map(e => `<th>${e.nombre}<br><span style="font-size:8px;color:#666;font-weight:400;">(mg/L real)</span></th>`).join('');
    const filas = s.niveles.map((niv, ni) => {
      const deltaStr = niv.delta !== null
        ? `<span class="tbl-delta ${niv.delta < 0.5 ? 'ok' : niv.delta < 2 ? 'warn' : 'bad'}">${niv.delta.toFixed(3)}%</span>`
        : '<span style="color:var(--text-3);">—</span>';
      const realCols = s.elementos.map(e => {
        const cr = niv.concReales[e.nombre];
        return cr !== null ? `<td class="tbl-real">${cr.toFixed(5)}</td>` : `<td style="color:var(--text-3);">—</td>`;
      }).join('');
      return `<tr>
        <td><div class="nivel-badge" style="width:22px;height:22px;font-size:10px;">${niv.num}</div></td>
        <td class="tbl-num">${niv.concObj.toFixed(4)}</td>
        <td class="tbl-theory">${niv.pesoTeo.toFixed(6)}</td>
        <td style="color:#818cf8;">${niv.pesoEst !== null ? niv.pesoEst.toFixed(4) : '—'}</td>
        <td class="${niv.pesoReal !== null ? 'tbl-real' : ''}">${niv.pesoReal !== null ? niv.pesoReal.toFixed(4) : '—'}</td>
        ${realCols}
        <td>${deltaStr}</td>
        <td>
          <button class="btn btn-ghost btn-sm" style="padding:4px 8px;height:28px;" onclick="editarNivel(${si},${ni})">✏</button>
        </td>
      </tr>`;
    }).join('');

    return `
    <div class="std-item anim" id="std-item-${si}">
      <div class="std-item-header">
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
          <div style="width:36px;height:36px;border-radius:50%;background:var(--cyan-dim);border:1px solid var(--cyan-border);display:flex;align-items:center;justify-content:center;font-family:var(--font-m);font-size:13px;font-weight:600;color:var(--cyan);">${si+1}</div>
        </div>
        <div class="std-item-info">
          <div class="std-item-name">${s.nombre}</div>
          <div class="std-item-meta">
            ${tipoTag}
            <span>Elementos: <b>${elNames}</b></span>
            <span>Matraz: <b>${s.volFinal} mL</b></span>
            <span>Densidad: <b>${s.densidad} g/mL</b></span>
            ${s.lote ? `<span>Lote: <b>${s.lote}</b></span>` : ''}
            ${s.vto ? `<span>Vto: <b>${formatFecha(s.vto)}</b></span>` : ''}
            <span style="color:var(--cyan)"><b>${nNiveles} niveles</b></span>
          </div>
        </div>
        <div class="std-item-actions">
          <button class="btn btn-ghost btn-sm" onclick="abrirModalStandard(${si})">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9 3l2 2-7 7H2v-2L9 3z" stroke="currentColor" stroke-width="1.3"/></svg>
            Editar
          </button>
          <button class="btn btn-danger btn-sm" onclick="eliminarStandard(${si})">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2h4v2M6 6v5M8 6v5" stroke="currentColor" stroke-width="1.3"/></svg>
            Eliminar
          </button>
        </div>
      </div>
      <div class="std-item-body">
        <div class="table-wrap">
          <table class="data-tbl">
            <thead><tr>
              <th style="width:40px">N°</th>
              <th>Conc. obj (mg/L)</th>
              <th>Peso teórico (g)</th>
              <th>Peso estimado (g)</th>
              <th>Peso real (g)</th>
              ${elCols}
              <th>Error %</th>
              <th style="width:50px"></th>
            </tr></thead>
            <tbody>${filas}</tbody>
          </table>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn btn-ghost btn-sm" onclick="agregarNivel(${si})">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" stroke-width="1.5"/><line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" stroke-width="1.5"/></svg>
            Agregar nivel
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ─── Editar un nivel inline ─── */
function editarNivel(si, ni) {
  const std = standards[si];
  const niv = std.niveles[ni];
  const pesoReal = prompt(`Estándar: ${std.nombre}\nNivel ${ni+1} — Conc. obj: ${niv.concObj} mg/L\n\nIngresá el peso real pesado (g):`, niv.pesoReal || '');
  if (pesoReal === null) return;
  const pr = parseFloat(pesoReal);
  if (isNaN(pr) || pr <= 0) { toast('Peso inválido', 'error'); return; }
  niv.pesoReal = pr;
  // Recalcular concReales
  std.elementos.forEach(el => {
    const Vreal = pr / std.densidad;
    niv.concReales[el.nombre] = (Vreal * (el.conc / 1000)) / (std.volFinal / 1000);
  });
  niv.delta = Math.abs((pr - niv.pesoTeo) / niv.pesoTeo) * 100;
  renderStandardsList();
  toast('Nivel actualizado', 'success');
}

/* ─── Agregar nivel a un estándar existente ─── */
function agregarNivel(si) {
  const std = standards[si];
  const concObj = parseFloat(prompt(`Agregar nivel al estándar: ${std.nombre}\n\nIngresá la concentración objetivo (mg/L):`));
  if (isNaN(concObj) || concObj <= 0) { toast('Concentración inválida', 'error'); return; }
  const Vstd   = (concObj * (std.volFinal / 1000)) / (std.elementos[0].conc / 1000);
  const pesoTeo = Vstd * std.densidad;
  const concReales = {};
  std.elementos.forEach(el => { concReales[el.nombre] = null; });
  std.niveles.push({
    num: std.niveles.length + 1,
    concObj, pesoTeo, pesoEst: null, pesoReal: null, concReales, delta: null
  });
  renderStandardsList();
  toast('Nivel agregado. Ingresá el peso real para obtener la concentración real.', 'info');
}

/* ─── Eliminar estándar ─── */
function eliminarStandard(si) {
  if (!confirm(`¿Eliminar el estándar "${standards[si].nombre}"?`)) return;
  standards.splice(si, 1);
  renderStandardsList();
  actualizarResumen();
  toast('Estándar eliminado', 'info');
}

/* ─── Limpiar todo ─── */
function limpiarTodo() {
  if (standards.length === 0) { toast('No hay datos para limpiar', 'info'); return; }
  if (!confirm('¿Eliminar todos los estándares registrados?')) return;
  standards = [];
  renderStandardsList();
  actualizarResumen();
  toast('Datos limpiados', 'info');
}

/* ─── Recalcular todo ─── */
function calcularTodas() {
  if (standards.length === 0) { toast('No hay estándares para recalcular', 'info'); return; }
  standards.forEach(std => {
    std.niveles.forEach(niv => {
      const Vstd = (niv.concObj * (std.volFinal / 1000)) / (std.elementos[0].conc / 1000);
      niv.pesoTeo = Vstd * std.densidad;
      if (niv.pesoReal !== null) {
        std.elementos.forEach(el => {
          const Vreal = niv.pesoReal / std.densidad;
          niv.concReales[el.nombre] = (Vreal * (el.conc / 1000)) / (std.volFinal / 1000);
        });
        niv.delta = Math.abs((niv.pesoReal - niv.pesoTeo) / niv.pesoTeo) * 100;
      }
    });
  });
  renderStandardsList();
  toast('Recalculado', 'success');
}

/* ─── Resumen ─── */
function actualizarResumen() {
  const nStd  = standards.length;
  const nNiv  = standards.reduce((a, s) => a + s.niveles.length, 0);
  const lote  = document.getElementById('rep-lote').value || '—';
  const analista = document.getElementById('rep-analista').value || '—';
  const fecha = document.getElementById('rep-fecha').value;

  document.getElementById('res-nstd').textContent = nStd;
  document.getElementById('res-nniv').textContent = nNiv;
  document.getElementById('res-lote').textContent = lote;
  document.getElementById('res-analista').textContent = analista;
  document.getElementById('res-fecha').textContent = fecha ? formatFecha(fecha) : '—';
}

/* ─── Informe Preview ─── */
function actualizarInformePreview() {
  const get = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  const titulo   = get('rep-titulo')     || 'Informe de Curva de Calibración';
  const lote     = get('rep-lote')       || '—';
  const analista = get('rep-analista')   || '—';
  const lab      = get('rep-laboratorio') || '—';
  const proy     = get('rep-proyecto')   || '—';
  const fecha    = get('rep-fecha');
  const obs      = get('rep-obs');

  set('rep-display-titulo',   titulo);
  set('rep-display-lote',     lote);
  set('rep-display-analista', analista);
  set('rep-display-lab',      lab);
  set('rep-display-proy',     proy);
  set('rep-display-fecha',    fecha ? formatFecha(fecha) : '—');

  // Logo
  const logoImg = document.getElementById('rep-logo-img');
  const logoPh  = document.getElementById('rep-logo-ph');
  if (logoDataUrl) {
    logoImg.src = logoDataUrl; logoImg.style.display = 'block'; logoPh.style.display = 'none';
  } else {
    logoImg.style.display = 'none'; logoPh.style.display = 'block';
  }

  // Resumen
  const nStd  = standards.length;
  const nNiv  = standards.reduce((a, s) => a + s.niveles.length, 0);
  const nReal = standards.reduce((a, s) => a + s.niveles.filter(n => n.pesoReal !== null).length, 0);
  const allEls = [...new Set(standards.flatMap(s => s.elementos.map(e => e.nombre)))];
  document.getElementById('rep-summary').innerHTML = `
    <div class="rep-summary-card"><div class="rep-summary-val">${nStd}</div><div class="rep-summary-lbl">ESTÁNDARES</div></div>
    <div class="rep-summary-card cyan-card"><div class="rep-summary-val">${nNiv}</div><div class="rep-summary-lbl">NIVELES TOTAL</div></div>
    <div class="rep-summary-card"><div class="rep-summary-val">${nReal}</div><div class="rep-summary-lbl">CON PESO REAL</div></div>
    <div class="rep-summary-card"><div class="rep-summary-val">${allEls.length}</div><div class="rep-summary-lbl">ELEMENTOS</div></div>
    <div class="rep-summary-card"><div class="rep-summary-val" style="font-size:12px">${allEls.join(', ') || '—'}</div><div class="rep-summary-lbl">ANALITOS</div></div>`;

  // Contenido de estándares
  const content = document.getElementById('rep-stds-content');
  if (standards.length === 0) {
    content.innerHTML = '<div style="color:#aaa;font-family:\'IBM Plex Mono\',monospace;font-size:11px;padding:20px 0;text-align:center;">No hay estándares registrados.</div>';
  } else {
    content.innerHTML = standards.map((s, si) => {
      const elCols = s.elementos.map(e =>
        `<th>C real ${e.nombre}<br>(mg/L)</th>`).join('');
      const filas = s.niveles.map(niv => {
        const realCols = s.elementos.map(e => {
          const cr = niv.concReales[e.nombre];
          return cr !== null
            ? `<td class="td-real">${cr.toFixed(5)}</td>`
            : `<td style="color:#aaa;">—</td>`;
        }).join('');
        const deltaStr = niv.delta !== null
          ? `<span class="${niv.delta < 0.5 ? 'td-delta-ok' : niv.delta < 2 ? 'td-delta-warn' : 'td-delta-bad'}">${niv.delta.toFixed(3)}%</span>`
          : '—';
        return `<tr>
          <td>${niv.num}</td>
          <td class="td-obj">${niv.concObj.toFixed(4)}</td>
          <td>${niv.pesoTeo.toFixed(6)}</td>
          <td>${niv.pesoEst !== null ? niv.pesoEst.toFixed(4) : '—'}</td>
          <td style="font-weight:600">${niv.pesoReal !== null ? niv.pesoReal.toFixed(4) : '—'}</td>
          ${realCols}
          <td>${deltaStr}</td>
        </tr>`;
      }).join('');

      return `
      <div class="rep-section-title">ESTÁNDAR ${si+1}: ${s.nombre.toUpperCase()}</div>
      <div class="rep-std-block">
        <div class="rep-std-header">
          <div>
            <div class="rep-std-name">${s.nombre}</div>
            <div style="font-size:10px;color:#666;margin-top:2px;">
              Tipo: ${s.tipo === 'multi' ? 'Multielemento' : 'Monoelemento'} &nbsp;|&nbsp;
              Elementos: ${s.elementos.map(e => `${e.nombre} (${e.conc} mg/L)`).join(', ')} &nbsp;|&nbsp;
              Densidad: ${s.densidad} g/mL &nbsp;|&nbsp;
              Matraz: ${s.volFinal} mL
            </div>
          </div>
          <div class="rep-std-meta">
            ${s.lote ? `<div>Lote: ${s.lote}</div>` : ''}
            ${s.vto  ? `<div>Vto: ${formatFecha(s.vto)}</div>` : ''}
          </div>
        </div>
        <table class="rep-table">
          <thead><tr>
            <th>Nivel</th><th>Conc. obj (mg/L)</th><th>Peso teórico (g)</th>
            <th>Peso estim. (g)</th><th>Peso real (g)</th>
            ${elCols}
            <th>Error %</th>
          </tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>`;
    }).join('');
  }

  // Observaciones
  const obsBlock = document.getElementById('rep-obs-block');
  if (obs) {
    obsBlock.style.display = 'block';
    document.getElementById('rep-obs-text').textContent = obs;
  } else {
    obsBlock.style.display = 'none';
  }

  actualizarResumen();
}

/* ─── Logo upload ─── */
function cargarLogo(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    logoDataUrl = ev.target.result;
    const img  = document.getElementById('logoPreviewImg');
    const text = document.getElementById('logoZoneText');
    img.src = logoDataUrl; img.style.display = 'block'; text.style.display = 'none';
    toast('Logo cargado', 'success');
    actualizarInformePreview();
  };
  reader.readAsDataURL(file);
}

/* ─── Generar PDF ─── */
async function generarPDF() {
  actualizarInformePreview();
  toast('Generando PDF...', 'info');
  await new Promise(r => setTimeout(r, 400));
  const { jsPDF } = window.jspdf;
  const doc = document.getElementById('report-doc');
  try {
    const canvas = await html2canvas(doc, {
      scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW   = pdf.internal.pageSize.getWidth();
    const pageH   = pdf.internal.pageSize.getHeight();
    const pdfH    = pageW / canvas.width * canvas.height;

    if (pdfH <= pageH) {
      pdf.addImage(imgData, 'PNG', 0, 0, pageW, pdfH);
    } else {
      let currentY  = 0;
      const pxPage  = Math.floor(canvas.width / pageW * pageH);
      while (currentY < canvas.height) {
        const sliceH = Math.min(pxPage, canvas.height - currentY);
        const pc = document.createElement('canvas');
        pc.width = canvas.width; pc.height = sliceH;
        pc.getContext('2d').drawImage(canvas, 0, -currentY);
        if (currentY > 0) pdf.addPage();
        pdf.addImage(pc.toDataURL('image/png'), 'PNG', 0, 0, pageW, (sliceH / canvas.width) * pageW);
        currentY += sliceH;
      }
    }

    const lote = document.getElementById('rep-lote').value || 'curva';
    pdf.save(`calibracion_${lote.replace(/\s+/g,'_')}.pdf`);
    toast('PDF generado correctamente', 'success');
  } catch (err) {
    toast('Error al generar PDF', 'error');
    console.error(err);
  }
}

/* ─── Helpers ─── */
function formatFecha(iso) {
  if (!iso) return '—';
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

let toastTimeout;
function toast(msg, type = 'info') {
  const el = document.getElementById('app-toast');
  el.textContent = msg;
  el.className = `app-toast ${type} show`;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove('show'), 3200);
}

/* ─── Live listeners informe ─── */
['rep-titulo','rep-fecha','rep-lote','rep-analista','rep-laboratorio','rep-proyecto','rep-obs']
  .forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { actualizarResumen(); });
  });

/* ─── Init ─── */
function calInit() { (function() {
  // Fecha hoy
  const today = new Date();
  const pad   = n => String(n).padStart(2,'0');
  const iso   = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
  document.getElementById('rep-fecha').value = iso;
  // Lote auto
  const loteAuto = `CAL-${today.getFullYear()}${pad(today.getMonth()+1)}${pad(today.getDate())}-${pad(today.getHours())}${pad(today.getMinutes())}`;
  document.getElementById('rep-lote').value = loteAuto;
  actualizarResumen();
  generarNiveles();
  // Cerrar modal con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarModalStandard();
  });
  // Cerrar modal al clickar overlay
  document.getElementById('modal-std').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-std')) cerrarModalStandard();
  });
});