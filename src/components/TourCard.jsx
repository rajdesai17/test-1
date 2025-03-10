import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Users, Calendar, ChevronDown, X, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import BookingForm from './BookingForm';

// Add getImageUrl helper
const getImageUrl = (destinationName) => {
  if (!destinationName) return '/assets/tour-thumbnail/default.jpg';
  
  // Format name to match file naming (first letter capital)
  const formattedName = destinationName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
    
  return `/assets/tour-thumbnail/${formattedName}.jpg`;
};

// Modal component that gets portaled to document body
const TourDetailsModal = ({ tour, onClose }) => {
  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[9999]"
      onClick={() => onClose()}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => onClose()}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white/80 backdrop-blur p-1 rounded-full z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal header - Image section */}
        <div className="relative h-64 md:h-80">
          <img 
            src={getImageUrl(tour.destinations?.name)}
            alt={tour.destinations?.name || 'Tour destination'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/assets/tour-thumbnail/default.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
            <h2 className="text-3xl font-bold text-white mb-2">{tour.name}</h2>
            <p className="text-orange-300 font-semibold text-xl">₹{tour.price}</p>
          </div>
        </div>

        {/* Modal content */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-orange-500" />
                <span>{tour.destinations?.name || 'Unknown location'}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-orange-500" />
                <span>{new Date(tour.date).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-3 text-orange-500" />
                <span>Maximum {tour.max_people} people</span>
              </div>

              {tour.duration && (
                <div className="flex items-center">
                  <Info className="w-5 h-5 mr-3 text-orange-500" />
                  <span>{tour.duration} days</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">About This Tour</h3>
            <p className="text-gray-700">{tour.description || 'No description available for this tour.'}</p>
          </div>

          {tour.services && tour.services.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Services Included</h3>
              <div className="flex flex-wrap gap-2">
                {tour.services.map((service, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// BookingFormPortal component
const BookingFormPortal = ({ tour, onClose, onSubmit }) => {
  const getTourPrice = () => {
    const rawPrice = tour.price;
    
    if (rawPrice === undefined || rawPrice === null) return 0;
    
    if (typeof rawPrice === 'string') {
      const numericString = rawPrice.replace(/[^\d.]/g, '');
      return parseFloat(numericString) || 0;
    }
    
    return Number(rawPrice) || 0;
  };

  return createPortal(
    <BookingForm
      tourId={tour.id}
      tourName={tour.name || "Tour"}
      maxPeople={parseInt(tour.max_people) || 1}
      price={getTourPrice()}
      onClose={onClose}
      onSubmit={onSubmit}
    />,
    document.body
  );
};

const TourCard = ({ tour }) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleBooking = async (formData) => {
    try {
      if (!user) {
        toast.error('Please login to book a tour');
        return;
      }

      const bookingData = {
        tour_id: tour.id,
        user_id: user.id,
        leader_name: formData.leaderName,
        email: formData.email,
        phone: formData.phone,
        number_of_people: parseInt(formData.numberOfPeople),
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (error) throw error;

      toast.success('Booking submitted successfully!');
      setShowBookingForm(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
        <div className="relative h-48">
          <img 
            src={getImageUrl(tour.destinations?.name)}
            alt={tour.destinations?.name || 'Tour destination'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/assets/tour-thumbnail/default.jpg';
              e.target.onerror = null;
            }}
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold">{tour.destinations?.name || 'Unknown location'}</h3>
            <button 
              onClick={() => setShowDetailsModal(true)} 
              className="text-orange-500 hover:text-orange-600 flex items-center text-sm"
            >
              View Details
              <ChevronDown size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-orange-500" />
              <span>{tour.location}</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2 text-orange-500" />
              <span>Max: {tour.max_people} people</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-orange-500" />
              <span>{new Date(tour.date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-bold text-orange-500">
            ₹{tour.price}
            </span>
            <button 
              onClick={() => {
                if (!user) {
                  toast.error('Please login to book a tour');
                  return;
                }
                setShowBookingForm(true);
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Tour Details Modal - Using Portal */}
      {showDetailsModal && (
        <TourDetailsModal 
          tour={tour} 
          onClose={() => setShowDetailsModal(false)} 
        />
      )}

      {/* Booking Form - Using Portal */}
      {showBookingForm && (
        <BookingFormPortal
          tour={tour}
          onClose={() => setShowBookingForm(false)}
          onSubmit={handleBooking}
        />
      )}
    </>
  );
};

export default TourCard;