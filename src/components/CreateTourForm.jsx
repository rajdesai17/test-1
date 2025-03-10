import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { TOUR_SERVICES } from '../utils/constants';

const CreateTourForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    destination_id: '',
    description: '',
    pickup_point: '',
    duration: '',
    services: [],
    max_people: '',
    price: '',
    date: new Date().toISOString().split('T')[0] // Add default date
  });

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const { data, error } = await supabase
          .from('destinations')
          .select('*');
        if (error) throw error;
        setDestinations(data);
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchDestinations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const tourData = {
        name: formData.name,
        destination_id: formData.destination_id,
        description: formData.description,
        pickup_point: formData.pickup_point, 
        duration: parseInt(formData.duration),
        services: formData.services,
        max_people: parseInt(formData.max_people),
        price: parseFloat(formData.price),
        date: formData.date,
        created_by: user.id
      };
      const { error } = await supabase
        .from('tours')
        .insert([{
          ...formData,
          created_by: user.id,
          price: parseFloat(formData.price),
          max_people: parseInt(formData.max_people),
          duration: parseInt(formData.duration),
          date: formData.date // Ensure date is included
        }]);

      if (error) throw error;

      toast.success('Tour created successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Create New Tour</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Tour Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Destination</label>
            <select
              value={formData.destination_id}
              onChange={(e) => setFormData(prev => ({ ...prev, destination_id: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
              required
            >
              <option value="">Select Destination</option>
              {destinations.map(dest => (
                <option key={dest.id} value={dest.id}>
                  {dest.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Services</label>
            <div className="grid grid-cols-2 gap-2">
              {TOUR_SERVICES.map(service => (
                <label key={service} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service)}
                    onChange={() => handleServiceToggle(service)}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span>{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Max People</label>
              <input
                type="number"
                value={formData.max_people}
                onChange={(e) => setFormData(prev => ({ ...prev, max_people: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Duration (days)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Pickup Point</label>
              <input
                type="text"
                value={formData.pickup_point}
                onChange={(e) => setFormData(prev => ({ ...prev, pickup_point: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Tour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTourForm;