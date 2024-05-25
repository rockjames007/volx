import React, { useState, useRef } from 'react';
import './ProfilePage.css';
import TopNav from './TopNav';

function ProfilePage() {
  const [profilePicture, setProfilePicture] = useState(null); // State to manage profile picture
  const [memberSinceDate, setMemberSinceDate] = useState(""); // State to manage member since date
  const [isOrganizer, setIsOrganizer] = useState(false); // State to manage organizer status
  const [requiredVolunteers, setRequiredVolunteers] = useState(0); // State to manage the number of required volunteers
  const fileInputRef = useRef(null); // Reference for file input element

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

  // Function to trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Function to handle automatching volunteers
  const handleAutomatchVolunteers = () => {
    // Example logic:
    // Based on the category of the event and the highest interest level of 5,
    // select the required number of volunteers from the descending order of interest levels
    const selectedVolunteers = []; // Array to store the selected volunteers
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

  return (
    <div className="profile-container bg-blue-500 min-h-screen max-h-fit min-h-screen flex flex-col">
      <TopNav />
      <div className='flex items-center justify-center items-center'>
        <div className='items-left bg-white shadow-md rounded-lg p-8 my-9 w-2/3'>
          <div className="profile-picture-container flex justify-center items-center mt-8">
            {/* Display uploaded profile picture */}
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="profile-picture rounded-full" />
            ) : (
              <div className="default-profile-picture bg-gray-300 rounded-full flex justify-center items-center" onClick={handleUploadClick}>
                Upload Profile Picture
              </div>
            )}
            {/* Upload Profile Picture Button */}
            <input type="file" onChange={handleProfilePictureUpload} accept="image/*" className="hidden" ref={fileInputRef} />
          </div>
          {/* Greeting */}
          <div className="greeting-container text-center mt-4">
            <h2 className="text-xl font-semibold">Hello User99999</h2>
            <p>Been a member since {memberSinceDate}</p>
          </div>
          {/* Tabs */}
          <div className="tabs-container flex justify-center mt-4">
            <button className="tab bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-l-md">Leaderboards</button>
            <button className="tab bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-r-md">View Events</button>
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
    </div>
  );
}

export default ProfilePage;