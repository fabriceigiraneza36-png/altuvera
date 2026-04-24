import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const GoogleSignIn = ({ onSuccess, onError }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        initializeGoogle();
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeGoogle = () => {
    if (!window.google || !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.error('Google SDK not loaded or client ID missing');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: 'popup', // ✅ Use popup mode
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          width: 280,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        }
      );
    } catch (error) {
      console.error('Google initialization error:', error);
    }
  };

  const handleGoogleResponse = async (response) => {
    if (!response?.credential) {
      console.warn('Google sign-in cancelled or failed');
      if (onError) onError();
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await api.post('/users/google', {
        credential: response.credential,
      });

      if (data.success) {
        // Store tokens
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        
        // Update auth context
        if (login) {
          login(data.data.user, data.data.token);
        }

        toast.success(
          data.data.isNewUser 
            ? '🎉 Welcome to Altuvera!' 
            : '✅ Signed in successfully'
        );

        if (onSuccess) {
          onSuccess(data.data);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      const message = error.response?.data?.message || 'Google sign-in failed';
      toast.error(message);
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="google-signin-container">
      <div 
        id="google-signin-button" 
        style={{ 
          opacity: isLoading ? 0.6 : 1,
          pointerEvents: isLoading ? 'none' : 'auto'
        }}
      />
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
};

export default GoogleSignIn;