import React, { useState } from 'react';
import PersonalisedPage from './Personalised';
import RequestPage from './Request';
import AttendedPage from './AttendedPage';

function VolunteerEvents() {
  const [activeTab, setActiveTab] = useState('personalised');

  return (
    <div className="p-6">
      <div className="border-b border-gray-200">
        <nav className="flex justify-between items-center">
          <div className="flex space-x-8">
            <button
              className={`border-transparent text-white hover:border-gray-300 ${activeTab === 'personalised' ? 'border-b-2 text-white bg-green-600' : ''} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm rounded-lg`}
              onClick={() => setActiveTab('personalised')}
            >
              Personalised
            </button>
            <button
              className={`border-transparent text-white hover:border-gray-300 ${activeTab === 'volunteeringrequest' ? 'border-b-2 text-white bg-green-600' : ''} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm rounded-lg`}
              onClick={() => setActiveTab('volunteeringrequest')}
            >
              Volunteering Request
            </button>
            <button
              className={`border-transparent text-white hover:border-gray-300 ${activeTab === 'upcoming' ? 'border-b-2 text-white bg-green-600' : ''} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm rounded-lg`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`border-transparent text-white hover:border-gray-300 ${activeTab === 'attended' ? 'border-b-2 text-white bg-green-600' : ''} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm rounded-lg`}
              onClick={() => setActiveTab('attended')}
            >
              Attended
            </button>
          </div>
        </nav>
      </div>
      <div className="mt-4">
        {activeTab === 'personalised' && <PersonalisedPage />}
        {activeTab === 'upcoming' && <RequestPage />}
        {activeTab === 'attended' && <AttendedPage/>}
        {activeTab === 'volunteeringrequest' && <RequestPage />}
      </div>
    </div>
  );  
}

export default VolunteerEvents;
