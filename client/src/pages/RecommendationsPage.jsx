import { ArrowLeft, BookOpen } from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner.jsx";
import RecommendationSection from "../components/RecommendationSection.jsx";

export default function RecommendationsPage({
  analysis,
  profileData,
  onBack,
  onSaved,
  onViewJournal
}) {
  if (!analysis.results) {
    return (
      <div className="empty-state large">
        Run a menu analysis first to see ranked recommendations.
      </div>
    );
  }

  const allergyLabels = analysis.allergyOptions.map((id) => {
    const match = profileData.allergySubOptions.find((option) => option.id === id);
    return match?.label || id;
  });
  const showRestriction = ["allergy-aware", "dairy-free", "halal", "kosher", "gluten-free"].includes(
    analysis.profile?.id
  );

  return (
    <div className="page-stack">
      <section className="results-header">
        <button className="secondary-action" type="button" onClick={onBack}>
          <ArrowLeft size={17} aria-hidden="true" />
          New analysis
        </button>
        <div>
          <span className="eyebrow">Recommendation results</span>
          <h1>{analysis.restaurantName || "Analyzed Menu"}</h1>
          <p>
            {analysis.menuName || "Menu"} analyzed for {analysis.profile?.label || "selected profile"}
            {allergyLabels.length ? ` with ${allergyLabels.join(", ")} allergy flags` : ""}.
          </p>
        </div>
        <button className="secondary-action" type="button" onClick={onViewJournal}>
          <BookOpen size={17} aria-hidden="true" />
          View journal
        </button>
      </section>

      <DisclaimerBanner showRestriction={showRestriction || allergyLabels.length > 0} />

      {analysis.note ? <div className="status-banner info">{analysis.note}</div> : null}

      <RecommendationSection
        allergyOptions={analysis.allergyOptions}
        items={analysis.results.recommendations.bestChoices}
        menuName={analysis.menuName}
        profile={analysis.profile}
        restaurantName={analysis.restaurantName}
        title="Best Choices"
        onSaved={onSaved}
      />
      <RecommendationSection
        allergyOptions={analysis.allergyOptions}
        items={analysis.results.recommendations.useCaution}
        menuName={analysis.menuName}
        profile={analysis.profile}
        restaurantName={analysis.restaurantName}
        title="Use Caution"
        onSaved={onSaved}
      />
      <RecommendationSection
        allergyOptions={analysis.allergyOptions}
        items={analysis.results.recommendations.avoid}
        menuName={analysis.menuName}
        profile={analysis.profile}
        restaurantName={analysis.restaurantName}
        title="Avoid"
        onSaved={onSaved}
      />
    </div>
  );
}
