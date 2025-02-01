import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    console.log("Webhook recebido:", req.body);

    return res.status(200).json({ message: "Webhook recebido com sucesso" });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return res.status(400).json({ error: "Erro no processamento do webhook" });
  }
}
