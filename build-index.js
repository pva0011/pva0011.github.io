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

function buildSection(prefix, files) {
  const title = PREFIXES[prefix];
  const count = files.length;

  let html = `
<section class="section">
  <h2>${title} <span class="tag">${prefix.toUpperCase()}</span>
      <span class="count">(${count} quizzes)</span>
  </h2>
  <ul class="quiz-list">
`;

  files.forEach(file => {
    const label = file.replace(".html", "").toUpperCase();
    const searchText = `${title.toLowerCase()} ${label.toLowerCase()}`;

    html += `
      <li class="quiz-item" data-search="${searchText}">
        <a href="./quizzes/${file}">${label}</a>
      </li>`;
  });

  html += `
  </ul>
</section>
`;
  return html;
}


const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Índice de Quizzes</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

/* LIGHT MODE */
:root {
  --bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --text: #fff;
  --card-bg: #ffffff;
  --card-text: #222;
  --accent: #667eea;
  --glass: rgba(255,255,255,0.3);
}

/* DARK MODE */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f0f14;
    --text: #eee;
    --card-bg: #1b1b22;
    --card-text: #eee;
    --accent: #9fa8ff;
    --glass: rgba(255,255,255,0.15);
  }
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--bg);
  min-height: 100vh;
  padding: 20px;
  color: var(--text);
}

.container {
  max-width: 700px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

/* Search bar (glass style) */
#search {
  width: 100%;
  padding: 14px;
  margin: 20px 0 30px 0;
  font-size: 18px;
  border-radius: 10px;
  border: none;
  outline: none;
  background: var(--glass);
  color: var(--text);
  backdrop-filter: blur(6px);
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 14px;
  color: var(--text);
  text-shadow: 0 1px 6px rgba(0,0,0,0.2);
}

.tag {
  background: var(--glass);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 14px;
  margin-left: 6px;
}

.count {
  font-size: 14px;
  opacity: 0.85;
  margin-left: 8px;
}

/* Quiz cards */
.quiz-list {
  list-style: none;
  padding: 0;
}

.quiz-item {
  background: var(--card-bg);
  margin: 12px 0;
  padding: 18px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  font-size: 18px;
  transition: transform 0.2s, box-shadow 0.2s;
  color: var(--card-text);
}

.quiz-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 50px rgba(0,0,0,0.25);
}

.quiz-item a {
  text-decoration: none;
  color: var(--accent);
  font-weight: 600;
  display: block;
}
</style>
</head>

<body>
<div class="container">

<h1>📚 Índice de Quizzes</h1>

<input type="text" id="search" placeholder="Buscar por nombre completo…" />

${Object.keys(groups)
  .sort()
  .map(prefix => buildSection(prefix, groups[prefix]))
  .join("\n")}

</div>

<script>
// Improved search: searches long names + labels
const search = document.getElementById("search");
search.addEventListener("input", () => {
    const term = search.value.toLowerCase();
    const items = document.querySelectorAll(".quiz-item");

    items.forEach(li => {
        const text = li.dataset.search;
        li.style.display = text.includes(term) ? "" : "none";
    });
});
</script>

</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, "index.html"), html, "utf8");

console.log("index.html actualizado ✔️");

