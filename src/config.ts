import dotenv from 'dotenv';

// Load environment variables from .env file if present
dotenv.config();

interface AppConfig {
    cellsDirectory: string;
    debug: boolean;
}

const config: AppConfig = {
    cellsDirectory: process.env.CELLS_DIRECTORY ?? '../cells',
    debug: process.argv.includes('-v'),
};

export default config; 