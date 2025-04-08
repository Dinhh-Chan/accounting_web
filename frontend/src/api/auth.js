// src/api/auth.js
export const login = async (credentials) => {
    // Giả lập API call
    return {
      access_token: 'fake_token',
      token_type: 'bearer'
    };
  };
  
  export const getCurrentUser = async () => {
    // Giả lập API call
    return {
      id: 1,
      email: 'admin@example.com',
      full_name: 'Admin User'
    };
  };