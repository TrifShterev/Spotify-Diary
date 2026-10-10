import { app } from './app.ts';

const PORT = Number(process.env.PORT ?? 3030);

app.listen(PORT, () => {
  console.log(`Spotify Diary API listening on http://localhost:${PORT}`);
});
