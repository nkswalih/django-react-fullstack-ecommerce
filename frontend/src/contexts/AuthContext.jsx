import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [authLoading,setAuthLoading] = useState(true);

    const login = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
    }

    // Add helper functions to check roles
    const isAdmin = () => {
        return user?.role === 'Admin';
    };

    const isUser = () => {
        return user?.role === 'User';
    };

    useEffect(() => {
        const storedAuth = localStorage.getItem('isAuthenticated');
        const storedUser = localStorage.getItem('user');

        if(storedAuth === 'true' && storedUser){
            setIsAuthenticated(true); 
            setUser(JSON.parse(storedUser));
        }

        setAuthLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated,  
            user, 
            login, 
            logout,
            isAdmin,
            isUser,
            authLoading,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
}