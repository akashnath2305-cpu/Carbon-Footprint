import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for token on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    setCurrentUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUserPoints = (pointsUsed) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, used_points: currentUser.used_points + pointsUsed };
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const addPendingPoints = (points) => {
    if (!currentUser) return;
    const newPoints = (currentUser.pending_points || 0) + points;
    setCurrentUser(prev => ({
      ...prev,
      pending_points: newPoints
    }));
  };

  const addEarnedPoints = async (pointsEarned) => {
    if (!currentUser) return;
    try {
      const response = await fetch('http://localhost:5000/api/rewards/earn', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ points: pointsEarned })
      });
      if (response.ok) {
        const data = await response.json();
        const updatedUser = { ...currentUser, total_points: data.total_points };
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Error earning points:', err);
    }
  };

  const value = {
    currentUser,
    token,
    login,
    logout,
    updateUserPoints,
    addPendingPoints,
    addEarnedPoints,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
