import React, { useState, useRef, useEffect } from 'react';
import './ProfilePage.css';

function ProfilePage() {
  const [profilePicture, setProfilePicture] = useState(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [requiredVolunteers, setRequiredVolunteers] = useState(0);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("Leaderboard");

  useEffect(() => {
    fileInputRef.current = document.createElement('input');
    fileInputRef.current.type = 'file';
    fileInputRef.current.accept = 'image/*';
  }, []);

  const [randomMessages, setRandomMessages] = useState([]);

  const messages = [
    "Hello!",
    "Welcome to React!",
    "Have a great day!",
    "Keep coding!",
    "You're awesome!",
    "Stay positive!",
    "Learn something new today!",
    "Enjoy your journey!",
    "Believe in yourself!",
    "Stay focused and keep going!"
  ];

  useEffect(() => {
    if (activeTab === 'Messages') {
      generateRandomMessages();
    }
  }, [activeTab]);

  const generateRandomMessages = () => {
    const newRandomMessages = Array.from({ length: 10 }).map(() => {
      const randomIndex = Math.floor(Math.random() * messages.length);
      return messages[randomIndex];
    });
    setRandomMessages(newRandomMessages);
  };

  // Function to handle profile picture upload
  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAutomatchVolunteers = () => {
    const selectedVolunteers = [];
    const volunteers = [
      { name: 'Volunteer1', interestLevel: 5 },
      { name: 'Volunteer2', interestLevel: 4 },
      { name: 'Volunteer3', interestLevel: 3 },
      { name: 'Volunteer4', interestLevel: 2 },
      { name: 'Volunteer5', interestLevel: 1 },
    ];
    for (let i = 0; i < requiredVolunteers; i++) {
      selectedVolunteers.push(volunteers[i]);
    }
    console.log(selectedVolunteers);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  const generateRandomDate = () => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + Math.random() * 86400000 * 30);
    return { startDate, endDate };
  };

  const generateRandomStatus = () => {
    const statuses = ['Not Started', 'In Progress', 'Completed'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };
  const [searchQuery, setSearchQuery] = useState("");
  const filteredEvents = Array.from({ length: 9 })
    .map((_, index) => {
      const { startDate, endDate } = generateRandomDate();
      const status = generateRandomStatus();
      const location = `Location ${index + 1}`;
      return {
        name: `Event ${index + 1}`,
        startDate,
        endDate,
        status,
        location
      };
    })
    .filter(event =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  let content;
  if (activeTab === "Leaderboard") {
    content = (
      <div className='items-left bg-white shadow-md rounded-lg p-8 my-9 w-2/3'>
        <div className="greeting-container text-left mt-4">
          <h2 className="text-3xl font-semibold">Leaderboard</h2>
          <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
        </div>
        <div className="users-list mt-4">
          <ul className="divide-y divide-gray-200">
            {Array.from({ length: 10 }).map((_, index) => (
              <li key={index} className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'} py-4`}>
                <div className="flex items-center justify-between px-16">
                  <div className="flex items-center">
                    <img src={`https://source.unsplash.com/random/250x250?sig=${index}`} alt="User" className="w-10 h-10 rounded-full" />
                    <span className="ml-4">User {index + 1}</span>
                  </div>
                  <span className="text-gray-500">{1000 - index} Points</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  } else if (activeTab === "View Events") {
    content = (
      <div className='items-left bg-white shadow-md rounded-lg p-8 my-9 w-2/3'>
        <div className="greeting-container text-left mt-4">
          <h2 className="text-3xl font-semibold">Events</h2>
          <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
        </div>
        <div className="users-list mt-4 "> <div className="search-container my-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Events..."
            className="px-3 py-1 border border-gray-300 rounded-md"
          />
        </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event, index) => (
                <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img src={`https://source.unsplash.com/random/250x250?sig=${index}`} alt="User" className="w-10 h-10 rounded-full" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{event.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.startDate.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.endDate.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="auto-match-button bg-green-600 hover:bg-green-600 text-white font-semibold py-2 px-4 ml-2 rounded-md">
                      Auto-match
                    </button>
                    {event.status === 'Not Started' && (
                      <button className="remove-button bg-red-600 hover:bg-red-600 text-white font-semibold py-2 px-4 ml-2 rounded-md">
                        Remove
                      </button>
                    )}
                    {event.status === 'Completed' && (
                      <button className="feedback-button bg-blue-600 hover:bg-blue-600 text-white font-semibold py-2 px-4 ml-2 rounded-md">
                        Feedback
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );


  } else if (activeTab === "Rewards") {
    content = (
      <div className='items-left bg-white shadow-md rounded-lg p-8 my-9 w-2/3'>
        <div className="greeting-container text-left mt-4">
          <h2 className="text-3xl font-semibold">Rewards</h2>
          <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
        </div>
        <div className="users-list mt-4">
          <ul className="divide-y divide-gray-200">
            {Array.from({ length: 4 }).map((_, index) => (
              <li key={index} className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'} py-4`}>
                <div className="flex items-center justify-between px-16">
                  <div className="flex items-center">
                    <img src={`https://source.unsplash.com/random/250x250?sig=${index}`} alt="User" className="w-10 h-10 rounded-full" />
                    <span className="ml-4">Reward {index + 1}</span>
                  </div>
                  <span className="text-gray-500">{700 - index} Points</span>
                  <button className="redeem-button bg-green-600 hover:bg-green-600 text-white font-semibold py-2 px-4 ml-2 rounded-md">
                    Redeem
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  } else if (activeTab === 'Messages') {
    content = (
      <div className='items-left bg-white shadow-md rounded-lg p-8 my-9 w-2/3'>
        <div className="greeting-container text-left mt-4">
          <h2 className="text-3xl font-semibold">Messages</h2>
          <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
        </div>
        <div className="users-list mt-4">
          <ul className="divide-y divide-gray-200">
            {randomMessages.map((message, index) => (
              <li key={index} className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'} py-4`}>
                <div className="flex items-center justify-between px-16">
                  <div className="flex items-center">
                    <span className="ml-4">Message {index + 1}</span>
                  </div>
                  <span className="text-gray-500">{message}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container bg-blue-500 min-h-screen max-h-fit min-h-screen flex flex-col">
      <div className='flex items-center justify-center items-center'>
        <div className='items-left bg-white shadow-md rounded-lg p-8 my-9 w-2/3'>
          <div className="profile-picture-container flex justify-center items-center mt-8">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="profile-picture rounded-full" />
            ) : (
              <div className="default-profile-picture bg-gray-300 rounded-full flex justify-center items-center" onClick={handleUploadClick}>
                Upload Profile Picture
              </div>
            )}
            <input type="file" onChange={handleProfilePictureUpload} className="hidden" ref={fileInputRef} />
          </div>
          <div className="greeting-container text-center mt-4">
            <h2 className="text-xl font-semibold">Hello, User 1</h2>
            <p>Been a member since 25/05/2024</p>
          </div>
          <div className="tabs-container flex justify-center mt-4">
            <button className={`tab ${activeTab === "Leaderboard" ? 'bg-blue-500' : 'bg-gray-200'} hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-l-md`} onClick={() => handleTabClick("Leaderboard")}>Leaderboard</button>
            <button className={`tab ${activeTab === "View Events" ? 'bg-blue-500' : 'bg-gray-200'} hover:bg-blue-600 text-white font-semibold py-2 px-4`} onClick={() => handleTabClick("View Events")}>View Events</button>
            <button className={`tab ${activeTab === "Rewards" ? 'bg-blue-500' : 'bg-gray-200'} hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-r-md`} onClick={() => handleTabClick("Rewards")}>Rewards</button>
            <button className={`tab ${activeTab === "Messages" ? 'bg-blue-500' : 'bg-gray-200'} hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-r-md`} onClick={() => handleTabClick("Messages")}>Messages</button>
            {/* <div>
              <button onClick={openModal}>Messages</button>
              <Modal
                isOpen={isOpen}
                onRequestClose={closeModal}
                contentLabel="Popup Modal"
                overlayClassName="modal-overlay"
                className="modal-content">
                <div className="modal-header">
                  <h2>Popup Title</h2>
                  <button className="modal-close text-white font-semibold py-2 px-4 rounded-r-md" onClick={closeModal}>
                    &times;
                  </button>
                </div>
                <p>Popup Content Goes Here</p>
              </Modal>
            </div> */}
            {/* Button for organizers to automatch volunteers */}
            {/* Conditionally render based on user type (organizer or user) */}
            {isOrganizer && (
              <div className="flex items-center">
                <input type="number" value={requiredVolunteers} onChange={(e) => setRequiredVolunteers(parseInt(e.target.value))} className="input-field mr-2" />
                <button className="automatch-button bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 ml-2 rounded-md" onClick={handleAutomatchVolunteers}>
                  Automatch Volunteers
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className='flex items-center justify-center items-center'>
        {content}
      </div>
    </div>
  );
}

export default ProfilePage;
