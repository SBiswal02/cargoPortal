import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchCargo, uploadManifest } from '../api';
import { useAuth } from '../context/AuthContext';
import CargoTable from '../components/CargoTable';
import './Dashboard.css';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [cargo, setCargo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const isAdmin = user?.role === 'Admin';
  const totalWeightKg = useMemo(
    () => cargo.reduce((sum, row) => sum + Number(row.weight_kg || 0), 0),
    [cargo]
  );
  const earthPinned = useMemo(
    () => cargo.filter((row) => row.destination === 'Earth').length,
    [cargo]
  );

  const loadCargo = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const rows = await fetchCargo(token);
      setCargo(rows);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCargo();
  }, [loadCargo]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMsg('');
    setUploading(true);
    try {
      const result = await uploadManifest(token, file);
      setUploadMsg(
        `Manifest processed: ${result.imported} saved, ${result.skipped} skipped (prime weight rule).`
      );
      await loadCargo();
    } catch (err) {
      setUploadMsg(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div>
          <p className="dash-eyebrow">Mission Control</p>
          <h1 className="logo">{isAdmin ? 'Admin Cargo Command' : 'Cargo Registry'}</h1>
        </div>
        <div className="dash-user">
          <span className={`role-badge role-${user.role}`}>{user.role}</span>
          <span className="user-email">{user.email}</span>
          <button type="button" className="btn-ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dash-main">
        <section className="mission-strip" aria-label="Cargo summary">
          <div>
            <span className="metric-label">Shipments</span>
            <strong>{cargo.length.toLocaleString()}</strong>
          </div>
          <div>
            <span className="metric-label">{isAdmin ? 'Total KG' : 'Total LBS'}</span>
            <strong>
              {isAdmin
                ? totalWeightKg.toLocaleString()
                : Math.round(totalWeightKg * 2.20462).toLocaleString()}
            </strong>
          </div>
          <div>
            <span className="metric-label">Earth Pinned</span>
            <strong>{earthPinned.toLocaleString()}</strong>
          </div>
        </section>

        {isAdmin && (
          <section className="upload-panel">
            <h2>Manifest Upload</h2>
            <p>Admin clearance required. Upload a plain-text manifest for processing.</p>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,text/plain"
              className="file-input-hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <button
              type="button"
              className="btn-upload"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? 'Processing…' : 'File Upload'}
            </button>
            {uploadMsg && <p className="upload-msg">{uploadMsg}</p>}
          </section>
        )}

        <section className="table-panel">
          <div className="table-panel-head">
            <h2>Active Shipments</h2>
            <span className="unit-hint">
              {isAdmin
                ? 'Sorted by KG, heaviest first'
                : 'Converted to LBS and sorted by source KG'}
            </span>
          </div>

          {error && <p className="dash-error">{error}</p>}
          {loading ? (
            <p className="loading-rows">Loading cargo registry…</p>
          ) : (
            <CargoTable cargo={cargo} role={user.role} />
          )}
        </section>
      </main>
    </div>
  );
}
