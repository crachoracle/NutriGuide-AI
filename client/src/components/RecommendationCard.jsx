import { Save } from "lucide-react";
import { useState } from "react";
import { saveJournalEntry } from "../api/apiClient.js";

export default function RecommendationCard({
  allergyLabels,
  allergyOptions,
  item,
  menuName,
  profile,
  restaurantName,
  onSaved
}) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveDish() {
    setSaving(true);
    try {
      const entry = await saveJournalEntry({
        restaurantName,
        menuName,
        dishName: item.dishName,
        dietaryProfile: profile.id,
        dietaryProfileLabel: profile.label,
        allergyOptions,
        allergyLabels,
        score: item.score,
        category: item.category,
        reasoning: item.reasoning,
        concerns: item.concerns,
        assumptions: item.assumptions,
        suggestedModification: item.suggestedModification,
        riskTags: item.riskTags,
        notes
      });
      setSaved(true);
      onSaved(entry);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="recommendation-card">
      <div className="card-topline">
        <div>
          <h3>{item.dishName}</h3>
          <p>{item.description}</p>
        </div>
        <div className={`score-badge ${item.category.replace(/\s+/g, "-").toLowerCase()}`}>
          <strong>{item.score}</strong>
          <span>{item.category}</span>
        </div>
      </div>

      <div className="rec-grid">
        <div>
          <span className="label">Why it fits</span>
          <p>{item.reasoning}</p>
        </div>
        <div>
          <span className="label">Suggested modification</span>
          <p>{item.suggestedModification}</p>
        </div>
        <div>
          <span className="label">Possible concerns</span>
          <ul>
            {item.concerns.map((concern) => (
              <li key={concern}>{concern}</li>
            ))}
          </ul>
        </div>
        <div>
          <span className="label">Assumptions</span>
          <ul>
            {item.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="save-row">
        <input
          aria-label={`Notes for ${item.dishName}`}
          placeholder="Add a short note before saving"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <button disabled={saving || saved} type="button" onClick={saveDish}>
          <Save size={17} aria-hidden="true" />
          {saved ? "Saved" : saving ? "Saving..." : "Save Dish"}
        </button>
      </div>
    </article>
  );
}
