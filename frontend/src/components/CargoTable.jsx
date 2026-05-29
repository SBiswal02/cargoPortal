import { formatWeight, sortCargo } from '../utils/cargo';
import './CargoTable.css';

export default function CargoTable({ cargo, role }) {
  const sorted = sortCargo(cargo);

  if (sorted.length === 0) {
    return (
      <p className="empty-table">
        {role === 'Admin'
          ? 'No cargo records yet. Upload a manifest to populate the registry.'
          : 'No cargo records are available yet.'}
      </p>
    );
  }

  return (
    <div className="table-wrap">
      <table className="cargo-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Manifest Date</th>
            <th>Destination</th>
            <th>Weight</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={row.id}
              className={row.destination === 'Earth' ? 'row-earth' : ''}
            >
              <td className="mono">{row.cargo_code}</td>
              <td>{row.manifest_date}</td>
              <td>{row.destination}</td>
              <td className="weight-cell">{formatWeight(row.weight_kg, role)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
