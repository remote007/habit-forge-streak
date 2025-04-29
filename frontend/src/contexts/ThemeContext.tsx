import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeStyle = 'default' | 'modern-newspaper' | 'funky-retro' | 'indie-zine' | 'editorial-funk' | 'pop-art';
type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  themeMode: ThemeMode;
  themeStyle: ThemeStyle;
  toggleThemeMode: () => void;
  setThemeStyle: (style: ThemeStyle) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Initialize from localStorage or default to light
    const savedThemeMode = localStorage.getItem('themeMode');
    return (savedThemeMode as ThemeMode) || 'light';
  });

  const [themeStyle, setThemeStyle] = useState<ThemeStyle>(() => {
    // Initialize from localStorage or default to default
    const savedThemeStyle = localStorage.getItem('themeStyle');
    return (savedThemeStyle as ThemeStyle) || 'default';
  });

  // Apply theme mode
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save to localStorage
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  // Apply theme style
  useEffect(() => {
    // Remove all theme style classes
    document.documentElement.classList.remove(
      'theme-default',
      'theme-modern-newspaper',
      'theme-funky-retro',
      'theme-indie-zine',
      'theme-editorial-funk',
      'theme-pop-art'
    );
    
    // Add the current theme style class
    document.documentElement.classList.add(`theme-${themeStyle}`);
    
    // Save to localStorage
    localStorage.setItem('themeStyle', themeStyle);
  }, [themeStyle]);

  const toggleThemeMode = () => {
    setThemeMode(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ themeMode, themeStyle, toggleThemeMode, setThemeStyle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
