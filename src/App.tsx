import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import { LandingPage } from './pages/LandingPage';
import { RoleSelection } from './pages/RoleSelection';
import { AppShell } from './layouts/AppShell';
import { RoleDashboardProxy } from './pages/RoleDashboardProxy';
import { Copilot } from './pages/Copilot';

function App() {
  return (
    <RoleProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/roles" element={<RoleSelection />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<RoleDashboardProxy />} />
            <Route path="/copilot" element={<Copilot />} />
            {/* Catch-all for undefined dashboard routes currently */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </RoleProvider>
  );
}

export default App;
