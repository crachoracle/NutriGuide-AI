export default function ClinicianSummary({ summary }) {
  if (!summary || summary.totalMeals === 0) {
    return (
      <div className="empty-state large">
        No clinician summary is available yet. Save one or more dishes from the recommendation screen.
      </div>
    );
  }

  const metricCards = [
    { label: "Saved meals", value: summary.totalMeals },
    { label: "Average score", value: summary.averageScore },
    { label: "Most common profile", value: summary.mostCommonProfile?.label || "Not enough data" },
    {
      label: "Top category",
      value: summary.categoryBreakdown?.[0]?.label || "Not enough data"
    }
  ];

  return (
    <div className="summary-grid">
      {metricCards.map((metric) => (
        <div className="metric-card" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </div>
      ))}

      <section className="summary-panel wide">
        <h2>Plain-English summary</h2>
        <p>{summary.plainEnglishSummary}</p>
      </section>

      <SummaryList title="Common concerns" items={summary.commonConcerns} />
      <SummaryList title="Risk categories" items={summary.commonRiskCategories} />
      <SummaryList title="Allergy or restriction flags" items={summary.mostCommonAllergyOrRestrictionFlags} />

      <section className="summary-panel wide">
        <h2>Recent saved meals</h2>
        <div className="recent-meals">
          {summary.recentMeals.map((meal) => (
            <div key={meal.id}>
              <strong>{meal.dishName}</strong>
              <span>
                {meal.category} - {meal.score}
              </span>
              <p>{meal.notes || meal.suggestedModification}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryList({ title, items = [] }) {
  return (
    <section className="summary-panel">
      <h2>{title}</h2>
      {items.length ? (
        <ul className="ranked-list">
          {items.map((item) => (
            <li key={item.label}>
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No repeated pattern yet.</p>
      )}
    </section>
  );
}
