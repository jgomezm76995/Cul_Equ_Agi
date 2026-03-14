export const normalizeText = (value: string | undefined | null): string =>
    (value ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()

export const isMenuCommand = (value: string): boolean =>
    ['menu', 'inicio', 'volver', 'regresar', 'reiniciar', 'start'].includes(normalizeText(value))

export const isExitCommand = (value: string): boolean =>
    ['salir', 'cancelar', 'terminar', 'adios', 'gracias', 'fin'].includes(normalizeText(value))

export const isHumanCommand = (value: string): boolean =>
    ['humano', 'asesor', 'persona', 'agente', 'contacto', '4'].includes(normalizeText(value))

export const isFaqCommand = (value: string): boolean =>
    ['faq', 'preguntas', 'preguntas frecuentes', 'dudas', '2'].includes(normalizeText(value))

export const isServiceInfoCommand = (value: string): boolean =>
    ['info', 'informacion', 'servicio', '1'].includes(normalizeText(value))

export const isPreRequestCommand = (value: string): boolean =>
    [
        'solicitar',
        'solicitud',
        'pre solicitud',
        'pre-solicitud',
        'prereserva',
        'pre reserva',
        'reserva',
        '3',
    ].includes(normalizeText(value))