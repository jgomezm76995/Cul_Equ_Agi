import { addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import {
    isExitCommand,
    isFaqCommand,
    isHumanCommand,
    isMenuCommand,
    isPreRequestCommand,
} from './shared/navigation'

type FlowGetter = () => any

type ServiceInfoFlowDeps = {
    getWelcomeFlow: FlowGetter
    getFaqFlow: FlowGetter
    getPreRequestFlow: FlowGetter
    getHumanHandoffFlow: FlowGetter
}

export const createServiceInfoFlow = ({
    getWelcomeFlow,
    getFaqFlow,
    getPreRequestFlow,
    getHumanHandoffFlow,
}: ServiceInfoFlowDeps) =>
    addKeyword<Provider, Database>(['info', 'informacion', 'servicio', '1', utils.setEvent('SERVICE_INFO_FLOW')])
        .addAnswer(
            [
                'El servicio está orientado a la *atención inicial* de personas que requieren transporte especial en Bogotá.',
                'Puede aplicar para necesidades de movilidad asistida, traslados programados o situaciones donde se requiere orientación previa.',
                'Este bot puede explicar el proceso, responder preguntas frecuentes y tomar una *pre-solicitud*.',
                'Este bot *no* confirma disponibilidad, no cobra, no despacha vehículos y no reemplaza la validación humana.',
            ].join('\n')
        )
        .addAnswer(
            'Escribe *faq* para preguntas frecuentes, *solicitar* para iniciar tu pre-solicitud, *humano* para derivación o *menu* para volver.',
            { capture: true },
            async (ctx, { gotoFlow, flowDynamic, fallBack }) => {
                if (isMenuCommand(ctx.body)) {
                    return gotoFlow(getWelcomeFlow())
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
                    await flowDynamic('Gracias por consultar. Si deseas continuar después, escribe *menu*.')
                    return
                }

                return fallBack('Puedes responder con *faq*, *solicitar*, *humano* o *menu*.')
            }
        )