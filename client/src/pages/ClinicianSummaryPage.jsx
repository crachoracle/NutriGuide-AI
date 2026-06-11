import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { getClinicianSummary } from "../api/apiClient.js";
import ClinicianSummary from "../components/ClinicianSummary.jsx";
import DisclaimerBanner from "../components/DisclaimerBanner.jsx";

export default function ClinicianSummaryPage({ onOpenJournal, onStartNew }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getClinicianSummary()
      .then((data) => setSummary(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Clinician view</span>
          <h1>Trends and recurring risks</h1>
          <p>Directional meal-choice summary for dietitians, clinicians, caregivers, or user review.</p>
        </div>
        <div className="heading-actions">
          <button className="secondary-action" type="button" onClick={onOpenJournal}>
            <ArrowLeft size={17} aria-hidden="true" />
            Journal
          </button>
          <button className="primary-compact" type="button" onClick={onStartNew}>
            <Plus size={17} aria-hidden="true" />
            Analyze menu
          </button>
        </div>
      </section>

      <DisclaimerBanner showRestriction />
      {error ? <div className="status-banner error">{error}</div> : null}
      {loading ? <div className="empty-state large">Building summary...</div> : <ClinicianSummary summary={summary} />}
    </div>
  );
}
