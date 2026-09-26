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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/interests" element={<InterestsPage />} />
          <Route path="/question" element={<Navigate to="/interests" replace />} />
          <Route path="/events/new" element={<CreateEventPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/me" element={<MyEventsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
