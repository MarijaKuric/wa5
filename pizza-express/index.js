import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import pizzeRouter from './routes/pizze.js'
import narudzbeRouter from './routes/narudzbe.js'

const app = express()
const PORT = 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use('/public', express.static(path.join(__dirname, 'public')))

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Dobrodošli u Pizza Express poslužitelj!')
})

app.use('/pizze', pizzeRouter)
app.use('/narudzbe', narudzbeRouter)

app.listen(PORT, () => {
  console.log(`Pizza poslužitelj sluša na portu ${PORT}`)
})
