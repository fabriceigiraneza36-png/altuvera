// utils/sendMessage.js
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-1-ghrv.onrender.com/api';

export const sendMessage = async ({ type, data }) => {
  try {
    let endpoint;
    let payload;

    switch (type) {
      case 'contact':
        endpoint = `${API_URL}/contact`;
        // Map frontend field names to backend expected names
        payload = {
          full_name: data.name || data.full_name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject || null,
          message: data.message,
          trip_type: data.tripType || data.trip_type || null,
          travel_date: data.travelDate || data.travel_date || null,
          number_of_travelers: data.travelers || data.number_of_travelers || null,
          source: 'website',
        };
        break;

      case 'booking':
        endpoint = `${API_URL}/bookings`;
        payload = data;
        break;

      case 'newsletter':
        endpoint = `${API_URL}/newsletter/subscribe`;
        payload = { email: data.email };
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || result.message || 'Something went wrong. Please try again.',
      };
    }

    return {
      success: true,
      data: result.data,
      message: result.message || 'Message sent successfully!',
    };
  } catch (error) {
    console.error('sendMessage error:', error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your internet connection.',
      };
    }

    return {
      success: false,
      error: error.message || 'An unexpected error occurred. Please try again.',
    };
  }
};

// Helper for checking if API is available
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
};