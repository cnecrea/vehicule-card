/**
 * Build simplu — concatenează sursele într-un singur fișier JS.
 * Nu necesită webpack/rollup/vite.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

// Ordinea contează — constantele și utilitarele primele, apoi configs, editor, card
const FILES = [
  'constants.js',
  'utils.js',
  'configs.js',
  'editor.js',
  'card.js',
];

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

let output = `/**
 * Vehicule Card v${require('./package.json').version}
 * https://github.com/cnecrea/vehicule-card
 * Meta-card pentru integrarea Vehicule — Home Assistant
 * Necesită: button-card, stack-in-card, bubble-card, card-mod, mini-graph-card
 */\n\n`;

for (const file of FILES) {
  const filePath = path.join(SRC, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ Fișier lipsă: ${file}`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  output += `// ── ${file} ${'─'.repeat(60 - file.length)}\n\n${content}\n\n`;
}

fs.writeFileSync(path.join(DIST, 'vehicule-card.js'), output);
console.log(`✅ Build complet: dist/vehicule-card.js (${(output.length / 1024).toFixed(1)} KB)`);
