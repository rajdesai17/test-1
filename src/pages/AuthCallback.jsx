import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (!session) {
          navigate('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          localStorage.setItem('user', JSON.stringify({
            id: session.user.id,
            name: profile.full_name,
            email: session.user.email,
            isAdmin: profile.is_admin
          }));
          
          toast.success('Email verified successfully!');
          navigate(profile.is_admin ? '/admin/dashboard' : '/');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication error. Please try again.');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Verifying your email...</h2>
        <p className="text-gray-600">Please wait while we complete the verification process.</p>
      </div>
    </div>
  );
};

export default AuthCallback; 
