import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { GoogleGenAI } from '@google/genai';

const CardSchema = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string(),
  uprightKeywords: z.array(z.string()),
  reversedKeywords: z.array(z.string()),
  description: z.string(),
  reversed: z.boolean(),
});

function getFallbackReading(name: string, cards: Array<{ name: string; reversed?: boolean }>) {
  const [past, present, future] = cards;
  return `Hola ${name}, vamos a ver qué dicen las cartas.

En el pasado, ${past.name} ${past.reversed ? 'invertida' : 'al derecho'} marca el punto de partida de lo que estás viviendo. Algo de esa etapa todavía influye en tu situación actual.

En el presente, ${present.name} ${present.reversed ? 'invertida' : 'al derecho'} refleja lo que está pasando ahora mismo. Esta carta te pide que prestes atención a cómo estás manejando la situación en este momento.

Para el futuro, ${future.name} ${future.reversed ? 'invertida' : 'al derecho'} muestra hacia dónde se dirigen las cosas si seguís el camino actual. No es inevitable, pero es la tendencia más probable.

Mi consejo: revisá qué de tu pasado todavía estás cargando sin necesidad, y enfocate en lo que sí podés cambiar hoy.`;
}

export const server = {
  tarot: {
    consult: defineAction({
      input: z.object({
        name: z.string().min(1).max(60),
        question: z.string().min(1).max(500),
        cards: z.array(CardSchema).length(3),
      }),
      handler: async ({ name, question, cards }) => {
        const apiKey = import.meta.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('GEMINI_API_KEY no configurada');
        }

        const ai = new GoogleGenAI({ apiKey });

        const positions = ['Pasado', 'Presente', 'Futuro'] as const;
        const cardsText = cards
          .map((card, i) => {
            const orientation = card.reversed ? 'invertida' : 'al derecho';
            const keywords = card.reversed ? card.reversedKeywords : card.uprightKeywords;
            return `• ${positions[i]}: ${card.name} (${orientation}) — ${card.description}. Energías: ${keywords.join(', ')}.`;
          })
          .join('\n');

        const prompt = `Actúa como Seraphina, una tarotista profesional y empática. Tu estilo es cálido pero directo y práctico. No usas palabras complicadas ni eres excesivamente mística. Tu objetivo es ayudar a la persona con consejos que pueda aplicar mañana mismo.

DATOS:
- Nombre: ${name}
- Pregunta: "${question}"
- Cartas: ${cardsText}

REGLAS DE ESCRITURA:
1. Sé breve: La lectura completa NO debe superar las 250 palabras.
2. Lenguaje claro: Habla como una amiga sabia, no como un libro antiguo. Evita palabras como "tapiz del universo", "susurros", "vibrar" o "centurias".
3. Estructura directa:
   - APERTURA: Hola ${name}, vamos a ver qué dicen las cartas sobre tu pregunta. (Máximo 2 frases).
   - PASADO: Lo que te trajo aquí.
   - PRESENTE: Lo que pasa ahora.
   - FUTURO: Lo que viene.
   - CONSEJO: Un paso práctico a seguir.
4. Tono: Positivo y constructivo, pero realista.

IMPORTANTE: No uses formato Markdown (sin negritas ni asteriscos). Responde en español y ve al grano.

RESTRICCIONES: Si la pregunta trata sobre salud, enfermedades, diagnósticos médicos o embarazo, no respondas la consulta de tarot. En su lugar, indica amablemente que este servicio no aborda temas de salud y recomienda consultar a un profesional médico.`;

        const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
        let reading: string | undefined;

        for (const model of models) {
          try {
            const response = await ai.models.generateContent({ model, contents: prompt });
            if (response.text) {
              reading = response.text;
              break;
            }
          } catch (err: any) {
            if (err?.status === 429) continue;
            break;
          }
        }

        reading ??= getFallbackReading(name, cards);

        return { reading };
      },
    }),
  },
};
