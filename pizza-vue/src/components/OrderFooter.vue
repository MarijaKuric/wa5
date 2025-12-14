<template>
  <footer v-if="pizza" class="fixed bottom-0 left-0 right-0 bg-slate-700 p-4 text-white z-50">
    <button @click="$emit('orderAdded')" class="absolute top-3 right-3 text-white text-xl hover:text-orange-400">✕</button>

    <div class="max-w-7xl mx-auto flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <img :src="pizza.slika_url" :alt="pizza.naziv" class="w-16 h-16 rounded-lg object-cover" />
        <h3 class="text-lg font-bold text-orange-400">{{ pizza.naziv }}</h3>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-for="velicina in dostupneVelicine"
          :key="velicina.label"
          @click="odaberiVelicinu(velicina.label)"
          :class="odabranaVelicina === velicina.label
            ? 'bg-orange-500 border-orange-400 text-white px-3 py-1 rounded-lg'
            : 'bg-slate-600/40 border-slate-500 hover:bg-orange-500 hover:border-orange-400 hover:text-white px-3 py-1 rounded-lg'">
          {{ velicina.label }} – €{{ velicina.cijena.toFixed(2) }}
        </button>

        <div class="flex items-center gap-2 ml-4">
          <button @click="promijeniKolicinu(-1)" class="w-8 h-8 rounded-full bg-orange-500">-</button>
          <span>{{ kolicina }}</span>
          <button @click="promijeniKolicinu(1)" class="w-8 h-8 rounded-full bg-orange-500">+</button>
        </div>
      </div>

      <p class="mt-2 font-semibold text-white">
        Trenutna cijena: €{{ trenutnaCijena.toFixed(2) }}
      </p>

      <div class="flex flex-col sm:flex-row gap-2">
        <input v-model="podaciDostava.prezime" placeholder="Prezime" class="px-2 py-1 rounded border" />
        <input v-model="podaciDostava.adresa" placeholder="Adresa" class="px-2 py-1 rounded border" />
        <input v-model="podaciDostava.telefon" placeholder="Telefon" class="px-2 py-1 rounded border" />
      </div>

      <p v-if="statusPoruka" :class="{'text-green-400': statusOk, 'text-red-400': !statusOk}">
        {{ statusPoruka }}
      </p>

      <button @click="dodajUKosaricu" class="bg-orange-500 px-4 py-2 rounded-xl">Dodaj u košaricu</button>

      <ul v-if="stavkeKošarice.length > 0" class="mt-2 space-y-1">
        <li v-for="(stavka, index) in stavkeKošarice" :key="index" class="flex justify-between bg-slate-600/50 p-2 rounded">
          <span>{{ stavka.naziv }} ({{ stavka.velicina }} x{{ stavka.kolicina }}) – €{{ stavka.cijena.toFixed(2) }}</span>
          <button @click="obrisiStavku(index)" class="text-red-400 hover:text-red-600">✕</button>
        </li>
      </ul>

      <button @click="posaljiNarudzbu" class="bg-green-500 px-4 py-2 rounded-xl mt-2">Pošalji narudžbu</button>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'

const props = defineProps({ pizza: Object })
const emit = defineEmits(['orderAdded'])

const kolicina = ref(1)
const odabranaVelicina = ref('mala')
const podaciDostava = ref({ prezime: '', adresa: '', telefon: '' })
const stavkeKošarice = ref([])
const statusPoruka = ref('')
const statusOk = ref(true)

watch(() => props.pizza, () => {
  kolicina.value = 1
  odabranaVelicina.value = 'mala'
})

const dostupneVelicine = computed(() => {
  if (!props.pizza) return []
  return [
    { label: 'mala', cijena: props.pizza.cijene.mala },
    { label: 'srednja', cijena: props.pizza.cijene.srednja },
    { label: 'jumbo', cijena: props.pizza.cijene.jumbo }
  ]
})

const trenutnaCijena = computed(() => {
  if (!props.pizza) return 0
  const cijenaJedne = dostupneVelicine.value.find(v => v.label === odabranaVelicina.value)?.cijena || 0
  return cijenaJedne * kolicina.value
})

function promijeniKolicinu(delta) {
  kolicina.value = Math.max(1, kolicina.value + delta)
}

function odaberiVelicinu(label) {
  odabranaVelicina.value = label
}

function dodajUKosaricu() {
  stavkeKošarice.value.push({
    naziv: props.pizza.naziv,
    velicina: odabranaVelicina.value,
    kolicina: kolicina.value,
    cijena: trenutnaCijena.value
  })
}

function obrisiStavku(index) {
  stavkeKošarice.value.splice(index, 1)
}

async function posaljiNarudzbu() {
  if (!podaciDostava.value.prezime || !podaciDostava.value.adresa || !podaciDostava.value.telefon) {
    statusPoruka.value = 'Molimo popunite sve podatke za dostavu.'
    statusOk.value = false
    return
  }
  if (stavkeKošarice.value.length === 0) {
    statusPoruka.value = 'Košarica je prazna.'
    statusOk.value = false
    return
  }

  const ukupnaCijena = stavkeKošarice.value.reduce((acc, s) => acc + s.cijena, 0)

  try {
    const response = await axios.post('http://localhost:3000/narudzbe', {
      narucene_pizze: stavkeKošarice.value,
      ukupna_cijena: ukupnaCijena,
      podaci_dostava: podaciDostava.value
    })
    statusPoruka.value = response.data.message || 'Narudžba uspješno poslana!'
    statusOk.value = true
    stavkeKošarice.value = []
    podaciDostava.value = { prezime: '', adresa: '', telefon: '' }
  } catch (err) {
    statusPoruka.value = err.response?.data?.error || 'Greška pri slanju narudžbe.'
    statusOk.value = false
  }
}
</script>

<style scoped>
</style>
