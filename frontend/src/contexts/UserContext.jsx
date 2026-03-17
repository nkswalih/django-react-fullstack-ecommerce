// utils/userHelper.js
export const getCurrentUser = () => {
  try {
    const userString = localStorage.getItem('currentUser');
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('Error parsing currentUser:', error);
    return null;
  }
};

export const updateCurrentUser = (updates) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error('Error updating currentUser:', error);
    return null;
  }
};