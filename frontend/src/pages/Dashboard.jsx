import { useCallback, useEffect, useRef, useState } from 'react';
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
          <h1 className="logo">Cargo Manifest</h1>
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
        {isAdmin && (
          <section className="upload-panel">
            <h2>Manifest Upload</h2>
            <p>Admin clearance required · Sector-7 weight multiplier applied server-side</p>
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
              {isAdmin ? 'Weights in Kilograms (KG)' : 'Weights in Pounds (LBS)'}
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
