import { dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';

import type { Client } from '../Client';

export const directoryName = (url: string): string => dirname(fileURLToPath(url));

export const loadModules = async <T>(client: Client, paths: string[]): Promise<Awaited<T>[]> => {
    const files: string[] = [];

    await Promise.all(
        paths.map(async path => {
            const sorted = await glob(path.split(sep).join('/'));

            sorted.forEach(file => {
                if (!files.includes(file)) files.push(`file:///${file}`);
            });
        }),
    );

    return Promise.all(
        files.map(file =>
            import(file).then(
                (module: { default: new (client: Client) => Promise<T> }) =>
                    new module.default(client),
            ),
        ),
    );
};
