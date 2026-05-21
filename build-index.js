#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const QUIZ_DIR = path.join(__dirname, "quizzes");

const PREFIXES = {
  ad: "Acceso a Datos",
  sge: "Sistemas de Gestión Empresarial",
  psp: "Programación de Servicios y Procesos",
  cib: "Ciberseguridad",
  pmydm: "Programación Multimedia y Dispositivos Móviles",
  itn: "Itinerario Personal para la Empleabilidad",
  acc: "Acceso a Datos",
  di: "Desarrollo de Interfaces"
};

const SKIP = ["ffe", "proyecto"];

const files = fs.readdirSync(QUIZ_DIR)
  .filter(f => f.endsWith(".html"))
  .filter(f => !SKIP.some(skip => f.startsWith(skip)));

const groups = {};
files.forEach(file => {
  const prefix = file.split("-")[0];
  if (!PREFIXES[prefix]) return;
  if (!groups[prefix]) groups[prefix] = [];
  groups[prefix].push(file);
});
Object.values(groups).forEach(list => list.sort());

// "sge-1.html"        → { prefix: "sge", middle: "",       num: "1" }
// "sge-kahoot-1.html" → { prefix: "sge", middle: "Kahoot", num: "1" }
function parseFilename(file) {
  const base = file.replace(".html", "");
  const parts = base.split("-");
  const prefix = parts[0];
  const num = parts[parts.length - 1].match(/^\d+$/) ? parts[parts.length - 1] : null;
  const middleParts = parts.slice(1, num ? parts.length - 1 : parts.length);
  const middle = middleParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return { prefix, middle, num };
}

function quizLabel(file) {
  const { prefix, middle, num } = parseFilename(file);
  const fullName = PREFIXES[prefix] || prefix.toUpperCase();
  const middlePart = middle ? ` ${middle}` : "";
  return num ? `${fullName}${middlePart} · Quiz ${num}` : fullName;
}

function cardLabel(file) {
  const { prefix, middle, num } = parseFilename(file);
  const middlePart = middle ? ` ${middle}` : "";
  return num
    ? `${prefix.toUpperCase()}${middlePart} · Quiz ${num}`
    : prefix.toUpperCase();
}

// Shared dark mode CSS + toggle (injected into every page)
const DARK_MODE_CSS = `
  [data-theme="dark"] {
    --bg: #1a1612;
    --bg-deep: #141210;
    --ink: #f0ebe0;
    --muted: #9a9080;
    --accent: #e8673a;
    --accent-light: #ff9a6a;
    --accent-dark: #c45528;
    --teal: #2a9aa8;
    --card: #221e18;
    --stroke: #3a3028;
    --shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
  }`;

const DARK_MODE_TOGGLE_CSS = `
  #theme-toggle {
    position: fixed;
    top: 8px;
    right: 8px;
    background: var(--card);
    border: 1px solid var(--stroke);
    border-radius: 50%;
    width: 34px;
    height: 34px;
    cursor: pointer;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    z-index: 100;
  }
  #theme-toggle:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }`;

const DARK_MODE_SCRIPT = `
  <button id="theme-toggle" title="Cambiar tema">🌙</button>
  <script>
    (function() {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('theme-toggle').textContent = '☀️';
      }
      document.getElementById('theme-toggle').addEventListener('click', function() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        this.textContent = isDark ? '🌙' : '☀️';
      });
    })();
  <\/script>`;

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Índice de Quizzes</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">

<style>
  :root {
    --bg: #f6f1e7;
    --bg-deep: #efe4d6;
    --ink: #171717;
    --muted: #5b5b5b;
    --accent: #d3542c;
    --accent-light: #ff8f5a;
    --accent-dark: #b14320;
    --teal: #1f6f78;
    --card: #fff7ef;
    --stroke: #e3d6c5;
    --shadow: 0 18px 40px rgba(23, 23, 23, 0.12);
    --radius-md: 12px;
    --radius-lg: 14px;
    --radius-xl: 18px;
    --radius-2xl: 22px;
    --font-display: 'Space Grotesk', sans-serif;
    --font-body: 'IBM Plex Sans', sans-serif;
  }
${DARK_MODE_CSS}
${DARK_MODE_TOGGLE_CSS}

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--font-body);
    background:
      radial-gradient(240px 140px at 10% -10%, #ffd2b9 0%, transparent 70%),
      radial-gradient(220px 160px at 90% 0%, #cfe7e6 0%, transparent 65%),
      linear-gradient(180deg, var(--bg) 0%, var(--bg-deep) 100%);
    color: var(--ink);
    min-height: 100vh;
    padding: 48px 20px;
    transition: background 0.3s ease, color 0.3s ease;
  }

  [data-theme="dark"] body {
    background:
      radial-gradient(240px 140px at 10% -10%, #3a1a08 0%, transparent 70%),
      radial-gradient(220px 160px at 90% 0%, #0a2a2e 0%, transparent 65%),
      linear-gradient(180deg, var(--bg) 0%, var(--bg-deep) 100%);
  }

  .container { max-width: 720px; margin: 0 auto; }

  h1 {
    font-family: var(--font-display);
    font-size: 2.2em;
    font-weight: 700;
    text-align: center;
    margin-bottom: 8px;
    color: var(--ink);
  }

  .subtitle {
    text-align: center;
    color: var(--muted);
    font-size: 1em;
    margin-bottom: 12px;
  }

  .badge-row {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 32px;
  }

  .badge {
    background: rgba(31, 111, 120, 0.1);
    color: var(--teal);
    border: 1px solid rgba(31, 111, 120, 0.2);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.82em;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  #search {
    width: 100%;
    padding: 14px 18px;
    margin-bottom: 40px;
    font-family: var(--font-body);
    font-size: 1em;
    border-radius: var(--radius-lg);
    border: 1px solid var(--stroke);
    background: var(--card);
    color: var(--ink);
    outline: none;
    box-shadow: 0 4px 16px rgba(23,23,23,0.07);
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }

  #search::placeholder { color: var(--muted); }
  #search:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(211, 84, 44, 0.12);
  }

  .section { margin-bottom: 44px; }

  .section-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 16px;
  }

  .section-header h2 {
    font-family: var(--font-display);
    font-size: 1.05em;
    font-weight: 700;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    flex-shrink: 1;
  }

  .tag {
    background: rgba(211, 84, 44, 0.1);
    color: var(--accent-dark);
    padding: 2px 8px;
    border-radius: 5px;
    font-size: 0.72em;
    font-weight: 700;
    letter-spacing: 0.05em;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .count {
    color: var(--muted);
    font-size: 0.8em;
    white-space: nowrap;
    flex-shrink: 0;
    margin-left: auto;
  }

  .quiz-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .quiz-item {
    background: var(--card);
    border: 1px solid var(--stroke);
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 16px rgba(23,23,23,0.07);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .quiz-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  .quiz-item a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    text-decoration: none;
    color: var(--ink);
    font-weight: 500;
    font-size: 0.97em;
  }

  .quiz-item a::after {
    content: '→';
    color: var(--accent);
    font-size: 1.1em;
    opacity: 0.7;
    transition: opacity 0.2s, transform 0.2s;
  }

  .quiz-item:hover a::after { opacity: 1; transform: translateX(3px); }

  .no-results {
    text-align: center;
    color: var(--muted);
    padding: 40px 0;
    font-size: 0.95em;
    display: none;
  }

  @media (max-width: 520px) {
    h1 { font-size: 1.7em; }
    body { padding: 32px 16px; }
  }
</style>
</head>

<body>
${DARK_MODE_SCRIPT}
<div class="container">

  <h1>🎯 Índice de Quizzes</h1>
  <p class="subtitle">Selecciona un quiz para comenzar a practicar</p>
  <p class="badge-row"><span class="badge">DAM · 2º año</span><span class="badge">Temas 8 – 15</span></p>

  <input type="text" id="search" placeholder="Buscar… (ej: sge, psp 2, ciber)" autocomplete="off" />

  ${Object.keys(groups)
    .sort()
    .map(prefix => {
      const count = groups[prefix].length;
      return `
<section class="section" data-prefix="${prefix}">
  <div class="section-header">
    <h2>${PREFIXES[prefix]}</h2>
    <span class="tag">${prefix.toUpperCase()}</span>
    <span class="count">${count} quiz${count !== 1 ? 'zes' : ''}</span>
  </div>
  <ul class="quiz-list">
    ${groups[prefix].map(file => {
      return `<li class="quiz-item" data-subject="${PREFIXES[prefix].toLowerCase()}"><a href="quizzes/${file}">${cardLabel(file)}</a></li>`;
    }).join("")}
  </ul>
</section>`;
    })
    .join("\n")}

  <p class="no-results" id="no-results">No se encontraron quizzes para "<span id="no-results-term"></span>".</p>

</div>

<script>
  const search = document.getElementById("search");
  const noResults = document.getElementById("no-results");
  const noResultsTerm = document.getElementById("no-results-term");

  search.addEventListener("input", () => {
    const term = search.value.toLowerCase().trim();
    let visible = 0;

    document.querySelectorAll(".quiz-item").forEach(li => {
      const text = li.innerText.toLowerCase();
      const subject = (li.dataset.subject || "");
      const show = !term || text.includes(term) || subject.includes(term);
      li.style.display = show ? "" : "none";
      if (show) visible++;
    });

    document.querySelectorAll(".section").forEach(section => {
      const anyVisible = [...section.querySelectorAll(".quiz-item")]
        .some(li => li.style.display !== "none");
      section.style.display = anyVisible ? "" : "none";
    });

    if (term && visible === 0) {
      noResults.style.display = "block";
      noResultsTerm.textContent = search.value;
    } else {
      noResults.style.display = "none";
    }
  });
</script>

</body>
</html>`;

fs.writeFileSync(path.join(__dirname, "index.html"), html, "utf8");
console.log("index.html actualizado ✔️");

// Translations
const TRANSLATIONS = [
  [/\bHint\b/g,                                "Pista"],
  [/✓ Right answer/g,                          "✓ Correcto"],
  [/✕ Not quite/g,                             "✕ Incorrecto"],
  [/Back to Results/g,                         "Volver a resultados"],
  [/Review Quiz/g,                             "Revisar Quiz"],
  [/Retake Quiz/g,                             "Repetir Quiz"],
  [/You did it! Quiz Complete\./g,             "¡Lo lograste! Quiz completado."],
  [/Review your score or take another run\./g, "Revisa tu puntuación o inténtalo de nuevo."],
  [/\bScore\b/g,                               "Puntuación"],
  [/\bAccuracy\b/g,                            "Precisión"],
  [/\bRight\b/g,                               "Correctas"],
  [/\bWrong\b/g,                               "Incorrectas"],
  [/\bSkipped\b/g,                             "Omitidas"],
  [/\bFinish\b/g,                              "Finalizar"],
  [/\bPrevious\b/g,                            "Anterior"],
  [/\bNext\b/g,                                "Siguiente"],
  [/No hint available for this question\./g,   "No hay pista disponible para esta pregunta."],
];

// Dark mode CSS to inject into quiz files
const QUIZ_DARK_CSS = `
    [data-theme="dark"] {
      --bg: #1a1612;
      --bg-deep: #141210;
      --ink: #f0ebe0;
      --muted: #9a9080;
      --accent: #e8673a;
      --accent-light: #ff9a6a;
      --accent-dark: #c45528;
      --teal: #2a9aa8;
      --card: #221e18;
      --stroke: #3a3028;
      --shadow: 0 18px 40px rgba(0,0,0,0.4);
      --error: #e06050;
    }
    [data-theme="dark"] body {
      background:
        radial-gradient(240px 140px at 10% -10%, #3a1a08 0%, transparent 70%),
        radial-gradient(220px 160px at 90% 0%, #0a2a2e 0%, transparent 65%),
        linear-gradient(180deg, var(--bg) 0%, var(--bg-deep) 100%);
    }
    [data-theme="dark"] .option-item { background-color: var(--card); }
    [data-theme="dark"] .hint-toggle,
    [data-theme="dark"] .hint-content,
    [data-theme="dark"] .btn-prev { background-color: var(--card); color: var(--ink); }
    [data-theme="dark"] .result-card { background: var(--card); }
    [data-theme="dark"] .btn-next {
      background: linear-gradient(90deg, #e8673a, #f28c5e);
      box-shadow: 0 4px 20px rgba(232, 103, 58, 0.35);
      color: #fff;
    }
    [data-theme="dark"] .btn-next:hover:not(:disabled) {
      box-shadow: 0 6px 24px rgba(232, 103, 58, 0.5);
    }`;

// Mobile: flex column layout
const QUIZ_MOBILE_CSS = `
    /* quiz-mobile-v3 */
    @media (max-width: 640px) {
      body {
        height: 100dvh;
        overflow: hidden;
        align-items: flex-start;
        padding: 0;
      }
      .quiz-container {
        height: 100dvh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        margin: 0;
        border-radius: 0;
        border-left: none;
        border-right: none;
        border-top: none;
        padding-bottom: 0;
      }
      #quiz-content,
      #results-content {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        min-height: 0;
        padding-bottom: 8px;
      }
      #hint-box { flex-shrink: 0; }
      .navigation {
        flex-shrink: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        margin-top: 0;
        background: var(--card);
        border-top: 1px solid var(--stroke);
      }
    }`;

const quizFiles = fs.readdirSync(QUIZ_DIR).filter(f => f.endsWith(".html"));
let translated = 0;

quizFiles.forEach(file => {
  const filePath = path.join(QUIZ_DIR, file);
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  const label = quizLabel(file);

  // Inject heading before quiz-container if not present
  if (!content.includes('class="quiz-heading"')) {
    const heading = `
    <div class="quiz-heading" style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--stroke)">
      <a href="../index.html" style="font-size:0.82em;color:var(--muted);text-decoration:none;font-family:var(--font-body)">← Índice</a>
      <h1 style="font-family:var(--font-display);font-size:1.1em;font-weight:700;color:var(--ink);margin-top:8px;padding-right:44px">${label}</h1>
    </div>`;
    content = content.replace('<div class="quiz-container">', `<div class="quiz-container">\n${heading}`);
  }

  // Inject dark mode CSS if not present
  if (!content.includes('[data-theme="dark"]')) {
    content = content.replace('</style>', `${QUIZ_DARK_CSS}\n    </style>`);
  }

  // Inject mobile CSS if not present
  if (!content.includes('quiz-mobile-v3')) {
    content = content.replace('</style>', `${QUIZ_MOBILE_CSS}\n    </style>`);
  }

  // Inject dark mode toggle if not present
  if (!content.includes('id="theme-toggle"')) {
    const toggleScript = `
  <button id="theme-toggle" title="Cambiar tema" style="position:fixed;top:8px;right:8px;background:var(--card);border:1px solid var(--stroke);border-radius:50%;width:34px;height:34px;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(0,0,0,0.1);transition:transform 0.2s ease;z-index:100;">🌙</button>
  <script>
    (function() {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('theme-toggle').textContent = '☀️';
      }
      document.getElementById('theme-toggle').addEventListener('click', function() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        this.textContent = isDark ? '🌙' : '☀️';
      });
    })();
  <\/script>`;
    content = content.replace('</body>', `${toggleScript}\n</body>`);
  }

  // Translate if not already done
  if (!content.includes("Pista") && !content.includes("Siguiente")) {
    TRANSLATIONS.forEach(([pattern, replacement]) => {
      content = content.replace(pattern, replacement);
    });
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    translated++;
    console.log(`  ✔ ${file}`);
  } else {
    console.log(`  ↷ ${file} (sin cambios)`);
  }
});

console.log(`Procesados ${translated} archivo(s) ✔️`);
