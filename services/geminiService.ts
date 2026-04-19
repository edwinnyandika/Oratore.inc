import { GoogleGenAI, Type } from "@google/genai";

const EXCHANGE_API_KEY = '076ab755d3454343b1b3e845331183c0';
const BASE_EXCHANGE_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest`;

// Use gemini-3-pro-preview for advanced reasoning and financial analysis
const MODEL_NAME = 'gemini-3-pro-preview';

const STATIC_RATES: Record<string, number> = {
    USD: 1, 
    EUR: 0.92, 
    GBP: 0.79, 
    CAD: 1.35, 
    AUD: 1.52, 
    JPY: 150.1, 
    KES: 145.5, 
    CNY: 7.19, 
    INR: 83.1, 
    CHF: 0.88,
    NGN: 1500,
    ZAR: 19.1
};

// Major currencies to track for the dashboard
export const MAJOR_CURRENCIES = ['USD', 'EUR', 'GBP', 'KES', 'ZAR', 'NGN', 'JPY', 'CAD'];

// Analyze optimal send time based on client behavior tracking
export const analyzeOptimalSendTime = async (invoices: any[], clientName: string, clientTimezone: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Extract tracking timestamps for this specific client or similar clients
    const trackingData = invoices
        .filter(inv => inv.tracking && (inv.tracking.lastViewedAt || inv.tracking.lastOpenedAt))
        .map(inv => ({
            client: inv.clientName,
            viewedAt: inv.tracking.lastViewedAt,
            openedAt: inv.tracking.lastOpenedAt,
            timezone: inv.clientTimezone || 'UTC'
        }));

    const prompt = `
        Analyze the following invoice interaction history to find the optimal day and time to send a new invoice to "${clientName}".
        The client is in the "${clientTimezone}" timezone.
        
        Interaction History (timestamps are UTC):
        ${JSON.stringify(trackingData.slice(0, 30))}

        Rules:
        1. If there's enough history for "${clientName}", prioritize that.
        2. If not, suggest a general best practice for professional B2B services (e.g., Tuesday mornings).
        3. Convert the final recommendation to the client's timezone: ${clientTimezone}.
        
        Return a JSON object:
        {
            "bestDay": "string (e.g. Tuesday)",
            "bestTime": "string (e.g. 09:00 AM)",
            "explanation": "string (1 short sentence explaining why)",
            "probabilityOfFastPay": "number (percentage 0-100)",
            "isCustomToClient": "boolean"
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        bestDay: { type: Type.STRING },
                        bestTime: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        probabilityOfFastPay: { type: Type.NUMBER },
                        isCustomToClient: { type: Type.BOOLEAN }
                    },
                    required: ['bestDay', 'bestTime', 'explanation', 'probabilityOfFastPay']
                }
            }
        });
        return response.text ? JSON.parse(response.text) : null;
    } catch (error) {
        console.error("Optimal send time error:", error);
        return null;
    }
};

// Research market prices for a service
export const fetchMarketPriceSuggestions = async (serviceName: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform market research for the freelance service: "${serviceName}". 
    Provide typical pricing ranges (hourly or project-based) in USD.
    Return a JSON object with:
    - low: number (representative low-end price)
    - average: number (representative mid-market price)
    - high: number (representative high-end price)
    - unit: string (e.g., 'hourly' or 'per project')
    - context: string (1 sentence explaining the range)`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        low: { type: Type.NUMBER },
                        average: { type: Type.NUMBER },
                        high: { type: Type.NUMBER },
                        unit: { type: Type.STRING },
                        context: { type: Type.STRING }
                    }
                }
            }
        });
        const text = response.text;
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error("Pricing research error:", error);
        return null;
    }
};

// Translate invoice content (items and notes) to target language
export const translateInvoiceContent = async (items: any[], notes: string, targetLanguage: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
        Translate the following invoice content into ${targetLanguage}. 
        Keep the structure exactly the same. 
        Only translate the 'description' field in items and the 'notes' string.
        Ensure professional, context-aware translations for business services.

        Items: ${JSON.stringify(items.map(i => ({ description: i.description })))}
        Notes: "${notes}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        translatedItems: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    description: { type: Type.STRING }
                                }
                            }
                        },
                        translatedNotes: { type: Type.STRING }
                    }
                }
            }
        });
        const text = response.text;
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error("Translation error:", error);
        return null;
    }
};

// Detect the most likely locale tag based on an address
export const detectLocaleFromAddress = async (address: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Based on this address: "${address}", what is the most likely BCP 47 language tag for this client? 
  Return ONLY the tag from this list: en-US, es-ES, fr-FR, de-DE, sw-KE, zh-CN, ar-SA, pt-BR. 
  If unsure, return 'en-US'.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || 'en-US';
  } catch {
    return 'en-US';
  }
};

// Detect the most likely IANA timezone based on an address
export const detectTimezoneFromAddress = async (address: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Based on this address: "${address}", what is the most likely IANA timezone for this client? 
  Return ONLY the timezone string (e.g. 'America/New_York', 'Europe/London', 'Africa/Nairobi'). 
  If unsure, return 'UTC'.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || 'UTC';
  } catch {
    return 'UTC';
  }
};

// Calculate estimated tax liability based on annual income
export const calculateTaxLiability = async (annualIncome: number, currency: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
        You are a global freelance tax expert. 
        A freelancer has a projected annual income of ${annualIncome} ${currency}.
        Estimate their average tax liability based on global standards (range).
        Suggest a monthly savings amount to cover this.
        Provide a short advisory note on how to optimize taxes (e.g. expenses to track).
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        estimatedTaxRate: { type: Type.NUMBER, description: "Average percentage" },
                        taxAmount: { type: Type.NUMBER },
                        monthlySavingsSuggestion: { type: Type.NUMBER },
                        advisoryNote: { type: Type.STRING },
                        optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        const text = response.text;
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error("Tax calculation error:", error);
        return null;
    }
};

// Extract invoice data from natural language description
export const parseInvoiceRequest = async (request: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Extract invoice details from: "${request}".`;
  try {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    clientName: { type: Type.STRING },
                    projectDescription: { type: Type.STRING },
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                description: { type: Type.STRING },
                                quantity: { type: Type.NUMBER },
                                rate: { type: Type.NUMBER }
                            }
                        }
                    },
                    taxRate: { type: Type.NUMBER },
                    currency: { type: Type.STRING },
                    notes: { type: Type.STRING }
                }
            }
        }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) { return null; }
};

// generate list of invoice items from a prompt
export const generateInvoiceItems = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const fullPrompt = `Generate a list of invoice items (description, quantity, rate) based on this request: "${prompt}"`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              rate: { type: Type.NUMBER }
            },
            required: ['description', 'quantity', 'rate']
          }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    return [];
  }
};

// Analyze invoice notes for professional tone and missing details
export const analyzeInvoiceNotes = async (notes: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze these invoice notes and provide a short summary or suggestion for professional improvement: "${notes}"`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    return "";
  }
};

// Fetch currency conversion rates from API or fall back to static rates
export const getCurrencyConversionRate = async (from: string, to: string) => {
  if (from === to) return 1;
  try {
    const response = await fetch(`${BASE_EXCHANGE_URL}/${from}`);
    const data = await response.json();
    if (data.result === 'success' && data.conversion_rates) {
        return data.conversion_rates[to] || 1;
    }
    throw new Error('Invalid API response');
  } catch { 
      return (1 / (STATIC_RATES[from] || 1)) * (STATIC_RATES[to] || 1); 
  }
}

// Fetch all exchange rates for a given base currency
export const getExchangeRates = async (base: string = 'USD') => {
    try {
        const response = await fetch(`${BASE_EXCHANGE_URL}/${base}`);
        const data = await response.json();
        if (data.result === 'success' && data.conversion_rates) {
            return { rates: data.conversion_rates, lastUpdate: data.time_last_update_utc };
        }
        throw new Error('Invalid API response');
    } catch { 
        return { rates: STATIC_RATES, lastUpdate: "Offline Estimate" }; 
    }
}

// Predict payment forecast based on pending invoices
export const predictPaymentForecast = async (invoices: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const pending = invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue');
  if (pending.length === 0) return { confidenceScore: 100, predictedAmount: 0, analysis: "Cash flow stable.", schedule: [] };
  
  const prompt = `
    Analyze the following pending/overdue invoices for a freelancer. 
    Predict when they will likely be paid over the next 30 days. 
    Consider that Overdue invoices are high priority but may have delays. 
    Return a JSON object with: 
    - predictedAmount: Total expected in 30 days.
    - confidenceScore: Percentage (0-100).
    - analysis: A 1-2 sentence overview of cash health.
    - schedule: Array of 4 objects { period: "Week 1" | "Week 2" | "Week 3" | "Week 4", amount: number }.
    
    Invoices: ${JSON.stringify(pending.slice(0, 15).map(i => ({ number: i.invoiceNumber, total: i.total, due: i.dueDate, status: i.status })))}
  `;

  try {
      const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
              responseMimeType: 'application/json',
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      predictedAmount: { type: Type.NUMBER },
                      confidenceScore: { type: Type.NUMBER },
                      analysis: { type: Type.STRING },
                      schedule: {
                          type: Type.ARRAY,
                          items: {
                              type: Type.OBJECT,
                              properties: {
                                  period: { type: Type.STRING },
                                  amount: { type: Type.NUMBER }
                              }
                          }
                      }
                  }
              }
          }
      });
      return response.text ? JSON.parse(response.text) : null;
  } catch (error) { 
      console.error("Forecast Error:", error);
      return null; 
  }
}

// Generate financial insights from revenue and expenses
export const generateFinancialInsights = async (invoices: any[], expenses: any[]) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const rev = invoices.filter((i: any) => i.status === 'Paid').reduce((sum: number, i: any) => sum + i.total, 0);
    const pending = invoices.filter((i: any) => i.status === 'Pending' || i.status === 'Overdue').reduce((sum: number, i: any) => sum + i.total, 0);
    const exp = expenses.reduce((sum: number, i: any) => sum + i.amount, 0);
    
    const prompt = `Analyze these freelancer finances and provide a refined strategic analysis:
    - Cleared Revenue: ${rev}
    - Pending (Owed): ${pending}
    - Recorded Expenses: ${exp}
    
    Return a JSON object:
    {
      "healthScore": number (0-100),
      "summary": "1 sentence overview",
      "observations": ["bullet points about margins, risks, or successes"],
      "actionItems": ["highly specific actionable steps"],
      "advisoryTone": "A string describing the tone e.g. Positive, Urgent, or Cautionary"
    }`;

    try {
        const response = await ai.models.generateContent({ 
          model: 'gemini-3-flash-preview', 
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                healthScore: { type: Type.NUMBER },
                summary: { type: Type.STRING },
                observations: { type: Type.ARRAY, items: { type: Type.STRING } },
                actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                advisoryTone: { type: Type.STRING }
              },
              required: ["healthScore", "summary", "observations", "actionItems"]
            }
          }
        });
        return response.text ? JSON.parse(response.text) : null;
    } catch { return null; }
}

// Analyze client behavior based on activity history
export const analyzeClientBehavior = async (clientName: string, activity: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze the behavior of client "${clientName}" based on these activities: ${JSON.stringify(activity)}`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rating: { type: Type.STRING, description: "Rating like 'Excellent', 'Good', 'Average', 'Poor'" },
            summary: { type: Type.STRING },
            suggestion: { type: Type.STRING }
          },
          required: ['rating', 'summary', 'suggestion']
        }
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    return null;
  }
};

// Generate professional emails for clients based on type and context
export const generateClientEmail = async (clientName: string, type: string, context: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate a ${type} email for client "${clientName}" with context: "${context}". Keep it professional.`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    return "";
  }
};