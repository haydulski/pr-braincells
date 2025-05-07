import dotenv from 'dotenv';

// Load environment variables from .env file if present
dotenv.config();

interface AppConfig {
    celsDirectory: string;
}

const config: AppConfig = {
    celsDirectory: process.env.CELLS_DIRECTORY ?? '../cells',
};

export default config; 