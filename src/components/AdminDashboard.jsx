import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Map, Calendar, Users, Plus, Edit, Trash2, X, Star } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState(null);

  const [statsData, setStatsData] = useState([
    { id: 1, title: 'Total Tours', value: 0, color: 'bg-blue-500', icon: Users },
    { id: 2, title: 'Total Bookings', value: 0, color: 'bg-green-500', icon: Calendar },
    { id: 3, title: 'Total Revenue', value: 0, color: 'bg-orange-500', icon: Map },
    { id: 4, title: 'Pending Bookings', value: 0, color: 'bg-yellow-500', icon: Mail }
  ]);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/assets/tour-thumbnail/default.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/tour-images/${imageUrl}`;
  };

  const getTourImage = (tour) => {
    if (!tour.images || tour.images.length === 0) {
      return '/assets/tour-thumbnail/default.jpg';
    }
    return getImageUrl(tour.images[0]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get session from Supabase instead of localStorage
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          navigate('/login');
          return;
        }

        const user = session.user;
        
        // Get admin profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        
        setAdmin(profileData);
        setProfileData({
          full_name: profileData.full_name || '',
          email: profileData.email || '',
          phone: profileData.phone || ''
        });

        // Get tours with error handling for null values
        const { data: toursData, error: toursError } = await supabase
          .from('tours')
          .select(`
            *,
            destinations (
              id,
              name,
              image_url
            )
          `)
          .eq('created_by', user.id);

        if (toursError) throw toursError;
        setTours(toursData || []);

        // Get bookings with tour data
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            tour:tour_id (
              id,
              name,
              date,
              price
            )
          `)
          .in('tour_id', (toursData || []).map(t => t.id))
          .order('created_at', { ascending: false }); // Add this line

        if (bookingsError) throw bookingsError;
        setBookings(bookingsData || []);

        // Update stats
        const newStats = [...statsData];
        newStats[0].value = toursData?.length || 0;
        newStats[1].value = bookingsData?.length || 0;
        newStats[2].value = bookingsData?.reduce((sum, b) => 
          sum + ((b.tour?.price || 0) * (b.number_of_people || 0)), 0);
        newStats[3].value = bookingsData?.filter(b => b.status === 'pending').length || 0;
        
        setStatsData(newStats);
        setLoading(false);

      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          tours (name),
          profiles (full_name)
        `)
        .order('created_at', { ascending: false });
      setReviews(data || []);
    };

    fetchReviews();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      if (!admin?.id) throw new Error('No admin ID found');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone
        })
        .eq('id', admin.id);

      if (error) throw error;

      setAdmin(prev => ({
        ...prev,
        full_name: profileData.full_name,
        phone: profileData.phone
      }));

      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return;

    try {
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', tourId);

      if (error) throw error;

      setTours(tours.filter(tour => tour.id !== tourId));
      toast.success('Tour deleted successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add new function to handle tour completion
  const handleTourCompletion = async (bookingId) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'tour completed' })
        .eq('id', bookingId);

      if (error) throw error;

      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'tour completed' }
          : booking
      ));

      toast.success('Tour marked as completed');
    } catch (error) {
      toast.error('Failed to update tour status');
    }
  };

  // Add new function to handle all bookings completion for a tour
  const handleTourCompletionAll = async (tourId, tourBookings) => {
    try {
      // Update all bookings for this tour
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'tour completed' })
        .in('id', tourBookings.map(b => b.id));

      if (error) throw error;

      // Update local state
      setBookings(bookings.map(booking => 
        booking.tour_id === tourId
          ? { ...booking, status: 'tour completed' }
          : booking
      ));

      toast.success('Tour and all bookings marked as completed');
    } catch (error) {
      toast.error('Failed to update tour status');
    }
  };

  const handleEditClick = (tourId) => {
    setSelectedTourId(tourId);
    navigate(`/admin/edit-tour/${tourId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!admin) {
    return <div className="flex justify-center items-center min-h-screen">Unauthorized</div>;
  }

  return (
    <div className="container">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <button
                  onClick={handleProfileUpdate}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p><strong>Name:</strong> {admin.full_name || 'Not set'}</p>
                  <p><strong>Email:</strong> {admin.email || 'Not set'}</p>
                  <p><strong>Phone:</strong> {admin.phone || 'Not set'}</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 w-full transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowReviews(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full transition-colors"
                  >
                    View Reviews
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat) => (
              <div key={stat.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-gray-500 text-sm">{stat.title}</h3>
                    <p className="text-2xl font-semibold">
                      {stat.title === 'Total Revenue' ? `₹${stat.value.toFixed(2)}` : stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tours Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Tours</h2>
              <Link
                to="/admin/create-tour"
                className="flex items-center bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Tour
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map(tour => (
                <div key={tour.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    <img 
                      src={getTourImage(tour)}
                      alt={tour.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/tour-thumbnail/default.jpg';
                      }}
                    />
                  </div>
                  <div className="p-4 space-y-4">
                    <h3 className="font-semibold text-lg">{tour.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{tour.description}</p>
                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => handleEditClick(tour.id)}
                        className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTour(tour.id)}
                        className="bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bookings Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Bookings</h2>
            <div className="space-y-6">
              {tours.map(tour => {
                const tourBookings = bookings.filter(b => b.tour_id === tour.id);
                if (tourBookings.length === 0) return null;

                const allBookingsCompleted = tourBookings.every(b => b.status === 'tour completed');
                const hasConfirmedBookings = tourBookings.some(b => b.status === 'booking confirmed');

                return (
                  <div key={tour.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded">
                      <h3 className="text-lg font-semibold">{tour.name}</h3>
                      {hasConfirmedBookings && !allBookingsCompleted && (
                        <button
                          onClick={() => handleTourCompletionAll(tour.id, tourBookings)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                          Complete Tour
                        </button>
                      )}
                      {allBookingsCompleted && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          Tour Completed
                        </span>
                      )}
                    </div>
                    <div className="grid gap-4">
                      {tourBookings.map((booking) => (
                        <div 
                          key={booking.id} 
                          className="flex justify-between items-center border-b pb-4"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{booking.leader_name}</p>
                            <p className="text-sm text-gray-600">
                              People: {booking.number_of_people} | 
                              Phone: {booking.phone}
                            </p>
                            <p className="text-sm text-gray-600">
                              Booked on: {new Date(booking.created_at).toLocaleDateString()}
                            </p>
                            <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                              booking.status === 'tour completed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Reviews Modal */}
      {showReviews && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Tour Reviews</h2>
              <button onClick={() => setShowReviews(false)} className="text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{review.tours?.name}</h3>
                      <p className="text-sm text-gray-600">
                        by {review.profiles?.full_name} • 
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;