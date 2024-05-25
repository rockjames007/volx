import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from './TopNav';
import '../App.css';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/main');
  };
  return (
    <div className="bg-blue-500 max-h-fit min-h-screen flex flex-col ">
      <TopNav />
      <div className='flex items-center justify-center items-center'>
        <div className="items-center bg-white shadow-md rounded-lg p-8 max-w-md my-9 w-4/5">
          <h2 className="text-3xl font-bold text-center mb-10">Log In</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email Address</label>
              <input type="email" id="email" name="email" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password</label>
              <input type="password" id="password" name="password" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500" />
            </div>
            <button type="submit" className="w-full bg-blue-400 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:bg-blue-500 hover:bg-blue-500">Log In</button>
          </form>
          <div className="text-sm mt-4">
            Don't have an account? <button onClick={handleRegister} className="bg-blue-400 text-white-500 hover:outline-none focus:outline-none hover:bg-blue-500">Register</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;