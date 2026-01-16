import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ClinicInfo {
  id: number;
  name: string;
  username: string;
}

interface ClinicAuthContextType {
  token: string | null;
  clinicInfo: ClinicInfo | null;
  login: (token: string, clinicInfo: ClinicInfo) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const ClinicAuthContext = createContext<ClinicAuthContextType | undefined>(undefined);

export const ClinicAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('clinicToken');
      const savedClinicInfo = await AsyncStorage.getItem('clinicInfo');
      
      if (savedToken && savedClinicInfo) {
        setToken(savedToken);
        setClinicInfo(JSON.parse(savedClinicInfo));
      }
    } catch (error) {
      console.error('Failed to load clinic data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, info: ClinicInfo) => {
    try {
      await AsyncStorage.setItem('clinicToken', newToken);
      await AsyncStorage.setItem('clinicInfo', JSON.stringify(info));
      setToken(newToken);
      setClinicInfo(info);
    } catch (error) {
      console.error('Failed to save clinic data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('clinicToken');
      await AsyncStorage.removeItem('clinicInfo');
      setToken(null);
      setClinicInfo(null);
    } catch (error) {
      console.error('Failed to remove clinic data:', error);
    }
  };

  return (
    <ClinicAuthContext.Provider
      value={{
        token,
        clinicInfo,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </ClinicAuthContext.Provider>
  );
};

export const useClinicAuth = () => {
  const context = useContext(ClinicAuthContext);
  if (!context) {
    throw new Error('useClinicAuth must be used within a ClinicAuthProvider');
  }
  return context;
};
