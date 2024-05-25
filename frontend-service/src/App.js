import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import MainPage from './components/MainPage';
import QuestionPage from './components/QuestionPage';
import CreateEventsPage from './components/CreateEventsPage';
import ProfilePage from './components/ProfilePage';
import EnterVolunteersPage from './components/EnterVolunteersPage';
import TopNav from './TopNav';
function App() {
  return (
    <>
      <TopNav />
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/question" element={<QuestionPage />} />
          <Route path="/events" element={<CreateEventsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/enterVolunteersPage" element={<EnterVolunteersPage/>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;