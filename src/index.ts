import { ExClient } from './ExClient';
import { NoStackError } from './utils';

const client = new ExClient();

await client.build().catch(e => client.logger.error('Client build error: ', e));

process
    .on('exit', code => client.logger.info(`Node process exited with code ${code}.`))
    .on('warning', (...messages) => client.logger.warn(...messages))
    .on('unhandledRejection', reason =>
        client.logger.error(
            `UnhandledRejection: `,
            (reason as Error).stack ? reason : new NoStackError(reason as string),
        ),
    )
    .on('uncaughtException', error => client.logger.error('UncaughtException: ', error));

['SIGHUP', 'SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
        void client.shutdown().catch(console.error);
    });
});
