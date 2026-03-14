import { addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { isExitCommand, isMenuCommand, isPreRequestCommand } from './shared/navigation'

type FlowGetter = () => any

type HumanHandoffFlowDeps = {
    getWelcomeFlow: FlowGetter
    getPreRequestFlow: FlowGetter
}

export const createHumanHandoffFlow = ({ getWelcomeFlow, getPreRequestFlow }: HumanHandoffFlowDeps) =>
    addKeyword<Provider, Database>(['humano', 'asesor', 'persona', 'agente', 'contacto', '4', utils.setEvent('HUMAN_HANDOFF_FLOW')])
        .addAnswer(
            [
                'Este asistente realiza *atención inicial* y orientación básica sobre transporte especial en Bogotá.',
                'No confirma servicios ni hace despacho en tiempo real.',
                'Si deseas continuar, puedo ayudarte a dejar una *pre-solicitud* para revisión posterior por una persona del equipo.',
                '',
                'Escribe *solicitar* para dejar tus datos o *menu* para volver al inicio.',
            ].join('\n'),
            { capture: true },
            async (ctx, { gotoFlow, flowDynamic, fallBack }) => {
                if (isMenuCommand(ctx.body)) {
                    return gotoFlow(getWelcomeFlow())
                }

                if (isPreRequestCommand(ctx.body)) {
                    return gotoFlow(getPreRequestFlow())
                }

                if (isExitCommand(ctx.body)) {
                    await flowDynamic('Entendido. Quedo atento si más adelante deseas volver. Escribe *menu* para retomar.')
                    return
                }

                return fallBack('Puedo ayudarte con *solicitar* para dejar la pre-solicitud o con *menu* para volver al inicio.')
            }
        )