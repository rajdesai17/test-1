import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Login attempt:', formData.email);
      
      // 1. Sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 2. Get profile with admin flag
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      // 3. Validate admin status
      if (isAdmin && !profile.is_admin) {
        throw new Error('Not authorized as admin');
      }

      // 4. Store user data
      localStorage.setItem('user', JSON.stringify({
        id: authData.user.id,
        name: profile.full_name,
        email: authData.user.email,
        isAdmin: profile.is_admin
      }));

      toast.success('Login successful!');
      navigate(profile.is_admin ? '/admin/dashboard' : '/');

    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isAdmin ? 'Admin Login' : 'User Login'}
        </h2>

        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={() => setIsAdmin(false)}
            className={`px-4 py-2 rounded-full ${
              !isAdmin ? 'bg-orange-500 text-white' : 'bg-gray-200'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setIsAdmin(true)}
            className={`px-4 py-2 rounded-full ${
              isAdmin ? 'bg-orange-500 text-white' : 'bg-gray-200'
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 hover:text-orange-600">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;