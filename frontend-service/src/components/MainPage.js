import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import { eventIdState } from '../state/recoilstate';
import { useRecoilState } from 'recoil';
import { mainEvents } from "../data/event-mainpage";
const MainPage = () => {
  const navigate = useNavigate();
  const [eventId, setEventId] = useRecoilState(eventIdState);

  const handleRegister = () => {
    navigate('/enterVolunteerPage');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/main');
  };

  return (
    <div className="bg-blue-500 min-h-screen flex flex-col">
      <div className="bg-transparent rounded-lg p-1 mt-9 mx-auto w-2/3 main-card h-5/6 pb-24" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://i.pinimg.com/originals/54/2a/d4/542ad4e7c504b61fcaf8e7c59637a790.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <h2 className="text-3xl font-bold mb-3 header" style={{ color: '#F7F9FB' }}>Be a volunteer</h2>
        <form class="max-w-md ">
          <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
          <div class="relative">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input type="search" id="default-search" class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Events..." required />
            <button type="submit" class="text-white absolute end-2.5 bottom-1.5 bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-green-700 dark:hover:bg-green-700">Search</button>
          </div>
        </form>
      </div>
      <div className="bg-transparent p-8 mt-8 mx-auto w-2/3 event-main-card">
        <h2 className="text-3xl font-bold text-center mb-4 text-white" style={{ color: 'white' }}>Highlighted Events</h2>
        <p class="mb-10 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-center lg:text-xl lg:px-64 lg:mb-16" style={{ color: '#E0E0E0' }}>
          Interested in volunteering? Join us in making a difference! Help us create a positive impact and be part of something meaningful. Explore our volunteering opportunities and get involved today!</p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {mainEvents.map((data, index) => (
            <div key={index} className="blue-card transform transition duration-500 ease-in-out hover:scale-105 hover:shadow-lg" onClick={() => {
              setEventId(data.eventId);
              navigate("/event");
            }}>
              <div className="shadow-md p-4 flex flex-col items-center justify-center bg-white mb-4">
                <img src={data.imageUrl} alt="Image" className="w-full h-24  object-cover" />
                <div className='bg-white w-full h-30'>
                  <div className="text-left text-black font-bold overflow-hidden overflow-ellipsis whitespace-nowrap">{data.eventName}</div>
                  <div className="text-left text-black">{data.date}</div>
                  <div className="text-left text-black overflow-hidden overflow-ellipsis whitespace-nowrap">{data.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MainPage;