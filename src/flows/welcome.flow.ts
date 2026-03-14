import { addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import {
    isExitCommand,
    isFaqCommand,
    isHumanCommand,
    isPreRequestCommand,
    isServiceInfoCommand,
} from './shared/navigation'

type FlowGetter = () => any

type WelcomeFlowDeps = {
    getServiceInfoFlow: FlowGetter
    getFaqFlow: FlowGetter
    getPreRequestFlow: FlowGetter
    getHumanHandoffFlow: FlowGetter
}

export const createWelcomeFlow = ({
    getServiceInfoFlow,
    getFaqFlow,
    getPreRequestFlow,
    getHumanHandoffFlow,
}: WelcomeFlowDeps) =>
    addKeyword<Provider, Database>([
        'hola',
        'buenas',
        'buenos dias',
        'buenas tardes',
        'hi',
        'hello',
        'menu',
        'inicio',
        'empezar',
        'ayuda',
        utils.setEvent('WELCOME_FLOW'),
    ])
        .addAnswer('👋 Hola, soy el asistente inicial para solicitudes de transporte especial en Bogotá.')
        .addAnswer(
            [
                'Puedo ayudarte a:',
                '1. Explicar de forma breve el servicio',
                '2. Responder preguntas frecuentes',
                '3. Registrar una pre-solicitud o pre-reserva',
                '4. Orientarte para continuar con atención humana',
                '',
                'Responde con *1*, *2*, *3*, *4* o con las palabras *info*, *faq*, *solicitar* o *humano*.',
            ].join('\n'),
            { capture: true },
            async (ctx, { gotoFlow, flowDynamic, fallBack }) => {
                if (isServiceInfoCommand(ctx.body)) {
                    return gotoFlow(getServiceInfoFlow())
                }

                if (isFaqCommand(ctx.body)) {
                    return gotoFlow(getFaqFlow())
                }

                if (isPreRequestCommand(ctx.body)) {
                    return gotoFlow(getPreRequestFlow())
                }

                if (isHumanCommand(ctx.body)) {
                    return gotoFlow(getHumanHandoffFlow())
                }

                if (isExitCommand(ctx.body)) {
                    await flowDynamic('Gracias por comunicarte. Si deseas volver más tarde, escribe *menu*.')
                    return
                }

                return fallBack('No entendí tu opción. Responde con *1*, *2*, *3*, *4*, *info*, *faq*, *solicitar* o *humano*.')
            }
        )