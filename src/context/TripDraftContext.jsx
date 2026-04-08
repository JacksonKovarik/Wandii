import React, { createContext, useContext, useMemo, useState } from "react";

const TripDraftContext = createContext(null);

const emptyDraft = {
  destination: "",
  tripName: "",
  startDate: null, // "YYYY-MM-DD"
  endDate: null,   // "YYYY-MM-DD"
  coverPhotoUri: null,
  budget: 0,
  vibe: "Relaxing",
  invitedConnectionIds: [],
};

export function TripDraftProvider({ children }) {
  const [draft, setDraft] = useState(emptyDraft);

  const value = useMemo(
    () => ({
      draft,
      setField: (key, value) => setDraft((d) => ({ ...d, [key]: value })),
      reset: () => setDraft(emptyDraft),
    }),
    [draft]
  );

  return <TripDraftContext.Provider value={value}>{children}</TripDraftContext.Provider>;
}

export function useTripDraft() {
  const ctx = useContext(TripDraftContext);
  if (!ctx) throw new Error("useTripDraft must be used inside TripDraftProvider");
  return ctx;
}