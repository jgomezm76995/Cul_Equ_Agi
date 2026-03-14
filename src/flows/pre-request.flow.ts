import { addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { isExitCommand, isHumanCommand, isMenuCommand } from './shared/navigation'

type FlowGetter = () => any

type PreRequestFlowDeps = {
    getWelcomeFlow: FlowGetter
    getHumanHandoffFlow: FlowGetter
}

const handleNavigationCommand = async (
    body: string,
    tools: any,
    getWelcomeFlow: FlowGetter,
    getHumanHandoffFlow: FlowGetter
): Promise<boolean> => {
    if (isMenuCommand(body)) {
        await tools.gotoFlow(getWelcomeFlow())
        return true
    }

    if (isHumanCommand(body)) {
        await tools.gotoFlow(getHumanHandoffFlow())
        return true
    }

    if (isExitCommand(body)) {
        await tools.flowDynamic('Proceso detenido. Puedes escribir *menu* cuando desees retomarlo.')
        return true
    }

    return false
}

export const createPreRequestFlow = ({ getWelcomeFlow, getHumanHandoffFlow }: PreRequestFlowDeps) =>
    addKeyword<Provider, Database>([
        'solicitar',
        'solicitud',
        'pre solicitud',
        'pre-solicitud',
        'prereserva',
        'pre reserva',
        'reserva',
        '3',
        utils.setEvent('PRE_REQUEST_FLOW'),
    ])
        .addAnswer(
            [
                'Vamos a registrar una *pre-solicitud* de transporte especial.',
                'Recuerda que esto es una atención inicial y la información quedará sujeta a revisión posterior.',
                'En cualquier momento puedes escribir *menu* para volver al inicio o *humano* para pedir derivación.',
            ].join('\n')
        )
        .addAnswer('1/7. ¿Cuál es tu nombre completo?', { capture: true }, async (ctx, { state, fallBack, ...tools }) => {
            if (await handleNavigationCommand(ctx.body, tools, getWelcomeFlow, getHumanHandoffFlow)) {
                return
            }

            if (!ctx.body.trim()) {
                return fallBack('Necesito tu nombre para continuar. También puedes escribir *menu* o *humano*.')
            }

            await state.update({ name: ctx.body.trim() })
        })
        .addAnswer('2/7. ¿Cuál es tu teléfono o medio de contacto?', { capture: true }, async (ctx, { state, fallBack, ...tools }) => {
            if (await handleNavigationCommand(ctx.body, tools, getWelcomeFlow, getHumanHandoffFlow)) {
                return
            }

            if (!ctx.body.trim()) {
                return fallBack('Necesito un medio de contacto para continuar. También puedes escribir *menu* o *humano*.')
            }

            await state.update({ contact: ctx.body.trim() })
        })
        .addAnswer('3/7. ¿Cuál es el origen del traslado?', { capture: true }, async (ctx, { state, fallBack, ...tools }) => {
            if (await handleNavigationCommand(ctx.body, tools, getWelcomeFlow, getHumanHandoffFlow)) {
                return
            }

            if (!ctx.body.trim()) {
                return fallBack('Indica el origen del traslado. También puedes escribir *menu* o *humano*.')
            }

            await state.update({ origin: ctx.body.trim() })
        })
        .addAnswer('4/7. ¿Cuál es el destino del traslado?', { capture: true }, async (ctx, { state, fallBack, ...tools }) => {
            if (await handleNavigationCommand(ctx.body, tools, getWelcomeFlow, getHumanHandoffFlow)) {
                return
            }

            if (!ctx.body.trim()) {
                return fallBack('Indica el destino del traslado. También puedes escribir *menu* o *humano*.')
            }

            await state.update({ destination: ctx.body.trim() })
        })
        .addAnswer('5/7. ¿Para qué fecha u hora estimada necesitas el servicio?', { capture: true }, async (ctx, { state, fallBack, ...tools }) => {
            if (await handleNavigationCommand(ctx.body, tools, getWelcomeFlow, getHumanHandoffFlow)) {
                return
            }

            if (!ctx.body.trim()) {
                return fallBack('Necesito una fecha o momento estimado. También puedes escribir *menu* o *humano*.')
            }

            await state.update({ schedule: ctx.body.trim() })
        })
        .addAnswer('6/7. ¿Qué tipo de necesidad tienes? Ejemplo: movilidad asistida, traslado programado, acompañamiento.', { capture: true }, async (ctx, { state, fallBack, ...tools }) => {
            if (await handleNavigationCommand(ctx.body, tools, getWelcomeFlow, getHumanHandoffFlow)) {
                return
            }

            if (!ctx.body.trim()) {
                return fallBack('Describe brevemente tu necesidad. También puedes escribir *menu* o *humano*.')
            }

            await state.update({ needType: ctx.body.trim() })
        })
        .addAnswer('7/7. Si deseas, agrega observaciones básicas o escribe *ninguna*.', { capture: true }, async (ctx, { state, ...tools }) => {
            if (await handleNavigationCommand(ctx.body, tools, getWelcomeFlow, getHumanHandoffFlow)) {
                return
            }

            await state.update({ notes: ctx.body.trim() || 'Sin observaciones adicionales' })
        })
        .addAction(async (_, { flowDynamic, state }) => {
            await flowDynamic(
                [
                    '✅ Tu pre-solicitud inicial quedó registrada con estos datos:',
                    `• Nombre: ${state.get('name')}`,
                    `• Contacto: ${state.get('contact')}`,
                    `• Origen: ${state.get('origin')}`,
                    `• Destino: ${state.get('destination')}`,
                    `• Momento estimado: ${state.get('schedule')}`,
                    `• Necesidad: ${state.get('needType')}`,
                    `• Observaciones: ${state.get('notes')}`,
                    '',
                    'Un miembro del equipo deberá revisar posteriormente esta información antes de cualquier confirmación.',
                    'Si deseas volver al inicio, escribe *menu*. Si requieres orientación humana, escribe *humano*.',
                ].join('\n')
            )
        })