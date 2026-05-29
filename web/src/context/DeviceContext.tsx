import { createContext, useContext, type ReactNode } from "react";

interface DeviceContextValue {
  isMobile: boolean;
}

const DeviceContext = createContext<DeviceContextValue>({ isMobile: false });

// Evaluated once at module load — doesn't change during session
const isMobileDevice = window.matchMedia("(pointer: coarse)").matches;

export function DeviceProvider({ children }: { children: ReactNode }) {
  return (
    <DeviceContext.Provider value={{ isMobile: isMobileDevice }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}
