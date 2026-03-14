import { addKeyword } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'

export const goodbyeFlow = addKeyword<Provider, Database>(['salir', 'cancelar', 'adios', 'gracias', 'fin']).addAnswer(
    [
        'Gracias por comunicarte con el asistente de atención inicial para transporte especial en Bogotá.',
        'Cuando quieras continuar, escribe *menu* o *hola* y con gusto retomamos.',
    ].join('\n')
)