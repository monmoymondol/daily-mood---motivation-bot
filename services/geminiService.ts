
import { GoogleGenAI, Type } from "@google/genai";
import { Motivation } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const motivationSchema = {
    type: Type.OBJECT,
    properties: {
        quote: {
            type: Type.OBJECT,
            properties: {
                text: { 
                    type: Type.STRING,
                    description: "The motivational quote text."
                },
                author: { 
                    type: Type.STRING,
                    description: "The author of the quote. If unknown, attribute to 'Anonymous'."
                },
            },
            required: ["text", "author"],
        },
        thought: {
            type: Type.STRING,
            description: "A positive thought for the day, phrased as a short, uplifting statement.",
        },
        tip: {
            type: Type.STRING,
            description: "A small, actionable productivity tip for the day.",
        },
    },
    required: ["quote", "thought", "tip"],
};


export const getDailyMotivation = async (goals?: string): Promise<Motivation> => {
    try {
        const basePrompt = "Act as my motivational coach. Greet me with a unique motivational quote, a positive thought, and a small productivity tip for the day.";
        const fullPrompt = (goals && goals.trim() !== '')
            ? `${basePrompt} Please tailor your response to help me achieve the following goals: "${goals}"`
            : basePrompt;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: motivationSchema,
                temperature: 0.9, // A bit of creativity
            },
        });

        const jsonString = response.text.trim();
        const parsedData = JSON.parse(jsonString);
        
        // Basic validation
        if (
            !parsedData.quote ||
            typeof parsedData.quote.text !== 'string' ||
            typeof parsedData.quote.author !== 'string' ||
            typeof parsedData.thought !== 'string' ||
            typeof parsedData.tip !== 'string'
        ) {
            throw new Error('Invalid data structure received from API.');
        }

        return parsedData as Motivation;

    } catch (error) {
        console.error("Error fetching daily motivation:", error);
        throw new Error("Could not get a motivational message from the AI. Please try again.");
    }
};
