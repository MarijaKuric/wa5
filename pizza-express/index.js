import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectToDatabase } from './db.js';

import pizzeRouter from './routes/pizze.js';
import narudzbeRouter from './routes/narudzbe.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

let db;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Dobrodošli u Pizza Express poslužitelj!');
});

app.use('/pizze', pizzeRouter);
app.use('/narudzbe', narudzbeRouter);

app.get('/users', async (req, res) => {
  try {
    const usersCollection = db.collection('users');
    const allUsers = await usersCollection.find().toArray();
    res.status(200).json(allUsers);
  } catch {
    res.status(500).json({ error: 'Greška pri dohvaćanju korisnika' });
  }
});


app.get('/pizze', async (req, res) => {
  const { naziv, cijena_min, cijena_max, sort } = req.query;

  let filter = {};
  let sortQuery = {};

  if (naziv) {
    filter.naziv = { $regex: naziv, $options: 'i' };
  }

  if (cijena_min || cijena_max) {
    filter['cijene.srednja'] = {};
    if (cijena_min) filter['cijene.srednja'].$gte = Number(cijena_min);
    if (cijena_max) filter['cijene.srednja'].$lte = Number(cijena_max);
  }

  if (sort === 'asc') sortQuery['cijene.srednja'] = 1;
  if (sort === 'desc') sortQuery['cijene.srednja'] = -1;

  try {
    const pizze = await db
      .collection('pizze')
      .find(filter)
      .sort(sortQuery)
      .toArray();

    res.status(200).json(pizze);
  } catch {
    res.status(400).json({ error: 'Greška pri dohvaćanju pizza' });
  }
});


app.post('/pizze', async (req, res) => {
  try {
    const result = await db.collection('pizze').insertOne(req.body);
    res.status(201).json({ insertedId: result.insertedId });
  } catch {
    res.status(400).json({ error: 'Greška pri dodavanju pizze' });
  }
});


app.post('/narudzbe', async (req, res) => {
  const { ime, adresa, telefon, narucene_pizze } = req.body;

  if (!ime || !adresa || !telefon || !Array.isArray(narucene_pizze)) {
    return res.status(400).json({ error: 'Neispravni podaci narudžbe' });
  }

  if (
    typeof telefon !== 'number' &&
    !(typeof telefon === 'string' && /^\d+$/.test(telefon))
  ) {
    return res.status(400).json({ error: 'Telefon mora sadržavati samo brojeve' });
  }

  let ukupna_cijena = 0;
  const pizzeCollection = db.collection('pizze');

  for (const stavka of narucene_pizze) {
    const { naziv, kolicina, velicina } = stavka;

    if (!naziv || !Number.isInteger(kolicina) || !['mala', 'srednja', 'jumbo'].includes(velicina)) {
      return res.status(400).json({ error: 'Neispravna stavka narudžbe' });
    }

    const pizza = await pizzeCollection.findOne({ naziv });
    if (!pizza) {
      return res.status(404).json({ error: `Pizza ${naziv} ne postoji` });
    }

    ukupna_cijena += pizza.cijene[velicina] * kolicina;
  }

  const novaNarudzba = {
    ime,
    adresa,
    telefon,
    narucene_pizze,
    ukupna_cijena
  };

  const result = await db.collection('narudzbe').insertOne(novaNarudzba);
  res.status(201).json({ insertedId: result.insertedId, ukupna_cijena });
});


async function startServer() {
  try {
    db = await connectToDatabase();
    console.log('Mongo DB:', process.env.MONGO_DB_NAME);

    app.listen(PORT, () => {
      console.log(`Server pokrenut na portu ${PORT}`);
    });
  } catch (error) {
    console.error(' Baza nije dostupna', error);
  }
}

startServer();
