import type { InteractionResponse, Message } from 'discord.js';

export const delayDelete = (
    targets: (InteractionResponse | Message)[],
    seconds = 3,
): NodeJS.Timeout =>
    setTimeout(() => targets.map(async target => await target.delete()), seconds * 1000);
