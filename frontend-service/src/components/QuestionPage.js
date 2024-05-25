import React, { useState } from 'react';
import './QuestionPage.css';

const QuestionsPage = () => {
  const [interestLevels, setInterestLevels] = useState({
    environment: 0,
    health: 0,
    mentalHealth: 0,
    animalWelfare: 0,
    education: 0,
    socialServices: 0,
  });

  const handleInterestChange = (category, value) => {
    setInterestLevels(prevState => ({
      ...prevState,
      [category]: value,
    }));
  };

  const [wantToVolunteer, setWantToVolunteer] = useState(true);

  const handleVolunteerChange = (e) => {
    setWantToVolunteer(e.target.checked);
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mt-8 mb-4">Interest Level</h1>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center">
          <label htmlFor="environment" className="mr-4">What is your interest Level for Environment & Sustainability?</label>
          {[1, 2, 3, 4, 5].map(level => (
            <label key={level} className="checkbox-label">
              <input
                type="checkbox"
                id={`environment${level}`}
                name="environment"
                value={level}
                checked={interestLevels.environment === level}
                onChange={() => handleInterestChange('environment', level)}
              />
              {level}
            </label>
          ))}
        </div>
        <div className="flex items-center">
          <label htmlFor="health" className="mr-4">What is your interest Level for Health & Wellness?</label>
          {[1, 2, 3, 4, 5].map(level => (
            <label key={level} className="checkbox-label">
              <input
                key={level}
                type="checkbox"
                id={`health${level}`}
                name="health"
                value={level}
                checked={interestLevels.health === level}
                onChange={() => handleInterestChange('health', level)}
              />
              {level}
            </label>
          ))}
        </div>
        <div className="flex items-center">
          <label htmlFor="mentalHealth" className="mr-4">What is your interest Level for Mental Health Support?</label>
          {[1, 2, 3, 4, 5].map(level => (
            <label key={level} className="checkbox-label">
              <input
                key={level}
                type="checkbox"
                id={`mentalHealth${level}`}
                name="mentalHealth"
                value={level}
                checked={interestLevels.mentalHealth === level}
                onChange={() => handleInterestChange('mentalHealth', level)}
              />
              {level}
            </label>
          ))}
        </div>
        <div className="flex items-center">
          <label htmlFor="animal" className="mr-4">What is your interest Level for Animal Welfare?</label>
          {[1, 2, 3, 4, 5].map(level => (
            <label key={level} className="checkbox-label">
              <input
                key={level}
                type="checkbox"
                id={`animal${level}`}
                name="animal"
                value={level}
                checked={interestLevels.animal === level}
                onChange={() => handleInterestChange('animal', level)}
              />
              {level}
            </label>
          ))}
        </div>
        <div className="flex items-center">
          <label htmlFor="education" className="mr-4">What is your interest Level for Education & Literacy?</label>
          {[1, 2, 3, 4, 5].map(level => (
            <label key={level} className="checkbox-label">
              <input
                key={level}
                type="checkbox"
                id={`education${level}`}
                name="education"
                value={level}
                checked={interestLevels.education === level}
                onChange={() => handleInterestChange('education', level)}
              />
              {level}
            </label>
          ))}
        </div>
        <div className="flex items-center">
          <label htmlFor="socialService" className="mr-4">What is your interest Level for Social Services & Community Support?</label>
          {[1, 2, 3, 4, 5].map(level => (
            <label key={level} className="checkbox-label">
              <input
                key={level}
                type="checkbox"
                id={`socialService${level}`}
                name="socialService"
                value={level}
                checked={interestLevels.socialService === level}
                onChange={() => handleInterestChange('socialServiceh', level)}
              />
              {level}
            </label>
          ))}
        </div>
        <div className="flex items-center">
          <label htmlFor="health" className="mr-4">What is your interest Level for Arts & Culture?</label>
          {[1, 2, 3, 4, 5].map(level => (
            <label key={level} className="checkbox-label">
            <input
              key={level}
              type="checkbox"
              id={`arts${level}`}
              name="arts"
              value={level}
              checked={interestLevels.arts === level}
              onChange={() => handleInterestChange('arts', level)}
            />
            {level}
            </label>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <label htmlFor="volunteer" className="mr-4">Do you want to also be a volunteer? (Organizers will send invitation based on Interest Level)</label>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="volunteer"
            name="volunteer"
            checked={wantToVolunteer}
            onChange={handleVolunteerChange}
          />
          <label htmlFor="volunteer" className="ml-2">Yes</label>
          <input
            type="checkbox"
            id="noVolunteer"
            name="noVolunteer"
            checked={!wantToVolunteer}
            onChange={() => setWantToVolunteer(false)}
          />
          <label htmlFor="noVolunteer" className="ml-2">No</label>
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;