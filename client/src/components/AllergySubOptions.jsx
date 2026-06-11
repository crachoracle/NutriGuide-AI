export default function AllergySubOptions({ options, selected, onChange }) {
  function toggle(optionId) {
    if (selected.includes(optionId)) {
      onChange(selected.filter((id) => id !== optionId));
      return;
    }
    onChange([...selected, optionId]);
  }

  return (
    <div className="allergy-panel">
      <div>
        <h3>Allergy flags</h3>
        <p>Select any allergen the menu should treat as high risk.</p>
      </div>
      <div className="check-grid">
        {options.map((option) => (
          <label key={option.id} className="check-tile">
            <input
              checked={selected.includes(option.id)}
              type="checkbox"
              onChange={() => toggle(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
