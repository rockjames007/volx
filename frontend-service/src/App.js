import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import MainPage from './components/MainPage';
import QuestionPage from './components/QuestionPage';
import CreateEventsPage from './components/CreateEventsPage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/question" element={<QuestionPage />} />
        <Route path="/events" element={<CreateEventsPage />} />
      </Routes>
    </Router>
  );
}

export default App;