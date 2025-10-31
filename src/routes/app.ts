

import express, { Application, Request, Response } from 'express';
import * as dotenv from "dotenv";  
dotenv.config();
import models from '../models';
import { mailRouter } from './mailRoutes';
import { paymentRouter } from "./paymentRoutes";
import petsRouter from './pets';


console.log("STRIPE_SECRET_KEY =", process.env.STRIPE_SECRET_KEY); 

console.log("MAILTRAP_USER =", process.env.MAILTRAP_USER);
console.log("MAILTRAP_PASS =", process.env.MAILTRAP_PASS);
console.log("MAILTRAP_HOST =", process.env.MAILTRAP_HOST);
console.log("MAILTRAP_PORT =", process.env.MAILTRAP_PORT);

export const app: Application = express();
const PORT: number = 3005;

// Parse JSON bodies
app.use(express.json());


// Initialize SQLite + Sequelize and sync models
const inTest = process.env.NODE_ENV === 'test';
const { sequelize } = models;

// Fonction pour synchroniser la base de données
export const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
  } catch (err) {
    console.error('Database sync error:', err);
    throw err;
  }
};

// Synchroniser immédiatement en mode non-test
if (!inTest) {
  syncDatabase();
}

app.get('/', (_: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

app.post('/animals', async (req: Request, res: Response) => {
  console.info('Received animal creation request:', req.body);
  const created = await models.Animal.create(req.body);
  res.status(201).json({ created });
});

app.post('/organizations', async (req: Request, res: Response) => {
  console.info('Received organization creation request:', req.body);
  try {
    const created = await models.Organization.create(req.body);
    res.status(201).json({ created });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: error.message });
  }
});

app.use(mailRouter);
app.use(paymentRouter);
app.use(petsRouter);

app.post('/users', async (req: Request, res: Response) => {
  console.info('Received user creation request:', req.body);
  const created = await models.User.create(req.body);
  res.status(201).json({ created });
});

// Only start server when not under test
if (!inTest) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

