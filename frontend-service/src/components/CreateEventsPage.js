import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';


const CreateEventPage = () => {
  const navigate = useNavigate();

  const [eventData, setEventData] = useState({
    eventName: '',
    description: '',
    fromDate: '',
    toDate: '',
    location: '',
    capacity: '',
    tags: {
      environment: false,
      health: false,
      mentalHealth: false,
      animalWelfare: false,
      education: false,
      socialServices: false,
      arts: false,
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEventData({
      ...eventData,
      tags: {
        ...eventData.tags,
        [name]: checked,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission, e.g., send data to backend
    console.log(eventData);
    navigate('/'); // Navigate to home page after submission
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Create Event</h1>
        <div>
          {/* Add upload image circle component here */}
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Upload Image</button>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventName">Event Name:</label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={eventData.eventName}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        {/* Add other form fields */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={eventData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fromDate">From Date:</label>
          <DatePicker
            id="fromDate"
            selected={eventData.fromDate}
            onChange={(date) => setEventData({ ...eventData, fromDate: date })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="toDate">To Date:</label>
          <DatePicker
            id="toDate"
            selected={eventData.toDate}
            onChange={(date) => setEventData({ ...eventData, toDate: date })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">Tags:</label>
          <div className="flex flex-wrap">
            {Object.entries(eventData.tags).map(([tag, checked]) => (
              <div key={tag} className="mr-4 mb-2">
                <input
                  type="checkbox"
                  id={tag}
                  name={tag}
                  checked={checked}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label htmlFor={tag}>{tag}</label>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;