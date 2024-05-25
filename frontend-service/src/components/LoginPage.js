import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8">Log In</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email Address</label>
            <input type="email" id="email" name="email" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-purple-500" />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password</label>
            <input type="password" id="password" name="password" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-purple-500" />
          </div>
          <button type="submit" className="w-full bg-purple-500 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:bg-purple-600 hover:bg-purple-600">Log In</button>
        </form>
        <div className="text-sm mt-4">
          Don't have an account? <button onClick={handleRegister} className="text-purple-500 hover:underline focus:outline-none">Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;