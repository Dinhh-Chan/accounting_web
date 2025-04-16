// Kiểm tra file hooks/useAuth.js
export const useAuth = () => {
    // Logic của hook
    return {
      isAuthenticated: true,
      loading: false,
      currentUser: null,
      logout: () => {}
    };
  };