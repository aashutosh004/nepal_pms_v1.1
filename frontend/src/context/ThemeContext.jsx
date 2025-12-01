import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
    // Initialize state from localStorage or defaults
    const [theme, setTheme] = useState(() => localStorage.getItem('pms_theme') || 'Light');
    const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('pms_fontSize')) || 14);

    // Apply Theme Effect
    useEffect(() => {
        const root = window.document.documentElement;

        // Remove existing theme classes
        root.classList.remove('dark', 'light');

        if (theme === 'Dark') {
            root.classList.add('dark');
        } else if (theme === 'Light') {
            root.classList.add('light');
        } else if (theme === 'System') {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
            } else {
                root.classList.add('light');
            }
        }

        localStorage.setItem('pms_theme', theme);
    }, [theme]);

    // Apply Font Size Effect
    useEffect(() => {
        const root = window.document.documentElement;
        root.style.fontSize = `${fontSize}px`;
        localStorage.setItem('pms_fontSize', fontSize);
    }, [fontSize]);

    const value = {
        theme,
        setTheme,
        fontSize,
        setFontSize
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
