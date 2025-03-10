import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const ReviewForm = ({ tourId, bookingId, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('reviews').insert({
        tour_id: tourId,
        user_id: user.id,
        booking_id: bookingId,
        rating,
        comment
      });

      if (error) throw error;
      toast.success('Review submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X className="w-6 h-6 text-gray-500" />
        </button>
        
        <h2 className="text-2xl font-bold mb-4">Write a Review</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
              rows="4"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;