# LabTrack · Suite Analítica

**Propiedad de William Martin Campal**

Suite de herramientas analíticas para laboratorio. Dos aplicaciones independientes, listas para GitHub Pages.

---

## Aplicaciones

### ⚗ `index.html` — Diluciones + Fire Assay
- **Diluciones**: Material de vidrio / Tubos 10 mL / Microdiluciones (C₁V₁=C₂V₂)
- **Fire Assay Pro**: Registro de muestras Doré, resultados, procedimiento, informe PDF

### 🔬 `calibracion.html` — Curva de Calibración ICP / AAS
- Estándares monoelemento y multielementos
- Cualquier cantidad de niveles (3, 5, 7, 9 o personalizado)
- Peso teórico calculado → ingreso de peso real → concentración real exacta
- Error % de control de calidad por nivel
- Sección de Procedimiento técnico detallado
- Informe PDF con logo, analista, lote y firma

---

## Estructura

    labtrack/
    ├── index.html
    ├── calibracion.html
    ├── css/
    │   ├── base.css
    │   ├── diluciones.css
    │   └── fireassay.css
    ├── js/
    │   ├── app.js
    │   ├── diluciones.js
    │   └── fireassay.js
    └── README.md

## GitHub Pages

1. Subir todos los archivos manteniendo la estructura
2. Settings → Pages → main branch / (root)
3. URLs:
   - /labtrack/ → Diluciones + Fire Assay
   - /labtrack/calibracion.html → Curva ICP/AAS
