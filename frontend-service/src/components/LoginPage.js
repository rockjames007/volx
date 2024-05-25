import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className='flex items-center justify-center items-center'>
        <div className="items-center bg-white shadow-md rounded-lg p-8 max-w-md my-9 w-4/5">
          <h2 className="text-3xl font-bold text-center mb-0">Log In</h2>
          <hr class="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700"></hr>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email Address</label>
              <input type="email" id="email" name="email" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password</label>
              <input type="password" id="password" name="password" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500" />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:bg-green-700 hover:bg-green-700">Log In</button>
          </form>
          <div className="text-sm mt-4">
            Don't have an account? <button onClick={handleRegister} className="bg-green-600 text-white-500 hover:outline-none focus:outline-none hover:bg-green-700">Register</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;