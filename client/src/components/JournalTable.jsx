export default function JournalTable({ entries }) {
  if (!entries.length) {
    return (
      <div className="empty-state large">
        Saved meals will appear here with score, category, profile, allergy flags, and notes.
      </div>
    );
  }

  return (
    <div className="journal-table-wrap">
      <table className="journal-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Restaurant</th>
            <th>Dish</th>
            <th>Profile</th>
            <th>Allergies</th>
            <th>Score</th>
            <th>Category</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{new Date(entry.savedAt).toLocaleDateString()}</td>
              <td>{entry.restaurantName}</td>
              <td>{entry.dishName}</td>
              <td>{entry.dietaryProfileLabel}</td>
              <td>{entry.allergyLabels?.join(", ") || "None"}</td>
              <td>{entry.score}</td>
              <td>{entry.category}</td>
              <td>{entry.notes || "No notes"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
