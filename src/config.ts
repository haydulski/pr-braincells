import dotenv from 'dotenv';

// Load environment variables from .env file if present
dotenv.config();

interface AppConfig {
    cellsDirectory: string;
}

const config: AppConfig = {
    cellsDirectory: process.env.CELLS_DIRECTORY ?? '../cells',
};

export default config; 