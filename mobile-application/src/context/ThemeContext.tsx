import React, { createContext, useContext, useState } from 'react';

interface Theme {
  dark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    card: string;
    border: string;
  };
}

const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    background: '#0f172a',
    text: '#f8fafc',
    card: '#1e293b',
    border: '#334155',
  },
};

const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#2563eb',
    secondary: '#059669',
    background: '#f8fafc',
    text: '#1e293b',
    card: '#ffffff',
    border: '#e2e8f0',
  },
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(darkTheme);

  const toggleTheme = () => {
    setTheme(prev => prev.dark ? lightTheme : darkTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
