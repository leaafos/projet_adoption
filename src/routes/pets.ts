import { Router } from 'express';
import { pfClient } from '../services/petfinderClient';

const router = Router();

/**
 * GET /api/pets?type=cat&location=Paris,FR&distance=100&page=1&limit=20
 * Renvoie un “proxy” propre côté backend (CORS, secret protégé).
 */
router.get('/animal', async (req, res) => {
  try {
    const { id, organizationId, type, size, genre, breed, age, description, status, color, coat, name, good_with_children, good_with_dogs, good_with_cats, house_trained, declawed, special_needs} = req.query;

    const response = await pfClient.animal.search({
        type: (type as string) || undefined,
        id: id ? parseInt(id as string, 10) : undefined,
        organizationId: (organizationId as string) || undefined,
        size: (size as string) || undefined,
        genre: (genre as string) || undefined,
        breed: (breed as string) || undefined,
        age: (age as string) || undefined,
        description: (description as string) || undefined,
        status: (status as string) || undefined,
        color: (color as string) || undefined,
        coat: (coat as string) || undefined,
        name: (name as string) || undefined,
        good_with_children: good_with_children ? (good_with_children === 'true') : undefined,
        good_with_dogs: good_with_dogs ? (good_with_dogs === 'true') : undefined,
        good_with_cats: good_with_cats ? (good_with_cats === 'true') : undefined,
        house_trained: house_trained ? (house_trained === 'true') : undefined,
        declawed: declawed ? (declawed === 'true') : undefined,
        special_needs: (special_needs as string) || undefined,
    });

    // Normalisation légère côté API
    res.json({
      animals: response.data.animals ?? [],
      pagination: response.data.pagination ?? {},
    });
  } catch (err: any) {
    console.error('Petfinder search error:', err?.response?.data || err);
    res.status(502).json({ error: 'Upstream Petfinder error', detail: err?.response?.data });
  }
});

export default router;
