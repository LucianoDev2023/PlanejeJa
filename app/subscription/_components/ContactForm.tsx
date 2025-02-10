// components/ContactForm.tsx
"use client"; // Diretiva para marcar o componente como Client Component

import React, { useState } from "react";
import emailjs from "emailjs-com";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Button } from "@/app/_components/ui/button";

interface ContactFormProps {
  email?: string;
  firstName?: string | null; // Permite null
}
const ContactForm: React.FC<ContactFormProps> = ({ email, firstName }) => {
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message.length <= 20) {
      alert("A mensagem precisa ter mais de 20 caracteres.");
      return;
    }

    const templateParams = {
      email,
      firstName,
      message,
    };

    try {
      const templateParams = {
        email,
        firstName,
        message,
      };

      const response = await emailjs.send(
        "planejejasuporte", // Serviço configurado no EmailJS
        "template_mic6tdd", // Template configurado no EmailJS
        templateParams,
        "g0W65rgaRXZBZi49N", // User ID do EmailJS
      );

      alert("Mensagem enviada com sucesso!");
      setMessage("");
    } catch (error) {
      console.log(templateParams);
      alert("Erro ao enviar a mensagem.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center gap-4"
    >
      <span className="w-full cursor-text rounded-md border border-gray-600 bg-transparent p-2 py-3 text-xs text-gray-500">
        Usuário: {firstName || "Faça o login"}
      </span>
      <span className="w-full cursor-text rounded-md border border-gray-600 bg-transparent p-2 py-3 text-xs text-gray-500">
        Email: {email || "Faça o login"}
      </span>

      <Textarea
        placeholder="Digite sua dúvida ou sugestão"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="cursor-text resize-none border border-gray-600 bg-transparent p-2 placeholder:text-xs"
      />
      <div className="flex w-full items-start justify-start gap-4">
        <Button
          type="button"
          onClick={() => {
            setMessage("");
          }}
          variant="ghost"
          className="border text-white"
        >
          Cancelar
        </Button>
        <Button type="submit" className="bg-[#2b4960] text-white">
          Enviar
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;
