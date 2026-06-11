import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import HomePage from "./pages/HomePage.jsx";
import RecommendationsPage from "./pages/RecommendationsPage.jsx";
import JournalPage from "./pages/JournalPage.jsx";
import ClinicianSummaryPage from "./pages/ClinicianSummaryPage.jsx";
import { getDietaryProfiles, getRecommendations, runOcr } from "./api/apiClient.js";

const defaultAnalysis = {
  menuText: "",
  restaurantName: "",
  menuName: "",
  profile: null,
  allergyOptions: [],
  results: null
};

export default function App() {
  const [page, setPage] = useState("home");
  const [profileData, setProfileData] = useState({ groups: [], allergySubOptions: [] });
  const [selectedProfile, setSelectedProfile] = useState("omnivore");
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [analysis, setAnalysis] = useState(defaultAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");

  useEffect(() => {
    getDietaryProfiles()
      .then((data) => setProfileData(data))
      .catch((err) => setError(err.message));
  }, []);

  useLayoutEffect(() => {
    const resetScroll = () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();
    if (window.location.hash !== `#${page}`) {
      window.location.hash = page;
    } else {
      document.getElementById(page)?.scrollIntoView({ block: "start" });
    }
    const frameId = window.requestAnimationFrame(resetScroll);
    const timeoutIds = [0, 80, 180, 500, 1000].map((delay) =>
      window.setTimeout(resetScroll, delay)
    );

    return () => {
      window.cancelAnimationFrame(frameId);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [page]);

  const selectedProfileDetails = useMemo(() => {
    for (const group of profileData.groups) {
      const match = group.options.find((option) => option.id === selectedProfile);
      if (match) return { ...match, groupLabel: group.label };
    }
    return null;
  }, [profileData.groups, selectedProfile]);

  async function handleAnalyze({ useSampleMenu, uploadedText, fileName, uploadedFile }) {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setLoading(true);
    setError("");
    setSaveNotice("");

    try {
      const ocr = await runOcr({
        useSampleMenu,
        uploadedText,
        fileName,
        uploadedFile
      });

      const results = await getRecommendations({
        menuText: ocr.extractedText,
        dietaryProfile: selectedProfile,
        allergyOptions: selectedProfile === "allergy-aware" ? selectedAllergies : []
      });

      setAnalysis({
        menuText: ocr.extractedText,
        restaurantName: ocr.restaurantName,
        menuName: ocr.menuName,
        note: ocr.note,
        profile: selectedProfileDetails || results.profile,
        allergyOptions: selectedProfile === "allergy-aware" ? selectedAllergies : [],
        results
      });
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setPage("recommendations");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function navigate(nextPage) {
    setError("");
    setSaveNotice("");
    setPage(nextPage);
  }

  return (
    <div className="app-shell">
      <Header activePage={page} onNavigate={navigate} hasResults={Boolean(analysis.results)} />

      <main>
        <span aria-hidden="true" className="page-anchor" id={page} />
        {error ? <div className="status-banner error">{error}</div> : null}
        {saveNotice ? <div className="status-banner success">{saveNotice}</div> : null}

        {page === "home" ? (
          <HomePage
            allergyOptions={profileData.allergySubOptions}
            loading={loading}
            profileGroups={profileData.groups}
            selectedAllergies={selectedAllergies}
            selectedProfile={selectedProfile}
            onAllergyChange={setSelectedAllergies}
            onAnalyze={handleAnalyze}
            onProfileChange={(profileId) => {
              setSelectedProfile(profileId);
              if (profileId !== "allergy-aware") setSelectedAllergies([]);
            }}
          />
        ) : null}

        {page === "recommendations" ? (
          <RecommendationsPage
            analysis={analysis}
            profileData={profileData}
            onBack={() => navigate("home")}
            onSaved={(entry) => {
              setSaveNotice(`${entry.dishName} was saved to the food journal.`);
            }}
            onViewJournal={() => navigate("journal")}
          />
        ) : null}

        {page === "journal" ? (
          <JournalPage
            onOpenSummary={() => navigate("summary")}
            onStartNew={() => navigate("home")}
          />
        ) : null}

        {page === "summary" ? (
          <ClinicianSummaryPage
            onOpenJournal={() => navigate("journal")}
            onStartNew={() => navigate("home")}
          />
        ) : null}
      </main>
    </div>
  );
}
