import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`Sari-Sari Analytics API listening on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
