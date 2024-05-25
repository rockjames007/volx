import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './MainPage.css';
import '../index.js'; 
import TopNav from './TopNav';
const MainPage = () => {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/main');
  };
  
  return (
    <div className="bg-purple-500 h-5 min-h-screen flex flex-col">
      <TopNav />
      <div className="content">
        <div className="bg-transparent rounded-lg p-1 mt-9 mx-auto w-2/3 main-card h-full max-h-400">
        <h2 className="text-3xl font-bold mb-3 header">Be a volunteer</h2>
        <form class="max-w-md ">   
            <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div class="relative">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </div>
                <input type="search" id="default-search" class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Events..." required />
                <button type="submit" class="text-white absolute end-2.5 bottom-1.5 bg-blue-400 hover:bg-blue-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700">Search</button>
            </div>
        </form>
        </div>
        <div className="bg-transparent rounded-lg p-8 mt-8 mx-auto w-2/3 event-main-card">
            {/* First row of cards */}
            <div className="flex justify-between mb-8 space-x-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="blue-card">
                  <div className="rounded-lg shadow-md p-4 flex flex-col items-center justify-center bg-blue-200 mb-4">
                    <img src={`https://source.unsplash.com/random/250x250?sig=${index}`} alt="Image" className="max-w-md h-24 mb-2" />
                    <div className="text-center">Description Text</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
}

export default MainPage;