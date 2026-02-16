import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { GamesDashboard } from './components/GamesDashboard';

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <GamesDashboard onBack={() => setShowDashboard(false)} />;
  }

  return <LandingPage onEnter={() => setShowDashboard(true)} />;
}
