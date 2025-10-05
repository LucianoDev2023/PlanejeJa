// components/VisibilityToggle.tsx
"use client"; // Certifica-se de que este componente seja tratado como um componente cliente

import { useState } from "react";

interface VisibilityToggleProps {
  onChange: (visible: boolean) => void;
}

const VisibilityToggle = ({ onChange }: VisibilityToggleProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    onChange(newVisibility); // Passa a visibilidade para o componente pai
  };

  return (
    <button onClick={toggleVisibility}>
      {isVisible ? "Ocultar" : "Mostrar"} Conteúdo
    </button>
  );
};

export default VisibilityToggle;
