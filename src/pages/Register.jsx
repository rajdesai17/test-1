import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      // 1. Check if email exists
      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingUsers) {
        toast.error('Email already registered');
        return;
      }

      // 2. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 3. Create profile with upsert
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: formData.name,
          email: formData.email,
          is_admin: isAdmin
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (profileError) throw profileError;

      toast.success('Registration successful! Please check your email.');
      navigate('/login');

    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full p-2 border rounded-lg focus:border-orange-500 outline-none"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6 flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => setIsAdmin(false)}
              className={`px-4 py-2 rounded-full ${
                !isAdmin ? 'bg-orange-500 text-white' : 'bg-gray-200'
              }`}
            >
              User
            </button>
            <button
              type="button" 
              onClick={() => setIsAdmin(true)}
              className={`px-4 py-2 rounded-full ${
                isAdmin ? 'bg-orange-500 text-white' : 'bg-gray-200'
              }`}
            >
              Admin
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          <p className="text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 hover:text-orange-600">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;