import React from 'react';
import './QuestionPage.css';

function QuestionPage() {
  const questions = [
    "What motivated you to join our community?",
    "How do you prefer to contribute to volunteer activities?",
    "What skills or talents do you bring to the table?"
  ];

  return (
    <div className="main-container">
      <h1>Welcome to the Questions Page</h1>
      <h2>Questionnaire</h2>
      <form>
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