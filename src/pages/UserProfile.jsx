import React, { useState, useEffect } from 'react';
import { User, MapPin, Calendar, Phone, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import ReviewForm from '../components/ReviewForm';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);

        // Fetch user's profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', storedUser.id)
          .single();

        if (profileError) throw profileError;

        setProfileData({
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone || ''
        });

        // Fetch user's bookings with tour details
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            tours (
              name,
              price,
              destinations (name, image_url)
            )
          `)
          .eq('user_id', storedUser.id)
          .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;
        setBookings(bookingsData);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local storage
      localStorage.setItem('user', JSON.stringify({
        ...user,
        name: profileData.full_name
      }));

      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-orange-100 p-4 rounded-full">
                  <User className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="text-orange-500 hover:text-orange-600"
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <button
                    onClick={handleProfileUpdate}
                    className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2 text-orange-500" />
                    <span>{profileData.full_name}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-orange-500" />
                    <span>{profileData.email}</span>
                  </div>
                  {profileData.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-orange-500" />
                      <span>{profileData.phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bookings Section */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
            <div className="space-y-4">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{booking.tours.name}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                            <span>{booking.tours.destinations.name}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                            <span>Booked on: {new Date(booking.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        booking.status === 'tour completed' 
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'booking confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-2">Booking Details:</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600">
                            <strong>Leader:</strong> {booking.leader_name}
                          </p>
                          <p className="text-gray-600">
                            <strong>Email:</strong> {booking.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            <strong>Phone:</strong> {booking.phone}
                          </p>
                          <p className="text-gray-600">
                            <strong>Number of People:</strong> {booking.number_of_people}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      {booking.status === 'tour completed' && !booking.has_review && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowReviewForm(true);
                          }}
                          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                        >
                          Write Review
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600">No bookings found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Add Modal */}
      {showReviewForm && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Write Review for {selectedBooking.tours.name}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const rating = e.target.rating.value;
              const comment = e.target.comment.value;

              try {
                await supabase.from('reviews').insert({
                  tour_id: selectedBooking.tours.id,
                  booking_id: selectedBooking.id,
                  user_id: user.id,
                  rating: parseInt(rating),
                  comment
                });

                await supabase
                  .from('bookings')
                  .update({ has_review: true })
                  .eq('id', selectedBooking.id);

                toast.success('Review submitted successfully');
                setShowReviewForm(false);
                // Refresh bookings
                window.location.reload();
              } catch (error) {
                toast.error(error.message);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Rating (1-5)</label>
                  <input type="number" name="rating" min="1" max="5" required
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-2">Comment</label>
                  <textarea name="comment" required rows="4"
                    className="w-full p-2 border rounded-lg"
                  ></textarea>
                </div>
                <div className="flex gap-4">
                  <button type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button type="submit"
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;