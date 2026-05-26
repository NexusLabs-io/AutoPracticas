// AI Service for email data extraction
// Supports Groq and DeepSeek APIs

export type AIProvider = 'groq' | 'deepseek' | 'none';

export interface AIConfig {
  provider: AIProvider;
  groqApiKey: string;
  deepseekApiKey: string;
}

export interface ExtractedData {
  empresa: string;
  contacto: string;
  correoContacto: string;
  telefono: string;
  direccion: string;
  estado: 'pendiente' | 'aceptado' | 'rechazado' | 'en_espera';
  cuposDisponibles: number;
  observaciones: string;
}

const EXTRACTION_PROMPT = `Eres un asistente que extrae información de correos electrónicos de empresas que responden sobre pasantías o prácticas estudiantiles.

Del siguiente correo, extrae la información y responde SOLO con un JSON válido (sin markdown, sin explicaciones):

{
  "empresa": "nombre de la empresa",
  "contacto": "nombre de la persona de contacto",
  "correoContacto": "email del contacto",
  "telefono": "número de teléfono",
  "direccion": "dirección de la empresa",
  "estado": "aceptado|rechazado|en_espera|pendiente",
  "cuposDisponibles": 0,
  "observaciones": "notas importantes del correo"
}

Reglas:
- Si no encuentras un dato, deja el campo vacío "" o 0 para números
- "estado" debe ser:
  - "aceptado" si confirman disponibilidad, aceptan estudiantes, tienen cupos
  - "rechazado" si dicen que no pueden, no tienen capacidad, rechazan
  - "en_espera" si piden más información, dicen que lo evaluarán, contactar después
  - "pendiente" si no está claro
- "cuposDisponibles": extrae el número de estudiantes que pueden recibir
- "observaciones": información relevante como horarios, requisitos, fechas

CORREO:
---
De: {from}
Asunto: {subject}

{body}
---

Responde SOLO el JSON:`;

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.3-70b-specdec',
  'llama-3.1-8b-instant',
  'llama3-70b-8192',
  'mixtral-8x7b-32768',
  'gemma2-9b-it'
];

async function callGroq(apiKey: string, prompt: string): Promise<string> {
  let lastError: any = null;

  for (const model of GROQ_MODELS) {
    try {
      console.log(`AutoPrácticas: Intentando extracción con modelo Groq: ${model}`);
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content || '';
      } else {
        const errorText = await response.text();
        console.warn(`AutoPrácticas: El modelo ${model} falló con estado ${response.status}.`, errorText);
        lastError = new Error(`Groq API error (${model}): ${response.status} - ${errorText}`);
        // If it's a decommissioned model or not found, proceed to next one
        if (response.status === 400 || response.status === 404) {
          continue;
        } else {
          // For auth errors (401), stop and throw immediately
          throw lastError;
        }
      }
    } catch (err) {
      console.error(`AutoPrácticas: Excepción con modelo ${model}:`, err);
      lastError = err;
      // If it is an auth error or validation error thrown above, rethrow it
      if (err instanceof Error && err.message.includes('401')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Todos los modelos de Groq configurados fallaron o están descontinuados.');
}

async function callDeepSeek(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

function parseAIResponse(response: string): ExtractedData | null {
  try {
    // Clean the response - remove markdown code blocks if present
    let cleaned = response.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    return {
      empresa: parsed.empresa || '',
      contacto: parsed.contacto || '',
      correoContacto: parsed.correoContacto || parsed.email || '',
      telefono: parsed.telefono || '',
      direccion: parsed.direccion || '',
      estado: ['aceptado', 'rechazado', 'en_espera', 'pendiente'].includes(parsed.estado)
        ? parsed.estado
        : 'pendiente',
      cuposDisponibles: parseInt(parsed.cuposDisponibles) || 0,
      observaciones: parsed.observaciones || '',
    };
  } catch (e) {
    console.error('Error parsing AI response:', e, response);
    return null;
  }
}

export async function extractWithAI(
  config: AIConfig,
  email: { from: string; fromName: string; subject: string; body: string }
): Promise<ExtractedData | null> {
  const prompt = EXTRACTION_PROMPT
    .replace('{from}', `${email.fromName} <${email.from}>`)
    .replace('{subject}', email.subject)
    .replace('{body}', email.body.substring(0, 3000)); // Limit body size

  try {
    let response: string;

    if (config.provider === 'groq') {
      if (!config.groqApiKey) {
        throw new Error('API key de Groq no configurada');
      }
      response = await callGroq(config.groqApiKey, prompt);
    } else if (config.provider === 'deepseek') {
      if (!config.deepseekApiKey) {
        throw new Error('DeepSeek API key no configurada');
      }
      response = await callDeepSeek(config.deepseekApiKey, prompt);
    } else {
      return null;
    }

    return parseAIResponse(response);
  } catch (error) {
    console.error('AI extraction error:', error);
    throw error;
  }
}

// Test connection
export async function testAIConnection(config: AIConfig): Promise<{ success: boolean; message: string }> {
  try {
    const testPrompt = 'Responde solo con: {"test": "ok"}';

    if (config.provider === 'groq') {
      if (!config.groqApiKey) {
        return { success: false, message: 'API key de Groq no configurada' };
      }
      await callGroq(config.groqApiKey, testPrompt);
      return { success: true, message: 'Conexión con Groq exitosa' };
    } else if (config.provider === 'deepseek') {
      if (!config.deepseekApiKey) {
        return { success: false, message: 'API key de DeepSeek no configurada' };
      }
      await callDeepSeek(config.deepseekApiKey, testPrompt);
      return { success: true, message: 'Conexión con DeepSeek exitosa' };
    }

    return { success: true, message: 'Modo sin IA (regex)' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error de conexión'
    };
  }
}
