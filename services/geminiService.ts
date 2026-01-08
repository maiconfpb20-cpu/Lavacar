
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getAIInsights = async (prompt: string) => {
  const ai = getAIClient();
  if (!ai) return "Configuração de IA não disponível.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `Você é o assistente inteligente "LavaCar Pro AI". Seu objetivo é ajudar gestores de lava-jatos a otimizar processos, gerir filas e melhorar o atendimento. Responda de forma profissional e direta.`,
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, tive um problema ao processar seu pedido. Tente novamente.";
  }
};
