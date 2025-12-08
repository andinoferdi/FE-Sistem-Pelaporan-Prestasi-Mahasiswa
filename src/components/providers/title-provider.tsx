'use client';

import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface TitleContextType {
  title: string;
  setTitle: (title: string) => void;
}

const TitleContext = createContext<TitleContextType | undefined>(undefined);

export const useTitleContext = () => {
  const context = useContext(TitleContext);
  if (context === undefined) {
    throw new Error('useTitleContext must be used within a TitleProvider');
  }
  return context;
};

interface TitleProviderProps {
  children: ReactNode;
}

export const TitleProvider = ({ children }: TitleProviderProps) => {
  const [title, setTitle] = useState('Dashboard');
  const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Sistem Pelaporan Prestasi Mahasiswa';

  useEffect(() => {
    document.title = `${title} - ${APP_NAME}`;
  }, [title, APP_NAME]);

  return <TitleContext.Provider value={{ title, setTitle }}>{children}</TitleContext.Provider>;
};
