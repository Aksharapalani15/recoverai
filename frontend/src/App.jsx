import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import AiInsights from "./pages/AiInsights";
import Settings from "./pages/Settings";
import { getHealth } from "./api/client";

const PAGE_META = {
  "/": {
    title: "Payment Recovery Intelligence",
    subtitle: "RecoverAI predicts and prioritizes failed payments for recovery.",
  },
  "/transactions": {
    title: "Transactions",
    subtitle: "Every failed payment, scored and ranked by recovery potential.",
  },
  "/analytics": {
    title: "Recovery Analytics",
    subtitle: "How recovery performance breaks down across your payment mix.",
  },
  "/insights": {
    title: "AI Insights",
    subtitle: "Gemini-generated recovery reasoning for your top-priority transactions.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "System status and API key configuration.",
  },
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOnline, setAiOnline] = useState(false);
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || PAGE_META["/"];

  useEffect(() => {
    getHealth()
      .then((h) => setAiOnline(h.status === "ok"))
      .catch(() => setAiOnline(false));
  }, []);

  return (
    <div className="flex h-screen bg-app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          aiOnline={aiOnline}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-5 sm:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/insights" element={<AiInsights />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
