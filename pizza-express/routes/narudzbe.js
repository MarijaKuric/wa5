import express from 'express';
import { narudzbe } from '../data/data.js';
const router = express.Router();

router.get('/', (req, res) => {
  res.json(narudzbe);
});

router.post('/', (req, res) => {
  const { narucene_pizze, ukupna_cijena, podaci_dostava } = req.body;

  if (!Array.isArray(narucene_pizze) || narucene_pizze.length === 0) {
    return res.status(400).json({ error: 'Narudžba mora sadržavati barem jednu pizzu.' });
  }

  const total = Number(ukupna_cijena);
  if (isNaN(total) || total <= 0) {
    return res.status(400).json({ error: 'Ukupna cijena nije valjana.' });
  }

  if (!podaci_dostava?.prezime || !podaci_dostava?.adresa || !podaci_dostava?.telefon) {
    return res.status(400).json({ error: 'Podaci za dostavu nisu potpuni.' });
  }

  const novaNarudzba = {
    id: narudzbe.length + 1,
    narucene_pizze,
    ukupna_cijena: total,
    podaci_dostava
  };

  narudzbe.push(novaNarudzba);

  res.status(201).json({ message: 'Narudžba uspješno poslana!', narudzba: novaNarudzba });
});

export default router;
