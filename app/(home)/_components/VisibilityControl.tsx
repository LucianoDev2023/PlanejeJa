"use client"; // Certifique-se de que este é um Client Component

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface VisibilityControlProps {
  children: (isVisible: boolean, toggleVisibility: () => void) => JSX.Element;
}

const VisibilityControl = ({ children }: VisibilityControlProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = () => {
    setIsVisible((prevState) => !prevState);
  };

  return (
    <div>
      <button onClick={toggleVisibility} className="text-white">
        {isVisible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
      </button>
      {/* Chamando a função children e passando o JSX gerado como children */}
      {children(isVisible, toggleVisibility)}
    </div>
  );
};

export default VisibilityControl;
