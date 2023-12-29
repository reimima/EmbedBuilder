import type { Logger } from 'log4js';
import log4js from 'log4js';

// eslint-disable-next-line import/no-named-as-default-member
const { getLogger } = log4js;

export class Structure {
    protected readonly logger: Logger;

    protected constructor(category?: string) {
        this.logger = getLogger(category);
    }
}
