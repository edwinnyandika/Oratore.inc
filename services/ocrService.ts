
import { GoogleGenAI, Type } from "@google/genai";

export interface ExtractedReceipt {
  merchantName: string;
  amount: number;
  date: string;
  category: 'Software' | 'Travel' | 'Office' | 'Subcontractor' | 'Other';
  confidence: number;
}

export const extractReceiptData = async (base64Image: string): Promise<ExtractedReceipt | null> => {
  // Create fresh instance before API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Remove data URL prefix if present
  const base64Data = base64Image.split(',')[1] || base64Image;

  const prompt = `
    Analyze this receipt image. Extract the following information as a JSON object:
    - merchantName: The name of the store or service provider.
    - amount: The total amount paid as a number.
    - date: The date of the transaction in YYYY-MM-DD format.
    - category: Choose the most likely one from: Software, Travel, Office, Subcontractor, Other.
    - confidence: A number from 0-100 representing your certainty.
    
    If the image is not a receipt or details are unreadable, return null.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchantName: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            category: { 
              type: Type.STRING, 
              enum: ['Software', 'Travel', 'Office', 'Subcontractor', 'Other'] 
            },
            confidence: { type: Type.NUMBER }
          },
          required: ['merchantName', 'amount', 'date', 'category']
        }
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Receipt OCR Error:", error);
    return null;
  }
};
