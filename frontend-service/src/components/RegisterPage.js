import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';
import TopNav from './TopNav';
import '../App.css';

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    password: '',
    email: '',
    phone: '',
    gender: '',
  });

  const [errors, setErrors] = useState({});
  const [isOrganizer, setIsOrganizer] = useState(false); // State to manage organizer checkbox

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name === 'isOrganizer') {
      setIsOrganizer(checked);
      if (checked) {
        setForm({ ...form, gender: '' }); // Reset gender when checking organizer checkbox
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.password) newErrors.password = 'Password is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.phone) newErrors.phone = 'Phone number is required';
    if (!isOrganizer && !form.gender) newErrors.gender = 'Gender is required for users';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      // Save user data to profile (you might want to use a state management solution or context)
      if(!isOrganizer){
        navigate('/question');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="bg-blue-500 max-h-fit min-h-screen flex flex-col">
      <TopNav />
      <div className='flex items-center justify-center items-center'>
        <div className="items-left bg-white shadow-md rounded-lg p-8 max-w-md my-9 w-4/5">
          <h2 className="text-3xl font-bold text-center mb-0">Register</h2>
          <hr class="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700"></hr>
          <form onSubmit={handleSubmit} >
            {/* Registration Form */}
            <div className="form-group">
              <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="input-field"
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="input-field"
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="phone" className="block text-gray-700 font-bold mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="input-field"
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>
            {!isOrganizer && (
              <div className="form-group">
                <label htmlFor="gender" className="block text-gray-700 font-bold mb-2">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error">{errors.gender}</span>}
              </div>
            )}
            {/* Organizer Checkbox */}
            <div className="form-group flex items-center">
              <input
                type="checkbox"
                id="isOrganizer"
                name="isOrganizer"
                checked={isOrganizer}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <label htmlFor="isOrganizer" className="block text-gray-700 font-bold">Organizer</label>
            </div>
            <div className="form-group">
              <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md focus:bg-green-700 hover:bg-green-700">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;