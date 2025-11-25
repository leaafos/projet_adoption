import 'dotenv/config';
import { Client } from '@petfinder/petfinder-js';

if (!process.env.PETFINDER_CLIENT_ID || !process.env.PETFINDER_CLIENT_SECRET) {
  throw new Error('Missing PETFINDER_CLIENT_ID or PETFINDER_CLIENT_SECRET');
}

export const pfClient = new Client({
  apiKey: process.env.PETFINDER_CLIENT_ID!,
  secret: process.env.PETFINDER_CLIENT_SECRET!,
});
