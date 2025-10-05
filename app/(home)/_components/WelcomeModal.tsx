"use client";

import { useEffect, useState } from "react";

export default function WelcomeModal() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcomeModal");
    if (hasSeenWelcome !== "true") {
      setShowModal(true);
    }
  }, []);

  const closeModal = () => {
    setShowModal(false);
    localStorage.setItem("hasSeenWelcomeModal", "true");
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-xl rounded-lg border border-gray-500 bg-gray-800 p-4 shadow-lg">
        <button
          onClick={closeModal}
          className="absolute right-0 top-0 h-7 w-7 font-extrabold text-red-600 hover:text-gray-500"
        >
          ✕
        </button>

        <div className="aspect-video w-full">
          <video
            autoPlay
            playsInline
            controls
            controlsList="nofullscreen"
            className="h-full w-full rounded"
            src="videos/apresentation.mp4"
          >
            Seu navegador não suporta o vídeo.
          </video>
        </div>
      </div>
    </div>
  );
}
