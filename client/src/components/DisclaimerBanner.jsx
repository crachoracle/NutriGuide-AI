import { ShieldAlert } from "lucide-react";

const medicalDisclaimer =
  "NutriGuide AI provides dietary guidance only and is not medical advice. Users should consult a qualified medical professional for clinical decisions.";

const restrictionDisclaimer =
  "Menu ingredients and preparation methods may vary. Users with allergies or strict dietary restrictions should confirm ingredients and cross-contact risks directly with the restaurant.";

export default function DisclaimerBanner({ showRestriction = false }) {
  return (
    <section className="disclaimer">
      <ShieldAlert size={19} aria-hidden="true" />
      <div>
        <p>{medicalDisclaimer}</p>
        {showRestriction ? <p>{restrictionDisclaimer}</p> : null}
      </div>
    </section>
  );
}
