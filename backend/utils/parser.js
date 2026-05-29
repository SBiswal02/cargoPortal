// Task 2: manifest parsing — Sector-7 multiplier, round, skip prime weights

function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

const LINE_RE = /^\[([^\]]+)\]\s*\|\|\s*(CRG-\d+)\s*::\s*(\d+)\s*>>\s*(.+)$/;

function parseManifestLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const match = trimmed.match(LINE_RE);
  if (!match) return null;

  const [, manifestDate, cargoCode, rawWeight, destination] = match;
  let weight = parseInt(rawWeight, 10);

  if (destination.includes("Sector-7")) {
    weight *= 1.45;
  }

  weight = Math.round(weight);

  if (isPrime(weight)) {
    return { skip: true, reason: "prime_weight", cargoCode, weight, destination };
  }

  return {
    skip: false,
    manifestDate,
    cargoCode,
    weightKg: weight,
    destination: destination.trim(),
  };
}

function parseManifest(content) {
  const lines = content.split(/\r?\n/);
  const saved = [];
  const skipped = [];

  for (const line of lines) {
    const parsed = parseManifestLine(line);
    if (!parsed) continue;
    if (parsed.skip) {
      skipped.push(parsed);
    } else {
      saved.push(parsed);
    }
  }

  return { saved, skipped };
}

module.exports = { parseManifest };
