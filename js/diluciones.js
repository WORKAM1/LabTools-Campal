/* ═══════════════════════════════════════════════
   DILUCIONES.JS — Lógica del módulo de diluciones
   LabTrack · Suite Analítica
═══════════════════════════════════════════════ */

'use strict';

/* ─── Constantes ─── */
const DIL_DEFAULTS = { litio: 2.5, sodio: 7.5, potasio: 5, icp: 15 };
const DIL_N_PATRONES = { litio: 5, sodio: 5, potasio: 5, icp: 7 };

let dilCurveOn = true;
let dilLang = 'es';

/* ─── Traducciones ─── */
const DIL_TR = {
  es: {
    'sid-title':'Curva de calibración','tog-on':'Gestión activa','tog-off':'Gestión inactiva',
    'sid-el':'Elemento','sid-pts':'Puntos de la curva',
    'eyebrow':'Química analítica','mtitle':'Cálculo de diluciones',
    'msub':'Seleccioná el modo de trabajo y calculá tus diluciones.',
    'ml-matraces':'Material de vidrio','ml-tubos':'Tubos 10 mL','ml-micro':'Microdiluciones',
    'ct-m':'Parámetros de entrada','ct-t':'Parámetros de entrada','ct-mc':'Parámetros de microdilución',
    'll-elm':'Elemento','ll-cm':'Concentración inicial','ll-fm':'Factor de dilución','bs-m':'Calcular diluciones →',
    'll-elt':'Elemento','ll-ct':'Concentración inicial','ll-ft':'Factor de dilución','bs-t':'Calcular dilución →',
    'll-c1':'Concentración stock (C₁)','ll-c2':'Concentración deseada (C₂)',
    'll-vf':'Volumen final (mL)','ll-un':'Unidad de concentración','bs-mc':'Calcular microdilución →',
    'sl-elm':'Elemento','sl-midm':'Punto medio','sl-dim':'Dilución inicial','sl-elt':'Elemento',
    'rt-m':'Opciones de dilución','th-fl':'Matraz','th-va':'Volumen alícuota',
    'th-fa':'Factor real','th-st':'Estado',
    'th-at':'Volumen alícuota','th-sv':'Agregar solvente','th-ftr':'Factor real','th-stt':'Estado',
    'et-m':'Sin resultados aún','es-m':'Ingresá los parámetros y presioná Calcular',
    'mrt':'Resultado de microdilución','mbl-v1':'Volumen a pipetear (V₁)',
    'mbl-vs':'Agregar solvente','mbl-vf':'Volumen final','mbl-fd':'Factor de dilución',
    'mstt':'Procedimiento paso a paso','es-mc':'Ingresá C₁, C₂ y presioná Calcular',
    'info-t': '<span class="dil-info-icon">🧪</span><span><strong>Modo tubos:</strong> El volumen final siempre es <strong>10 mL</strong>. Se calcula el volumen de muestra a pipetear y el solvente a agregar para completar.</span>',
    'info-mc': '<span class="dil-info-icon">🔬</span><span><strong>Microdiluciones:</strong> Ingresá la concentración stock (C₁) y la deseada (C₂). Volumen final configurable (por defecto <strong>10 mL</strong>).</span>',
    'best':'Óptimo','punto':'Punto','valido':'✓ Válido','fuera':'⚠ Fuera de rango','excede':'⚠ Excede volumen',
    'calcmid':'Calcular punto medio',
    's1':'Tomar <span class="val">{v1}</span> de la solución stock ({c1} {u}).',
    's2':'Verter en un tubo o matraz de <span class="val">{vf} mL</span>.',
    's3':'Agregar <span class="val">{vs} mL</span> de solvente (agua destilada o ácido diluido).',
    's4':'Homogeneizar. Concentración final: <span class="val">{c2} {u}</span>.',
  },
  en: {
    'sid-title':'Calibration Curve','tog-on':'Management active','tog-off':'Management inactive',
    'sid-el':'Element','sid-pts':'Curve points',
    'eyebrow':'Analytical chemistry','mtitle':'Dilution calculator',
    'msub':'Select a working mode and calculate your dilutions.',
    'ml-matraces':'Glassware','ml-tubos':'10 mL Tubes','ml-micro':'Microdilutions',
    'ct-m':'Input parameters','ct-t':'Input parameters','ct-mc':'Microdilution parameters',
    'll-elm':'Element','ll-cm':'Initial concentration','ll-fm':'Dilution factor','bs-m':'Calculate dilutions →',
    'll-elt':'Element','ll-ct':'Initial concentration','ll-ft':'Dilution factor','bs-t':'Calculate dilution →',
    'll-c1':'Stock concentration (C₁)','ll-c2':'Desired concentration (C₂)',
    'll-vf':'Final volume (mL)','ll-un':'Concentration unit','bs-mc':'Calculate microdilution →',
    'sl-elm':'Element','sl-midm':'Midpoint','sl-dim':'Initial dilution','sl-elt':'Element',
    'rt-m':'Dilution options','th-fl':'Flask','th-va':'Aliquot volume',
    'th-fa':'Real factor','th-st':'Status',
    'th-at':'Aliquot volume','th-sv':'Add solvent','th-ftr':'Real factor','th-stt':'Status',
    'et-m':'No results yet','es-m':'Enter parameters and press Calculate',
    'mrt':'Microdilution result','mbl-v1':'Volume to pipette (V₁)',
    'mbl-vs':'Add solvent','mbl-vf':'Final volume','mbl-fd':'Dilution factor',
    'mstt':'Step-by-step procedure','es-mc':'Enter C₁, C₂ and press Calculate',
    'info-t': '<span class="dil-info-icon">🧪</span><span><strong>Tube mode:</strong> Final volume is always <strong>10 mL</strong>. The aliquot and solvent volumes are calculated.</span>',
    'info-mc': '<span class="dil-info-icon">🔬</span><span><strong>Microdilutions:</strong> Enter stock (C₁) and desired (C₂) concentrations. Configurable final volume (default <strong>10 mL</strong>).</span>',
    'best':'Optimal','punto':'Point','valido':'✓ Valid','fuera':'⚠ Out of range','excede':'⚠ Exceeds volume',
    'calcmid':'Calculate midpoint',
    's1':'Take <span class="val">{v1}</span> from the stock solution ({c1} {u}).',
    's2':'Transfer to a <span class="val">{vf} mL</span> tube or flask.',
    's3':'Add <span class="val">{vs} mL</span> of solvent (distilled water or dilute acid).',
    's4':'Mix thoroughly. Final concentration: <span class="val">{c2} {u}</span>.',
  },
  zh: {
    'sid-title':'校准曲线','tog-on':'管理已启用','tog-off':'管理已禁用',
    'sid-el':'元素','sid-pts':'曲线点',
    'eyebrow':'分析化学','mtitle':'稀释计算',
    'msub':'选择工作模式并计算稀释方案。',
    'ml-matraces':'玻璃器皿','ml-tubos':'10 mL 试管','ml-micro':'微稀释',
    'ct-m':'输入参数','ct-t':'输入参数','ct-mc':'微稀释参数',
    'll-elm':'元素','ll-cm':'初始浓度','ll-fm':'稀释系数','bs-m':'计算稀释 →',
    'll-elt':'元素','ll-ct':'初始浓度','ll-ft':'稀释系数','bs-t':'计算稀释 →',
    'll-c1':'母液浓度 (C₁)','ll-c2':'目标浓度 (C₂)',
    'll-vf':'终体积 (mL)','ll-un':'浓度单位','bs-mc':'计算微稀释 →',
    'sl-elm':'元素','sl-midm':'中点','sl-dim':'初始稀释','sl-elt':'元素',
    'rt-m':'稀释选项','th-fl':'容量瓶','th-va':'移液量',
    'th-fa':'实际系数','th-st':'状态',
    'th-at':'移液量','th-sv':'加入溶剂','th-ftr':'实际系数','th-stt':'状态',
    'et-m':'暂无结果','es-m':'输入参数后按计算',
    'mrt':'微稀释结果','mbl-v1':'移液量 (V₁)',
    'mbl-vs':'加入溶剂','mbl-vf':'终体积','mbl-fd':'稀释系数',
    'mstt':'操作步骤','es-mc':'输入 C₁、C₂ 后按计算',
    'info-t': '<span class="dil-info-icon">🧪</span><span><strong>试管模式：</strong>终体积固定为 <strong>10 mL</strong>，计算移液量和溶剂量。</span>',
    'info-mc': '<span class="dil-info-icon">🔬</span><span><strong>微稀释：</strong>输入母液浓度（C₁）和目标浓度（C₂），终体积可调（默认 <strong>10 mL</strong>）。</span>',
    'best':'最优','punto':'点','valido':'✓ 有效','fuera':'⚠ 超出范围','excede':'⚠ 超过体积',
    'calcmid':'计算中点',
    's1':'从母液（{c1} {u}）中取 <span class="val">{v1}</span>。',
    's2':'转移至 <span class="val">{vf} mL</span> 容量瓶或试管。',
    's3':'加入 <span class="val">{vs} mL</span> 溶剂（蒸馏水或稀酸）。',
    's4':'混匀，终浓度为 <span class="val">{c2} {u}</span>。',
  }
};

const t = k => DIL_TR[dilLang][k] || k;

const IDS_TEXT = [
  'sid-title','sid-el','sid-pts','eyebrow','mtitle','msub',
  'ml-matraces','ml-tubos','ml-micro',
  'ct-m','ct-t','ct-mc',
  'll-elm','ll-cm','ll-fm','bs-m',
  'll-elt','ll-ct','ll-ft','bs-t',
  'll-c1','ll-c2','ll-vf','ll-un','bs-mc',
  'sl-elm','sl-midm','sl-dim','sl-elt',
  'rt-m','th-fl','th-va','th-fa','th-st',
  'th-at','th-sv','th-ftr','th-stt',
  'et-m','es-m',
  'mrt','mbl-v1','mbl-vs','mbl-vf','mbl-fd','mstt','es-mc'
];
const IDS_HTML = ['info-t','info-mc'];

function dilApplyTranslations() {
  IDS_TEXT.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(id);
  });
  IDS_HTML.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = t(id);
  });
  const togLabel = document.getElementById('togLabel');
  if (togLabel) togLabel.textContent = dilCurveOn ? t('tog-on') : t('tog-off');
  const calcMid = document.getElementById('calcMid');
  if (calcMid) calcMid.textContent = t('calcmid');
  updatePatrones(document.getElementById('elCurva').value);
}

/* ─── Patrones inputs ─── */
function updatePatrones(el) {
  const container = document.getElementById('patronCont');
  if (!container) return;
  container.innerHTML = '';
  if (!dilCurveOn) return;
  const n = DIL_N_PATRONES[el] || 5;
  for (let i = 0; i < n; i++) {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.classList.add('curve-pt', 'dil-input');
    inp.step = 'any';
    inp.placeholder = `${t('punto')} ${i + 1}`;
    container.appendChild(inp);
  }
}

function getMid(el) {
  if (dilCurveOn) {
    const v = parseFloat(document.getElementById('rval').textContent);
    if (!isNaN(v)) return v;
  }
  return DIL_DEFAULTS[el];
}

/* ─── Status HTML ─── */
function statusHtml(vol, max) {
  if (vol < 0.05) return `<span class="status-bad">${t('fuera')}</span>`;
  if (vol > max)  return `<span class="status-warn">${t('excede')}</span>`;
  return `<span class="status-ok">${t('valido')}</span>`;
}

/* ─── Toggle sidebar curva ─── */
document.getElementById('togCurve').addEventListener('click', () => {
  dilCurveOn = !dilCurveOn;
  const btn = document.getElementById('togCurve');
  btn.classList.toggle('on', dilCurveOn);
  document.getElementById('togLabel').textContent = dilCurveOn ? t('tog-on') : t('tog-off');
  document.getElementById('ptGroup').style.display = dilCurveOn ? '' : 'none';
  document.getElementById('calcMid').style.display = dilCurveOn ? '' : 'none';
  document.getElementById('rpill').style.display = 'none';
  if (dilCurveOn) updatePatrones(document.getElementById('elCurva').value);
});

document.getElementById('elCurva').addEventListener('change', e => {
  updatePatrones(e.target.value);
  document.getElementById('rpill').style.display = 'none';
});

document.getElementById('calcMid').addEventListener('click', () => {
  const vals = Array.from(document.querySelectorAll('.curve-pt'))
    .map(i => parseFloat(i.value)).filter(v => !isNaN(v));
  if (!vals.length) { alert('Ingresá valores válidos.'); return; }
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  document.getElementById('rval').textContent = avg.toFixed(4);
  const pill = document.getElementById('rpill');
  pill.style.display = 'flex';
  pill.classList.add('animate-in');
});

/* ─── Mode tabs ─── */
document.querySelectorAll('.dil-mode-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const m = btn.dataset.m;
    document.querySelectorAll('.dil-mode-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ['matraces', 'tubos', 'micro'].forEach(p => {
      document.getElementById('pan-' + p).style.display = p === m ? 'flex' : 'none';
    });
  });
});

/* ─── FORM: MATRACES ─── */
document.getElementById('fMat').addEventListener('submit', e => {
  e.preventDefault();
  const el  = document.getElementById('el-m').value;
  const ci  = parseFloat(document.getElementById('ci-m').value);
  const fd  = parseFloat(document.getElementById('fd-m').value);
  if (isNaN(ci) || isNaN(fd) || ci <= 0 || fd <= 0) { alert('Ingresá valores válidos.'); return; }

  const pm = getMid(el);
  const di = ci / fd;
  const matraces = [10, 25, 50, 100, 250];
  const recs = matraces.map(m => {
    const v = m / (di / pm);
    return { m, v, f: m / v };
  });
  const valid = recs.filter(r => r.v >= 0.05 && r.v <= r.m);
  const bi = valid.length
    ? recs.indexOf(valid.reduce((a, b) => Math.abs(a.v - 1) < Math.abs(b.v - 1) ? a : b))
    : -1;

  const sr = document.getElementById('sr-m');
  sr.style.display = 'grid';
  sr.classList.add('animate-in');
  document.getElementById('sv-elm').textContent  = el.charAt(0).toUpperCase() + el.slice(1);
  document.getElementById('sv-midm').textContent = pm.toFixed(4);
  document.getElementById('sv-dim').textContent  = di.toFixed(4);

  document.getElementById('em-m').style.display = 'none';
  const rc = document.getElementById('rc-m');
  rc.style.display = 'block';
  rc.classList.add('animate-in');

  document.getElementById('tb-m').innerHTML = recs.map((r, i) => `
    <tr class="${i === bi ? 'best-row' : ''}">
      <td>
        <span class="td-badge badge-blue">${r.m} mL</span>
        ${i === bi ? `<span class="best-tag">${t('best')}</span>` : ''}
      </td>
      <td class="td-mono">${r.v.toFixed(4)} mL</td>
      <td class="td-mono">${r.f.toFixed(4)}</td>
      <td>${statusHtml(r.v, r.m)}</td>
    </tr>`).join('');
});

/* ─── FORM: TUBOS 10 mL ─── */
document.getElementById('fTub').addEventListener('submit', e => {
  e.preventDefault();
  const el = document.getElementById('el-t').value;
  const ci = parseFloat(document.getElementById('ci-t').value);
  const fd = parseFloat(document.getElementById('fd-t').value);
  if (isNaN(ci) || isNaN(fd) || ci <= 0 || fd <= 0) { alert('Ingresá valores válidos.'); return; }

  const pm = getMid(el);
  const di = ci / fd;
  const VF = 10;
  const vol   = VF / (di / pm);
  const solv  = VF - vol;
  const fReal = VF / vol;

  const sr = document.getElementById('sr-t');
  sr.style.display = 'grid';
  sr.classList.add('animate-in');
  document.getElementById('sv-elt').textContent  = el.charAt(0).toUpperCase() + el.slice(1);
  document.getElementById('sv-midt').textContent = pm.toFixed(4);
  document.getElementById('sv-dit').textContent  = di.toFixed(4);

  document.getElementById('em-t').style.display = 'none';
  const rc = document.getElementById('rc-t');
  rc.style.display = 'block';
  rc.classList.add('animate-in');

  const ok = vol >= 0.05 && vol <= VF;
  document.getElementById('tb-t').innerHTML = `
    <tr class="${ok ? 'best-row' : ''}">
      <td><span class="td-badge badge-teal">Tubo 10 mL</span></td>
      <td class="td-mono">${vol.toFixed(4)} mL</td>
      <td class="td-mono">${solv > 0 ? solv.toFixed(4) + ' mL' : '—'}</td>
      <td class="td-mono">${fReal.toFixed(4)}</td>
      <td>${statusHtml(vol, VF)}</td>
    </tr>`;
});

/* ─── FORM: MICRODILUCIONES ─── */
document.getElementById('fMic').addEventListener('submit', e => {
  e.preventDefault();
  const c1 = parseFloat(document.getElementById('mc-c1').value);
  const c2 = parseFloat(document.getElementById('mc-c2').value);
  const vf = parseFloat(document.getElementById('mc-vf').value);
  const un = document.getElementById('mc-un').value;
  if (isNaN(c1) || isNaN(c2) || isNaN(vf) || c1 <= 0 || c2 <= 0 || vf <= 0) {
    alert('Ingresá valores válidos.'); return;
  }
  if (c2 >= c1) { alert('C₂ debe ser menor que C₁.'); return; }

  // C1·V1 = C2·V2  →  V1 = C2·V2 / C1
  const v1 = (c2 * vf) / c1;
  const vs = vf - v1;
  const fd = c1 / c2;

  document.getElementById('em-mc').style.display = 'none';
  const mr = document.getElementById('mres');
  mr.style.display = 'block';
  mr.classList.add('animate-in');

  // Auto µL si < 1 mL
  if (v1 < 1) {
    document.getElementById('mv1').textContent  = (v1 * 1000).toFixed(2);
    document.getElementById('mv1u').textContent = 'µL';
  } else {
    document.getElementById('mv1').textContent  = v1.toFixed(4);
    document.getElementById('mv1u').textContent = 'mL';
  }
  document.getElementById('mvs').textContent = vs.toFixed(4);
  document.getElementById('mvf').textContent = vf.toFixed(2);
  document.getElementById('mfd').textContent = fd.toFixed(2) + '×';

  const c1d  = c1 % 1 === 0 ? c1.toFixed(0) : c1.toFixed(4);
  const c2d  = c2 % 1 === 0 ? c2.toFixed(0) : c2.toFixed(4);
  const v1disp = v1 < 1 ? (v1 * 1000).toFixed(2) + ' µL' : v1.toFixed(4) + ' mL';

  const steps = [
    t('s1').replace('{v1}', v1disp).replace('{c1}', c1d).replace('{u}', un),
    t('s2').replace('{vf}', vf.toFixed(2)),
    t('s3').replace('{vs}', vs.toFixed(4)),
    t('s4').replace('{c2}', c2d).replace('{u}', un),
  ];

  document.getElementById('steplist').innerHTML = steps.map((s, i) => `
    <div class="dil-step-item">
      <div class="dil-step-num">${i + 1}</div>
      <div>${s}</div>
    </div>`).join('');
});

/* ─── Language (llamado desde app.js) ─── */
function dilSetLang(l) {
  dilLang = l;
  dilApplyTranslations();
}

/* ─── Init ─── */
function dilInit() {
  updatePatrones('litio');
}
