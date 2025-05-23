import config from './config.js';

export const logger = {
    debug: (message: string) => config.debug && console.error(`DEBUG: ${message}`)
};