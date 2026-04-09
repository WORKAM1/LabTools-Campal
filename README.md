# LabTrack · Suite Analítica

**Propiedad de William Martin Campal**

Aplicación analítica completa para laboratorio. Un único `index.html` con tres módulos integrados.

---

## Módulos

| Módulo | Descripción |
|--------|-------------|
| ⚗ **Diluciones** | Matraces / Tubos 10 mL / Microdiluciones C₁V₁=C₂V₂ — trilingüe ES/EN/ZH |
| 🔥 **Fire Assay Pro** | Registro muestras Doré, resultados, procedimiento, informe PDF |
| 📈 **Calibración ICP/AAS** | Curva de calibración graviométrica, mono y multielementos, informe PDF |

---

## Estructura del proyecto

```
LabTools-Campal/
├── index.html          ← App principal (3 módulos)
├── css/
│   ├── base.css        ← Variables globales, topbar, footer, responsive
│   ├── diluciones.css  ← Estilos módulo Diluciones
│   └── fireassay.css   ← Estilos módulo Fire Assay
├── js/
│   ├── app.js          ← Controlador principal + menú móvil
│   ├── diluciones.js   ← Lógica Diluciones + traducciones ES/EN/ZH
│   ├── fireassay.js    ← Lógica Fire Assay + PDF
│   └── calibracion.js  ← Lógica Calibración ICP/AAS + PDF
└── README.md
```

---

## Subir a GitHub Pages

1. Descomprimí el ZIP
2. Subí **todos** los archivos al repositorio **manteniendo** la estructura de carpetas
3. **Settings → Pages → Deploy from branch → main → / (root)**
4. En unos minutos: `https://WORKAM1.github.io/LabTools-Campal/`

> ⚠️ **Importante:** Los archivos CSS y JS en sus carpetas deben estar presentes.
> `index.html` los referencia relativamente.

---

## Responsive

- **Desktop**: sidebar + contenido principal lado a lado
- **Tablet**: sidebar colapsado, formularios en 2 columnas  
- **Móvil**: menú hamburguesa en topbar, todo en 1 columna

