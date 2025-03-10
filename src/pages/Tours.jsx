import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import TourCard from '../components/TourCard';
import { MapPin, Users, Calendar, Search } from 'lucide-react';
import BookingForm from '../components/BookingForm';

const Tours = () => {
  const [searchParams] = useSearchParams();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [destinations, setDestinations] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const location = searchParams.get('location')?.toLowerCase();

        let query = supabase
          .from('tours')
          .select(`
            *,
            destinations (name, image_url)
          `)
          .order('created_at', { ascending: false });

        if (location) {
          query = query.ilike('destinations.name', `%${location}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Filter out tours with null destinations
        const validTours = data.filter(tour => tour.destinations);
        setTours(validTours);
      } catch (error) {
        console.error('Error fetching tours:', error);
        toast.error('Failed to fetch tours');
      } finally {
        setLoading(false);
      }
    };

    const fetchDestinations = async () => {
      const { data: destinationsData } = await supabase
        .from('destinations')
        .select('*');
      setDestinations(destinationsData || []);
    };

    fetchDestinations();
    fetchTours();
  }, [searchParams]);

  const getImageUrl = (destinationName) => {
    if (!destinationName) return '/assets/tour-thumbnail/default.jpg';
    
    // Format name to match file naming (first letter capital)
    const formattedName = destinationName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
      
    return `/assets/tour-thumbnail/${formattedName}.jpg`;
  };

  const handleBookingSubmit = async (formData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      const { error } = await supabase.from('bookings').insert({
        tour_id: selectedTour.id,
        user_id: user.id,
        leader_name: formData.leaderName,
        email: formData.email,
        phone: formData.phone,
        number_of_people: parseInt(formData.numberOfPeople),
        status: 'booking confirmed',
        created_at: new Date().toISOString()
      });

      if (error) throw error;
      toast.success('Booking confirmed successfully!');
      setShowBookingForm(false);
    } catch (error) {
      toast.error('Failed to submit booking');
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gray-900 h-[60vh] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: "url('/assets/hero-bg.jpg')" }}
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Where Would You Like To Go?
          </h1>
          <div className="max-w-md mx-auto bg-white rounded-full shadow-lg p-2">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-gray-400 absolute left-3" />
              <select
                onChange={(e) => {
                  const searchParams = new URLSearchParams(window.location.search);
                  searchParams.set('location', e.target.value);
                  window.history.pushState({}, '', `?${searchParams.toString()}`);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="w-full pl-10 pr-4 py-2 rounded-full text-gray-800 focus:outline-none"
                defaultValue=""
              >
                <option value="">Select Destination</option>
                {destinations.map(dest => (
                  <option key={dest.id} value={dest.name}>
                    {dest.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tours Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Active filters */}
        {searchParams.get('location') && (
          <div className="mb-8 flex items-center gap-2">
            <span className="text-gray-600">Showing tours in:</span>
            <div className="flex items-center bg-orange-100 text-orange-600 px-4 py-2 rounded-full">
              <MapPin className="w-4 h-4 mr-2" />
              {searchParams.get('location')}
              <button
                onClick={() => {
                  const searchParams = new URLSearchParams(window.location.search);
                  searchParams.delete('location');
                  window.history.pushState({}, '', `?${searchParams.toString()}`);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="ml-2 hover:text-orange-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Tours grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
          </div>
        ) : tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map(tour => (
              <div 
                key={tour.id} 
                className="transform transition-all duration-300 hover:scale-105"
              >
                <TourCard tour={tour} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <img 
              src="/assets/no-results.png" 
              alt="No tours found" 
              className="w-48 h-48 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No tours available
            </h3>
            <p className="text-gray-500">
              {searchParams.get('location') 
                ? `No tours found in ${searchParams.get('location')}` 
                : 'No tours available at the moment'}
            </p>
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm 
          tourId={selectedTour.id}
          tourName={selectedTour.name}
          maxPeople={selectedTour.max_people}
          price={selectedTour.price} // Add this line to pass the price
          onClose={() => setShowBookingForm(false)}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  );
};

export default Tours;