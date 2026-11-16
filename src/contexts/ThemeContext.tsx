import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
    isNightMode: boolean;
    toggleNightMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ isNightMode: false, toggleNightMode: () => {} });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isNightMode, setIsNightMode] = useState(() => {
        const saved = localStorage.getItem('sim_night_mode');
        return saved !== null ? saved === 'true' : false;
    });

    useEffect(() => {
        localStorage.setItem('sim_night_mode', String(isNightMode));
    }, [isNightMode]);

    return (
        <ThemeContext.Provider value={{ isNightMode, toggleNightMode: () => setIsNightMode(!isNightMode) }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
