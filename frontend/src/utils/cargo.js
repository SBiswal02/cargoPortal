const LBS_PER_KG = 2.20462;

export function sortCargo(rows) {
  const earth = [];
  const rest = [];

  for (const row of rows) {
    if (row.destination === 'Earth') {
      earth.push(row);
    } else {
      rest.push(row);
    }
  }

  rest.sort((a, b) => b.weight_kg - a.weight_kg);
  earth.sort((a, b) => b.weight_kg - a.weight_kg);

  return [...rest, ...earth];
}

export function formatWeight(weightKg, role) {
  if (role === 'Admin') {
    return `${weightKg.toLocaleString()} KG`;
  }
  const lbs = Math.round(weightKg * LBS_PER_KG);
  return `${lbs.toLocaleString()} LBS`;
}
