#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const QUIZ_DIR = path.join(__dirname, "quizzes");

// Map prefixes → full names
const PREFIXES = {
  sge: "Sistemas de Gestión Empresarial",
  psp: "Programación de Servicios y Procesos",
  cib: "Ciberseguridad",
  pmydm: "Programación Multimedia y Dispositivos Móviles",
  itn: "Itinerario Personal para la Empleabilidad",
  acc: "Acceso a Datos",
  di: "Desarrollo de Interfaces"
};

// Skip these prefixes
const SKIP = ["ffe", "proyecto"];

// Read quiz files
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
  }

  .container {
    max-width: 720px;
    margin: 0 auto;
  }

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
    background: #fff;
    color: var(--ink);
    outline: none;
    box-shadow: 0 4px 16px rgba(23,23,23,0.07);
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }

  #search::placeholder { color: #aaa; }

  #search:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(211, 84, 44, 0.12);
  }

  .section {
    margin-bottom: 44px;
  }

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

  .quiz-item:hover a::after {
    opacity: 1;
    transform: translateX(3px);
  }

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
<div class="container">

  <h1>📚 Índice de Quizzes</h1>
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
    ${groups[prefix].map((file, idx) => {
      const num = (file.match(/(\d+)/) || [])[1];
      const label = num
        ? `${prefix.toUpperCase()} · Quiz ${num}`
        : `${prefix.toUpperCase()} · Quiz ${idx + 1}`;
      return `<li class="quiz-item" data-subject="${PREFIXES[prefix].toLowerCase()}"><a href="quizzes/${file}">${label}</a></li>`;
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

    // Hide sections where all items are hidden
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
// Translate hardcoded English strings in quiz files
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

const quizFiles = fs.readdirSync(QUIZ_DIR).filter(f => f.endsWith(".html"));
let translated = 0;

quizFiles.forEach(file => {
  const filePath = path.join(QUIZ_DIR, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Build heading label: "Programación de Servicios y Procesos · Quiz 4"
  const prefix = file.split("-")[0];
  const fullName = PREFIXES[prefix] || prefix.toUpperCase();
  const num = (file.match(/(\d+)/) || [])[1];
  const quizLabel = num ? `${fullName} · Quiz ${num}` : fullName;

  const heading = `
    <div class="quiz-heading" style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--stroke)">
      <a href="../index.html" style="font-size:0.82em;color:var(--muted);text-decoration:none;font-family:var(--font-body)">← Índice</a>
      <h1 style="font-family:var(--font-display);font-size:1.1em;font-weight:700;color:var(--ink);margin-top:8px">${quizLabel}</h1>
    </div>`;

  // Always inject heading if not already present
  if (!content.includes('class="quiz-heading"')) {
    content = content.replace('<div id="quiz-content">', `<div id="quiz-content">${heading}`);
  }

  // Skip translation if already done
  if (content.includes("Pista") || content.includes("Siguiente")) {
    const original2 = fs.readFileSync(filePath, "utf8");
    if (content !== original2) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`  ✔ ${file} (heading añadido)`);
    } else {
      console.log(`  ↷ ${file} (ya traducido)`);
    }
    return;
  }

  const original = content;

  TRANSLATIONS.forEach(([pattern, replacement]) => {
    content = content.replace(pattern, replacement);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    translated++;
    console.log(`  ✔ ${file}`);
  }
});

console.log(`Traducidos ${translated} archivo(s) ✔️`);
