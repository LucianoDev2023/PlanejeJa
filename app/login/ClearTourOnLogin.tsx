"use client";

import { useEffect } from "react";

export function ClearTourOnLogin() {
  useEffect(() => {
    localStorage.removeItem("hasSeenTour");
  }, []);

  return null;
}
