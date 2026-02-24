import { createContext, useContext } from 'react';

// 1. Create the Context
export const TripContext = createContext(null);

// 2. Create a custom hook to consume the data easily
export function useTrip() {
  const context = useContext(TripContext);
  
  // This is a safety check to help you catch errors if you try to use 
  // the hook outside of the layout provider!
  if (context === null) {
    throw new Error("useTrip must be used within a TripInfoLayout");
  }
  
  return context;
}