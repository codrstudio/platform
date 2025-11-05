// Root application component
// Based on SPEC-routing.md routing architecture

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PortalLoader from './core/routing/PortalLoader';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main portal - root path */}
        <Route path="/" element={<PortalLoader portalId="main" />} />

        {/* All other portals - dynamic path */}
        <Route path="/:portalId/*" element={<PortalLoader />} />
      </Routes>
    </BrowserRouter>
  );
}
