import { BookOpen, ClipboardList, Home, Stethoscope } from "lucide-react";

export default function Header({ activePage, hasResults, onNavigate }) {
  const items = [
    { id: "home", label: "Analyze", icon: Home },
    { id: "recommendations", label: "Results", icon: ClipboardList, disabled: !hasResults },
    { id: "journal", label: "Journal", icon: BookOpen },
    { id: "summary", label: "Clinician", icon: Stethoscope }
  ];

  return (
    <header className="site-header">
      <button className="brand-button" type="button" onClick={() => onNavigate("home")}>
        <img className="brand-logo" src="/nutriguide-logo.png" alt="" aria-hidden="true" />
        <span>
          <strong>NutriGuide AI</strong>
          <small>Menu guidance for real-world meals</small>
        </span>
      </button>

      <nav className="nav-tabs" aria-label="Primary navigation">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={activePage === item.id ? "active" : ""}
              disabled={item.disabled}
              type="button"
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
