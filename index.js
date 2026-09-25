#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const path = require('path');

const filePath = process.argv[2];

if (!filePath) {
  console.log('\n❌ Błąd: Podaj ścieżkę do pliku G-code.');
  console.log('Użycie: node index.js <ścieżka-do-pliku.gcode>\n');
  process.exit(1);
}

const absolutePath = path.resolve(filePath);

if (!fs.existsSync(absolutePath)) {
  console.log(`\n❌ Błąd: Plik "${filePath}" nie istnieje.\n`);
  process.exit(1);
}

async function analyzeGCode(file) {
  const fileStream = fs.createReadStream(file);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  let layerCount = 0;
  let toolChanges = 0;
  let nozzleTemp = 'Nie wykryto';
  let bedTemp = 'Nie wykryto';
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  let lastZ = null;

  for await (const line of rl) {
    lineCount++;
    const cleanLine = line.split(';')[0].trim(); // Odrzuć komentarze

    if (!cleanLine) continue;

    // Wykrywanie temperatur
    if (cleanLine.startsWith('M104') || cleanLine.startsWith('M109')) {
      const match = cleanLine.match(/S(\d+)/);
      if (match) nozzleTemp = `${match[1]} °C`;
    }
    if (cleanLine.startsWith('M140') || cleanLine.startsWith('M190')) {
      const match = cleanLine.match(/S(\d+)/);
      if (match) bedTemp = `${match[1]} °C`;
    }

    // Wykrywanie zmian narzędzia (T0, T1, etc.)
    if (/^T\d+/.test(cleanLine)) {
      toolChanges++;
    }

    // Wykrywanie współrzędnych G0 / G1
    if (cleanLine.startsWith('G0') || cleanLine.startsWith('G1')) {
      const xMatch = cleanLine.match(/X(-?\d+\.?\d*)/);
      const yMatch = cleanLine.match(/Y(-?\d+\.?\d*)/);
      const zMatch = cleanLine.match(/Z(-?\d+\.?\d*)/);

      if (xMatch) {
        const x = parseFloat(xMatch[1]);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
      if (yMatch) {
        const y = parseFloat(yMatch[1]);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
      if (zMatch) {
        const z = parseFloat(zMatch[1]);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
        if (lastZ !== z) {
          layerCount++;
          lastZ = z;
        }
      }
    }
  }

  const formatCoord = (val) => (val === Infinity || val === -Infinity ? 'Brak' : val.toFixed(2));

  console.log('\n========================================');
  console.log('      📊 G-CODE ANALYZER REPORT         ');
  console.log('========================================');
  console.log(` Plik:             ${path.basename(file)}`);
  console.log(` Liczba linii:     ${lineCount.toLocaleString()}`);
  console.log(` Temperatura Dysz: ${nozzleTemp}`);
  console.log(` Temperatura Stolu: ${bedTemp}`);
  console.log(` Wykryte warstwy:  ${layerCount}`);
  console.log(` Zmiany narzędzi:  ${toolChanges}`);
  console.log('----------------------------------------');
  console.log(' Wymiary robocze (Bounding Box):');
  console.log(`   X: od ${formatCoord(minX)} do ${formatCoord(maxX)} mm (Szerokość: ${formatCoord(maxX - minX)} mm)`);
  console.log(`   Y: od ${formatCoord(minY)} do ${formatCoord(maxY)} mm (Głębokość: ${formatCoord(maxY - minY)} mm)`);
  console.log(`   Z: od ${formatCoord(minZ)} do ${formatCoord(maxZ)} mm (Wysokość:  ${formatCoord(maxZ - minZ)} mm)`);
  console.log('========================================\n');
}

analyzeGCode(absolutePath).catch(err => console.error('Błąd analizy:', err));
