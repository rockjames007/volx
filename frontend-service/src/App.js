import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import MainPage from './components/MainPage';
import QuestionPage from './components/QuestionPage';
import CreateEventsPage from './components/CreateEventsPage';
import ProfilePage from './components/ProfilePage';
import EventPage from './components/EventPage';
import EnterVolunteersPage from './components/EnterVolunteersPage';
import TopNav from './TopNav';
function App() {
  return (
    <>
      <TopNav />
      <div className="bg-blue-500 min-h-screen flex flex-col">
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/question" element={<QuestionPage />} />
            <Route path="/events" element={<CreateEventsPage />} />
            <Route path="/event" element={<EventPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/enterVolunteersPage" element={<EnterVolunteersPage />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;