import faqKnowledge from '../data/faq-knowledge.json'

export interface FaqEntry {
    id: number
    keywords: string[]
    question: string
    answer: string
}

const entries = faqKnowledge as FaqEntry[]

/**
 * Normaliza texto: minúsculas, sin tildes, sin signos de puntuación.
 */
const normalize = (text: string): string =>
    text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

/**
 * Busca en la base de conocimiento la entrada que mejor coincida con la pregunta.
 * Devuelve la entrada con más coincidencias de palabras clave, o null si ninguna supera el umbral.
 */
export const findAnswer = (userInput: string): FaqEntry | null => {
    const words = normalize(userInput).split(' ').filter(Boolean)

    if (words.length === 0) {
        return null
    }

    let bestMatch: FaqEntry | null = null
    let bestScore = 0

    for (const entry of entries) {
        const normalizedKeywords = entry.keywords.map(normalize)
        const inputText = normalize(userInput)

        let score = 0

        for (const kw of normalizedKeywords) {
            if (inputText.includes(kw)) {
                // Frases clave largas pesan más que palabras sueltas
                score += kw.split(' ').length
            }
        }

        if (score > bestScore) {
            bestScore = score
            bestMatch = entry
        }
    }

    // Umbral mínimo: al menos 1 coincidencia de keyword
    return bestScore >= 1 ? bestMatch : null
}

/**
 * Devuelve todas las entradas de la base de conocimiento, útil para listar temas disponibles.
 */
export const getAllEntries = (): FaqEntry[] => entries
