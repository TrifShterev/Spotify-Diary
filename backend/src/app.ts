import express from 'express';

export const app = express();

app.use(express.json());

app.get('/healthcheck', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
