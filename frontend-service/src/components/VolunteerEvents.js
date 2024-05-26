import React, { useState } from 'react';
import PersonalisedPage from './Personalised';
import RequestPage from './Request';

function VolunteerEvents() {
  const [activeTab, setActiveTab] = useState('personalised');

  return (
    <div className="p-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`border-transparent text-white py-2 px-4 rounded-md hover:bg-green-700  ${activeTab === 'personalised' ? 'border-b-2  text-white bg-green-600' : ''}  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm rounded-lg`}
            onClick={() => setActiveTab('personalised')}
          >
            Personalised
          </button>
          <button
            className={`border-transparent text-white py-2 px-4 rounded-md hover:bg-green-700 ${activeTab === 'volunteeringrequest' ? 'border-b-2  text-white bg-green-600' : ''} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm rounded-lg`}
            onClick={() => setActiveTab('volunteeringrequest')}
          >
            Volunteering Request
          </button>
          <button
            className={`border-transparent text-white py-2 px-4 rounded-md hover:bg-green-700 ${activeTab === 'upcoming' ? 'border-b-2  text-white bg-green-600' : ''} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm rounded-lg`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`border-transparent text-white py-2 px-4 rounded-md hover:bg-green-700 ${activeTab === 'attended' ? 'border-b-2  text-white bg-green-600' : ''} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm rounded-lg`}
            onClick={() => setActiveTab('attended')}
          >
            Attended
          </button>
          
        </nav>
      </div>
      <div className="bg-transparent p-3 mt-3 mx-auto event-main-card">
        {activeTab === 'personalised' && <PersonalisedPage/>}
        {activeTab === 'upcoming' && <RequestPage/>}
        {activeTab === 'attended' && <div>Attended content...</div>}
        {activeTab === 'volunteeringrequest' && <RequestPage />}
      </div>
    </div>
  );
}

export default VolunteerEvents;
