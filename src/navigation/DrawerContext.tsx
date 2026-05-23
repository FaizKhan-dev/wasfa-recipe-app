import React, { createContext, useContext } from 'react';

type DrawerControls = {
  openDrawer: () => void;
  closeDrawer: () => void;
  drawerOpen: boolean;
};

const DrawerContext = createContext<DrawerControls | null>(null);

export const DrawerProvider = DrawerContext.Provider;

export const useDrawerControls = () => {
  const context = useContext(DrawerContext);

  if (!context) {
    throw new Error('useDrawerControls must be used within a DrawerProvider');
  }

  return context;
};
