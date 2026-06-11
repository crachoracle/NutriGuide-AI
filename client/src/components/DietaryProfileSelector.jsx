import AllergySubOptions from "./AllergySubOptions.jsx";

export default function DietaryProfileSelector({
  allergyOptions,
  profileGroups,
  selectedAllergies,
  selectedProfile,
  onAllergyChange,
  onProfileChange
}) {
  return (
    <section className="panel profile-panel">
      <div className="section-heading">
        <span className="eyebrow">Dietary profile</span>
        <h2>Choose the lens for recommendations</h2>
      </div>

      <div className="profile-groups">
        {profileGroups.map((group) => (
          <div className="profile-group" key={group.id}>
            <div className="group-heading">
              <h3>{group.label}</h3>
              <p>{group.description}</p>
            </div>
            <div className="profile-options">
              {group.options.map((option) => (
                <label
                  className={`profile-option ${selectedProfile === option.id ? "selected" : ""}`}
                  key={option.id}
                >
                  <input
                    checked={selectedProfile === option.id}
                    name="dietary-profile"
                    type="radio"
                    value={option.id}
                    onChange={() => onProfileChange(option.id)}
                  />
                  <span>{option.label}</span>
                  <small>{option.description}</small>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedProfile === "allergy-aware" ? (
        <AllergySubOptions
          options={allergyOptions}
          selected={selectedAllergies}
          onChange={onAllergyChange}
        />
      ) : null}
    </section>
  );
}
