"use client";

import { useEffect } from "react";

export default function ResetTourFlag() {
  useEffect(() => {
    localStorage.setItem("hasSeenTour", "false");
  }, []);

  return null; // não renderiza nada
}
