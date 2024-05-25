import React, { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import TopNav from './TopNav';
import '../App.css';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);

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

  const tagDisplayNames = {
    environment: 'Environment',
    health: 'Health',
    mentalHealth: 'Mental Health',
    animalWelfare: 'Animal Welfare',
    education: 'Education',
    socialServices: 'Social Services',
    arts: 'Arts',
  };


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

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setUploadedImage(file);
    // Handle file upload logic here
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission, e.g., send data to backend
    console.log(eventData);
    navigate('/');
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="bg-blue-500 max-h-fit min-h-screen flex flex-col">
      <TopNav />
      <div className="flex items-center justify-center">
        <div className="bg-white shadow-md rounded-lg p-8 my-9  w-full max-w-4xl">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-3xl font-bold header mb-0 mb-4">Create Event</h2>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
                accept="image/*"
              />
              <button onClick={handleUploadButtonClick} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-0 ">Upload Image</button>
            </div>
          </div>
          <hr class="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700"></hr>
          <form onSubmit={handleSubmit}>
          <div className="mb-4">
              <div className="relative bg-gray-300 rounded w-full h-80 flex items-center justify-center mb-4 overflow-hidden">
                {uploadedImage ? (
                  <img
                    src={URL.createObjectURL(uploadedImage)}
                    alt="Uploaded"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-gray-500">Image Preview</span>
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="block text-gray-700 font-bold mb-2" htmlFor="eventName">Event Name</label>
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={eventData.description}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
                style={{ height: "10rem" }}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fromDate">From Date</label>
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="toDate">To Date</label>
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">Tags</label>
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
                    <label htmlFor={tag}>{tagDisplayNames[tag]}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4 flex items-end justify-end">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;