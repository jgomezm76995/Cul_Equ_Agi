import 'dotenv/config'
import { createBot, createProvider, createFlow } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { createFaqFlow } from './flows/faq.flow'
import { goodbyeFlow } from './flows/goodbye.flow'
import { createHumanHandoffFlow } from './flows/human-handoff.flow'
import { createPreRequestFlow } from './flows/pre-request.flow'
import { createServiceInfoFlow } from './flows/service-info.flow'
import { createWelcomeFlow } from './flows/welcome.flow'

const originalConsoleInfo = console.info.bind(console)

console.info = (...args: unknown[]) => {
    if (args[0] === 'Closing session:') {
        return
    }

    originalConsoleInfo(...args)
}

const PORT = process.env.PORT ?? 3008
const BAILEYS_VERSION = [2, 3000, 1030780948] as const
const USE_PAIRING_CODE = process.env.USE_PAIRING_CODE === 'true'
const PHONE_NUMBER = process.env.PHONE_NUMBER?.trim() || null

const main = async () => {
    const flows: Record<string, any> = {}

    flows.preRequestFlow = createPreRequestFlow({
        getWelcomeFlow: () => flows.welcomeFlow,
        getHumanHandoffFlow: () => flows.humanHandoffFlow,
    })

    flows.humanHandoffFlow = createHumanHandoffFlow({
        getWelcomeFlow: () => flows.welcomeFlow,
        getPreRequestFlow: () => flows.preRequestFlow,
    })

    flows.faqFlow = createFaqFlow({
        getWelcomeFlow: () => flows.welcomeFlow,
        getPreRequestFlow: () => flows.preRequestFlow,
        getHumanHandoffFlow: () => flows.humanHandoffFlow,
    })

    flows.serviceInfoFlow = createServiceInfoFlow({
        getWelcomeFlow: () => flows.welcomeFlow,
        getFaqFlow: () => flows.faqFlow,
        getPreRequestFlow: () => flows.preRequestFlow,
        getHumanHandoffFlow: () => flows.humanHandoffFlow,
    })

    flows.welcomeFlow = createWelcomeFlow({
        getServiceInfoFlow: () => flows.serviceInfoFlow,
        getFaqFlow: () => flows.faqFlow,
        getPreRequestFlow: () => flows.preRequestFlow,
        getHumanHandoffFlow: () => flows.humanHandoffFlow,
    })

    const adapterFlow = createFlow([
        flows.welcomeFlow,
        flows.serviceInfoFlow,
        flows.faqFlow,
        flows.preRequestFlow,
        flows.humanHandoffFlow,
        goodbyeFlow,
    ])

    if (USE_PAIRING_CODE && !PHONE_NUMBER) {
        console.warn('USE_PAIRING_CODE está activo pero PHONE_NUMBER no fue configurado.')
    }

    const adapterProvider = createProvider(Provider, {
        timeRelease: 10800000,
        version: BAILEYS_VERSION as any,
        ...(USE_PAIRING_CODE && PHONE_NUMBER
            ? {
                usePairingCode: true,
                phoneNumber: PHONE_NUMBER,
            }
            : {}),
    })
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('PRE_REQUEST_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('FAQ_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    adapterProvider.server.get(
        '/v1/blacklist/list',
        handleCtx(async (bot, req, res) => {
            const blacklist = bot.blacklist.getList()
            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', blacklist }))
        })
    )


    httpServer(+PORT)
}

main()
