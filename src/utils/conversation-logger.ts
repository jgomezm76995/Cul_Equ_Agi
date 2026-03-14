const ANSI_RESET = '\u001b[0m'

const COLOR_PALETTE = [
    '\u001b[31m',
    '\u001b[32m',
    '\u001b[33m',
    '\u001b[34m',
    '\u001b[35m',
    '\u001b[36m',
    '\u001b[91m',
    '\u001b[92m',
    '\u001b[94m',
    '\u001b[95m',
]

const EVENT_PREFIXES = ['_event_', 'event_', 'ORDER_', 'LOCATION_']

type MessagePayload = {
    from?: string
    body?: string
    name?: string
}

const colorByConversation = new Map<string, string>()
let colorCursor = 0

const getTimestamp = (): string => new Date().toLocaleTimeString('es-CO', { hour12: false })

const normalizeContactId = (value: string | undefined): string => (value ?? 'desconocido').replace(/@.*/, '')

const getConversationColor = (conversationId: string): string => {
    const existingColor = colorByConversation.get(conversationId)

    if (existingColor) {
        return existingColor
    }

    const nextColor = COLOR_PALETTE[colorCursor % COLOR_PALETTE.length]
    colorCursor += 1
    colorByConversation.set(conversationId, nextColor)

    return nextColor
}

const shouldSkipBody = (body: string): boolean => {
    if (!body.trim()) {
        return true
    }

    return EVENT_PREFIXES.some((prefix) => body.includes(prefix))
}

const formatContent = (content: unknown, options?: { media?: unknown }): string => {
    if (typeof content === 'string' && content.trim()) {
        return content
    }

    if (Array.isArray(content) && content.length > 0) {
        return content.map((item) => String(item)).join(' | ')
    }

    if (options?.media) {
        return '[mensaje con media]'
    }

    if (content && typeof content === 'object') {
        return '[mensaje estructurado]'
    }

    return '[mensaje vacío]'
}

const printConversationLine = (conversationId: string, actorLabel: string, message: string, name?: string): void => {
    const color = getConversationColor(conversationId)
    const contactLabel = name ? `${name} · ${conversationId}` : conversationId
    const line = `[${getTimestamp()}] [${contactLabel}] ${actorLabel}: ${message}`

    console.log(`${color}${line}${ANSI_RESET}`)
}

export const logIncomingConversation = (payload: MessagePayload): void => {
    const conversationId = normalizeContactId(payload.from)
    const message = payload.body ?? ''

    if (shouldSkipBody(message)) {
        return
    }

    printConversationLine(conversationId, '👤 Usuario', message.trim(), payload.name)
}

export const logOutgoingConversation = (
    userId: string,
    content: unknown,
    options?: { media?: unknown }
): void => {
    const conversationId = normalizeContactId(userId)
    const message = formatContent(content, options)

    printConversationLine(conversationId, '🤖 Bot', message)
}