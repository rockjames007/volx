import './QuestionPage.css';
import { useRecoilState } from 'recoil';
import { interestLevel } from '../state/recoilstate';

const QuestionsPage = () => {
  const [interestLevels, setInterestLevels] = useRecoilState(interestLevel);

  const handleInterestChange = (category, value) => {
    setInterestLevels(prevState => ({
      ...prevState,
      [category]: value,
    }));
  };

  return (
    
    <div className="bg-blue-500 max-h-fit min-h-screen flex flex-col">
      <div className='flex items-center justify-center'>
      <div className="items-center bg-white shadow-md rounded-lg p-8 max-w-lg my-9 w-screen">
        <form>
        <h1 className="text-3xl font-bold text-center mb-0">Interest Level</h1>
        <hr class="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700"></hr>
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
                  onChange={() => handleInterestChange('socialService', level)}
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
        <div className="form-group my-2">
            <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:bg-green-700 hover:bg-green-700">Submit</button>
        </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default QuestionsPage;