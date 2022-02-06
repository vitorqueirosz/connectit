import express from 'express';
import { routes } from 'routes';

const PORT = 3333;

const app = express();
app.use(express.json());
app.use(routes);

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`Running at port ${PORT}!`));
