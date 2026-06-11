import { BarChart3, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { getJournal } from "../api/apiClient.js";
import JournalTable from "../components/JournalTable.jsx";

export default function JournalPage({ onOpenSummary, onStartNew }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getJournal()
      .then((data) => setEntries(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Food journal</span>
          <h1>Saved meal decisions</h1>
          <p>Review longitudinal choices with profile, allergy flags, score, category, and notes.</p>
        </div>
        <div className="heading-actions">
          <button className="secondary-action" type="button" onClick={onStartNew}>
            <Plus size={17} aria-hidden="true" />
            Analyze menu
          </button>
          <button className="primary-compact" type="button" onClick={onOpenSummary}>
            <BarChart3 size={17} aria-hidden="true" />
            Clinician summary
          </button>
        </div>
      </section>

      {error ? <div className="status-banner error">{error}</div> : null}
      {loading ? <div className="empty-state large">Loading saved meals...</div> : <JournalTable entries={entries} />}
    </div>
  );
}
