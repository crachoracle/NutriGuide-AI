import RecommendationCard from "./RecommendationCard.jsx";

export default function RecommendationSection({
  allergyLabels,
  allergyOptions,
  items,
  menuName,
  onSaved,
  profile,
  restaurantName,
  title
}) {
  return (
    <section className="recommendation-section">
      <div className="section-title-row">
        <h2>{title}</h2>
        <span>{items.length} item{items.length === 1 ? "" : "s"}</span>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">No dishes landed in this category for the selected profile.</div>
      ) : (
        <div className="recommendation-list">
          {items.map((item) => (
            <RecommendationCard
              allergyOptions={allergyOptions}
              allergyLabels={allergyLabels}
              item={item}
              key={item.id}
              menuName={menuName}
              profile={profile}
              restaurantName={restaurantName}
              onSaved={onSaved}
            />
          ))}
        </div>
      )}
    </section>
  );
}
