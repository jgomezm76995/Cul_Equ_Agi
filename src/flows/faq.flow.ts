import { addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import {
    isExitCommand,
    isHumanCommand,
    isMenuCommand,
    isPreRequestCommand,
    normalizeText,
} from './shared/navigation'

type FlowGetter = () => any

type FaqFlowDeps = {
    getWelcomeFlow: FlowGetter
    getPreRequestFlow: FlowGetter
    getHumanHandoffFlow: FlowGetter
}

const faqAnswers: Record<string, string> = {
    solicitar:
        'Para iniciar, debes compartir datos básicos como nombre, contacto, origen, destino, momento estimado del traslado, tipo de necesidad y observaciones.',
    datos:
        'Los datos mínimos del MVP son: nombre, teléfono o medio de contacto, origen, destino, fecha o momento estimado, tipo de necesidad y observaciones.',
    proceso:
        'El proceso es: orientación inicial, captura de la pre-solicitud y revisión posterior por una persona del equipo antes de cualquier confirmación.',
    alcance:
        'El bot informa, guía y recoge datos iniciales. No agenda definitivamente, no cobra y no despacha servicios reales.',
    humano:
        'Si necesitas continuidad con una persona, el bot te orienta a dejar tu pre-solicitud para revisión posterior por atención humana.',
}

export const createFaqFlow = ({ getWelcomeFlow, getPreRequestFlow, getHumanHandoffFlow }: FaqFlowDeps) =>
    addKeyword<Provider, Database>(['faq', 'preguntas', 'preguntas frecuentes', 'dudas', '2', utils.setEvent('FAQ_FLOW')])
        .addAnswer(
            [
                'Estas son las preguntas frecuentes que puedo resolver:',
                '• *solicitar*: cómo se solicita el servicio',
                '• *datos*: qué información necesitas compartir',
                '• *proceso*: cómo sigue la atención después del bot',
                '• *alcance*: qué hace el bot y qué no hace',
                '• *humano*: cómo continuar con atención humana',
                '',
                'Escribe una opción, o usa *menu* para volver.',
            ].join('\n'),
            { capture: true },
            async (ctx, { gotoFlow, flowDynamic, fallBack }) => {
                if (isMenuCommand(ctx.body)) {
                    return gotoFlow(getWelcomeFlow())
                }

                if (isPreRequestCommand(ctx.body)) {
                    return gotoFlow(getPreRequestFlow())
                }

                if (isHumanCommand(ctx.body)) {
                    return gotoFlow(getHumanHandoffFlow())
                }

                if (isExitCommand(ctx.body)) {
                    await flowDynamic('Perfecto. Si más adelante quieres retomar, escribe *menu*.')
                    return
                }

                const option = normalizeText(ctx.body)
                const answer = faqAnswers[option]

                if (!answer) {
                    return fallBack('No entendí esa FAQ. Escribe *solicitar*, *datos*, *proceso*, *alcance*, *humano* o *menu*.')
                }

                await flowDynamic(answer)
                return fallBack('Si quieres otra respuesta frecuente, escribe otra opción. También puedes usar *solicitar*, *humano* o *menu*.')
            }
        )