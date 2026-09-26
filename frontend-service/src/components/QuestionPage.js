import React from 'react';
import { useNavigate } from 'react-router-dom';
import './QuestionPage.css';

function QuestionPage() {
  const navigate = useNavigate();
  const questions = [
    "What motivated you to join our community?",
    "How do you prefer to contribute to volunteer activities?",
    "What skills or talents do you bring to the table?"
  ];

  return (
    <div className="question-container">
      <h1>Welcome to the Questions Page</h1>
      <h2>Questionnaire</h2>
      <form onSubmit={(e) => { e.preventDefault(); navigate('/'); }}>
        {questions.map((question, index) => (
          <div key={index}>
            <label>{question}</label>
            <input type="text" name={`question${index + 1}`} required />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default QuestionPage;