import config from './config.js';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

export const logger = {
    debug: (message: string) => {
        if (config.debug) {
            process.stderr.write(`${colors.cyan}DEBUG:${colors.reset} ${message}\n`);
        }
    }
};