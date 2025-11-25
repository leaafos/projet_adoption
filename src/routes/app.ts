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
    // En mode test, on force la recréation des tables pour éviter les conflits
    const isTest = process.env.NODE_ENV === 'test';
    await sequelize.sync({ force: isTest });
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

// GET /animals - Récupérer tous les animaux
app.get('/animals', async (_req: Request, res: Response) => {
  try {
    const animals = await models.Animal.findAll({
      include: [{
        model: models.Organization,
        as: 'organization'
      }]
    });
    res.status(200).json({ animals });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /animals/:id - Récupérer un animal spécifique
app.get('/animals/:id', async (req: Request, res: Response) => {
  try {
    const animal = await models.Animal.findByPk(req.params.id, {
      include: [{
        model: models.Organization,
        as: 'organization'
      }]
    });
    if (!animal) {
      return res.status(404).json({ error: "Animal not found" });
    }
    res.status(200).json({ animal });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /animals/:id - Mettre à jour un animal
app.put('/animals/:id', async (req: Request, res: Response) => {
  try {
    const animal = await models.Animal.findByPk(req.params.id);
    if (!animal) {
      return res.status(404).json({ error: "Animal not found" });
    }
    const updated = await animal.update(req.body);
    res.status(200).json({ updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /animals/:id - Supprimer un animal
app.delete('/animals/:id', async (req: Request, res: Response) => {
  try {
    const animal = await models.Animal.findByPk(req.params.id);
    if (!animal) {
      return res.status(404).json({ error: "Animal not found" });
    }
    await animal.destroy();
    res.status(200).json({ message: "Animal deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/organizations', async (req: Request, res: Response) => {
  console.info('Received organization creation request:', req.body);
  try {
    const created = await models.Organization.create(req.body);
    res.status(201).json({ created });
  } catch (error: any) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /organizations - Récupérer toutes les organisations
app.get('/organizations', async (_req: Request, res: Response) => {
  try {
    const organizations = await models.Organization.findAll();
    res.status(200).json({ organizations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /organizations/:id - Récupérer une organisation spécifique
app.get('/organizations/:id', async (req: Request, res: Response) => {
  try {
    const organization = await models.Organization.findByPk(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    res.status(200).json({ organization });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /organizations/:id - Mettre à jour une organisation
app.put('/organizations/:id', async (req: Request, res: Response) => {
  try {
    const organization = await models.Organization.findByPk(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    const updated = await organization.update(req.body);
    res.status(200).json({ updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /organizations/:id - Supprimer une organisation
app.delete('/organizations/:id', async (req: Request, res: Response) => {
  try {
    const organization = await models.Organization.findByPk(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    await organization.destroy();
    res.status(200).json({ message: "Organization deleted successfully" });
  } catch (error: any) {
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

