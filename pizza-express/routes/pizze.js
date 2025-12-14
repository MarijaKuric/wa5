import express from 'express';
import { pizze } from '../data/data.js';
const router = express.Router();

// GET /pizze - sve pizze
router.get('/', (req, res) => {
  if (!pizze || pizze.length === 0) {
    return res.status(404).json({ message: 'Nema dostupnih pizza.' });
  }
  res.status(200).json(pizze);
});

// GET /pizze/:naziv - pizza prema nazivu
router.get('/:naziv', (req, res) => {
  const naziv = req.params.naziv.toLowerCase();
  const pizza = pizze.find(p => p.naziv.toLowerCase() === naziv);
  if (!pizza) return res.status(404).json({ error: `Pizza '${req.params.naziv}' nije pronađena.` });
  res.json(pizza);
});

export default router;
