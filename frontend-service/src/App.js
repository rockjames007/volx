import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import MainPage from './components/MainPage';
import InterestsPage from './components/InterestsPage';
import CreateEventPage from './components/CreateEventPage';
import EventDetailPage from './components/EventDetailPage';
import MyEventsPage from './components/MyEventsPage';
import AttendancePage from './components/AttendancePage';
import InviteVolunteersPage from './components/InviteVolunteersPage';
import CheckInPage from './components/CheckInPage';
import MyHoursPage from './components/MyHoursPage';
import CertificatePage from './components/CertificatePage';

function App() {
  return (
    <AuthProvider>
      {/* PUBLIC_URL is the sub-path the site is served from, e.g. /jointeer on GitHub Pages; empty locally. */}
      <Router basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/interests" element={<InterestsPage />} />
          <Route path="/question" element={<Navigate to="/interests" replace />} />
          <Route path="/events/new" element={<CreateEventPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/:id/edit" element={<CreateEventPage />} />
          <Route path="/events/:id/attendance" element={<AttendancePage />} />
          <Route path="/events/:id/invite" element={<InviteVolunteersPage />} />
          <Route path="/check-in/:id" element={<CheckInPage />} />
          <Route path="/me" element={<MyEventsPage />} />
          <Route path="/me/hours" element={<MyHoursPage />} />
          <Route path="/certificate/:code" element={<CertificatePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
