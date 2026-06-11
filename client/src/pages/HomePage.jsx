import DisclaimerBanner from "../components/DisclaimerBanner.jsx";
import DietaryProfileSelector from "../components/DietaryProfileSelector.jsx";
import MenuUpload from "../components/MenuUpload.jsx";

export default function HomePage({
  allergyOptions,
  loading,
  profileGroups,
  selectedAllergies,
  selectedProfile,
  onAllergyChange,
  onAnalyze,
  onProfileChange
}) {
  const restrictionSelected = ["allergy-aware", "dairy-free", "halal", "kosher", "gluten-free"].includes(
    selectedProfile
  );

  return (
    <div className="page-stack">
      <section className="intro-band">
        <div>
          <span className="eyebrow">AI-powered menu guidance</span>
          <h1>Scan a restaurant menu and find the best choices for your diet, health needs, allergies, and preferences.</h1>
          <p>
            A hackathon MVP that turns unstructured menu text into ranked, explainable choices and a longitudinal food journal.
          </p>
        </div>
        <div className="workflow-visual" aria-hidden="true">
          <div className="visual-menu">
            <span>Before</span>
            <p>Caesar salad, buffalo sandwich, pasta alfredo, shrimp stir fry...</p>
          </div>
          <div className="visual-results">
            <span>After</span>
            <strong>Best Choices</strong>
            <p>Reasoning, risk flags, modifications, and saved insight.</p>
          </div>
        </div>
      </section>

      <DisclaimerBanner showRestriction={restrictionSelected} />

      <div className="home-grid">
        <MenuUpload loading={loading} onAnalyze={onAnalyze} />
        <DietaryProfileSelector
          allergyOptions={allergyOptions}
          profileGroups={profileGroups}
          selectedAllergies={selectedAllergies}
          selectedProfile={selectedProfile}
          onAllergyChange={onAllergyChange}
          onProfileChange={onProfileChange}
        />
      </div>
    </div>
  );
}
