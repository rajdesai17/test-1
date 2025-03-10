import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const EditTourForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '', // keep but will be read-only
    max_people: '',
    date: '',
    price: '',
    description: ''
  });

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const { data, error } = await supabase
          .from('tours')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setFormData({
          name: data.name || '',
          location: data.location || '',
          max_people: data.max_people || '',
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
          price: data.price || '',
          description: data.description || ''
        });
      } catch (error) {
        toast.error('Failed to fetch tour details');
        navigate('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const updateData = {
        name: formData.name,
        max_people: parseInt(formData.max_people),
        date: formData.date,
        price: parseFloat(formData.price),
        description: formData.description
        // location removed from updateData
      };

      const { error } = await supabase
        .from('tours')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Tour updated successfully');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to update tour');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Edit Tour</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Tour Name*</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Location (Cannot be modified)</label>
            <input
              type="text"
              value={formData.location}
              className="w-full p-2 border rounded-lg bg-gray-100 cursor-not-allowed"
              disabled
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
              rows={4}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Maximum People*</label>
            <input
              type="number"
              value={formData.max_people}
              onChange={(e) => setFormData(prev => ({ ...prev, max_people: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
              required
              min="1"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Tour Date*</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Price*</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
              required
              min="0"
              step="0.01"
              disabled={submitting}
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:bg-orange-300"
            >
              {submitting ? 'Updating...' : 'Update Tour'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTourForm;
