import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './MainPage.css';
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
        <div className="bg-white rounded-lg p-8 mt-8 mx-auto w-2/3">
          <div className="main-card">
            <h2 className="text-3xl font-bold mb-3">Be a volunteer</h2>
            <input type="text" placeholder="Search" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-purple-500" />
          </div>
          <div className="bg-white rounded-lg p-8 mt-8 mx-auto w-2/3 event-main-card">
            {/* First row of cards */}
            <div className="flex justify-between mb-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="blue-card">
                  <div className="rounded-lg shadow-md p-4 flex flex-col items-center justify-center bg-blue-200 mb-4">
                    <img src={`https://source.unsplash.com/random/250x250?sig=${index}`} alt="Image" className="w-24 h-24 mb-2" />
                    <div className="text-center">Description Text</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;