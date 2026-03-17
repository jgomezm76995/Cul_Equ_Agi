import { addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import {
    isExitCommand,
    isHumanCommand,
    isMenuCommand,
    isPreRequestCommand,
} from './shared/navigation'
import { findAnswer } from '../utils/faq-matcher'

type FlowGetter = () => any

type FaqFlowDeps = {
    getWelcomeFlow: FlowGetter
    getPreRequestFlow: FlowGetter
    getHumanHandoffFlow: FlowGetter
}

export const createFaqFlow = ({ getWelcomeFlow, getPreRequestFlow, getHumanHandoffFlow }: FaqFlowDeps) =>
    addKeyword<Provider, Database>(['faq', 'preguntas', 'preguntas frecuentes', 'dudas', '2', utils.setEvent('FAQ_FLOW')])
        .addAnswer(
            [
                '❓ *Base de conocimiento*',
                'Escribe tu pregunta con tus propias palabras y buscaré la mejor respuesta.',
                '',
                'Ejemplos: "¿cuál es el horario?", "cómo cancelo una solicitud", "qué datos necesitan"',
                '',
                'También puedes escribir *humano* para hablar con una persona, o *menu* para volver.',
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

                const match = findAnswer(ctx.body)

                if (!match) {
                    return fallBack(
                        '🔎 No encontré una respuesta exacta para eso. Intenta con otras palabras, escribe *humano* para atención personalizada, o *menu* para volver al inicio.'
                    )
                }

                await flowDynamic([
                    `*${match.question}*`,
                    '',
                    match.answer,
                    '',
                    '¿Tienes otra pregunta? Escríbela directamente. O usa *menu* para volver al inicio.',
                ].join('\n'))

                return fallBack(
                    '¿Tienes otra pregunta? Escríbela o usa *menu* / *humano*.'
                )
            }
        )