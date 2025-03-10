import React, { useState } from 'react';
import { MapPin, Timer, Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    location: '',
    distance: '',
    maxPeople: ''
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams(searchParams).toString();
    navigate(`/tours?${queryParams}`);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-lg flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <label className="flex items-center gap-2">
          <MapPin className="text-orange-500" />
          <span className="text-sm text-gray-600">Location</span>
        </label>
        <input 
          type="text" 
          placeholder="Where are you going?"
          value={searchParams.location}
          onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
          className="w-full mt-1 p-2 border-b focus:border-orange-500 outline-none"
        />
      </div>

      <div className="flex-1">
        <label className="flex items-center gap-2">
          <Timer className="text-orange-500" />
          <span className="text-sm text-gray-600">Distance</span>
        </label>
        <input 
          type="text" 
          placeholder="Distance k/m"
          value={searchParams.distance}
          onChange={(e) => setSearchParams(prev => ({ ...prev, distance: e.target.value }))}
          className="w-full mt-1 p-2 border-b focus:border-orange-500 outline-none"
        />
      </div>

      <div className="flex-1">
        <label className="flex items-center gap-2">
          <Users className="text-orange-500" />
          <span className="text-sm text-gray-600">Max People</span>
        </label>
        <input 
          type="number" 
          placeholder="0"
          value={searchParams.maxPeople}
          onChange={(e) => setSearchParams(prev => ({ ...prev, maxPeople: e.target.value }))}
          className="w-full mt-1 p-2 border-b focus:border-orange-500 outline-none"
        />
      </div>

      <button 
        type="submit"
        className="bg-orange-500 p-4 rounded-lg hover:bg-orange-600 transition-colors"
      >
        <Search className="text-white" />
      </button>
    </form>
  );
};

export default SearchBar;
