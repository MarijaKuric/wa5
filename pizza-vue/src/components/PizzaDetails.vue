<template>
  <div class="mx-auto min-h-screen p-8 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat">
    <button
      @click="natragNaPopis"
      class="mb-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
    >
      ← Natrag na popis
    </button>

    <div v-if="pizza" class="max-w-3xl mx-auto bg-white/80 rounded-xl p-6 shadow-lg">
      <h1 class="text-2xl font-bold text-orange-500 mb-4">{{ pizza.naziv }}</h1>

      <div class="flex flex-col sm:flex-row gap-6">
        <img
          :src="pizza.slika_url"
          :alt="pizza.naziv"
          class="w-full sm:w-1/2 h-64 object-cover rounded-lg shadow-md"
        />

        <div class="flex-1">
          <h2 class="font-semibold text-lg mb-2">Sastojci:</h2>
          <ul class="list-disc list-inside mb-4">
            <li v-for="(sastojak, index) in pizza.sastojci" :key="index">
              {{ sastojak }}
            </li>
          </ul>

          <h2 class="font-semibold text-lg mb-2">Cijene:</h2>
          <ul class="space-y-1">
            <li>Mala: €{{ pizza.cijene.mala.toFixed(2) }}</li>
            <li>Srednja: €{{ pizza.cijene.srednja.toFixed(2) }}</li>
            <li>Jumbo: €{{ pizza.cijene.jumbo.toFixed(2) }}</li>
          </ul>
        </div>
      </div>
    </div>

    <p v-else class="text-white text-center text-xl mt-20">Učitavanje podataka pizze...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const pizza = ref(null)

async function fetchPizza() {
  try {
    const naziv = route.params.naziv
    const response = await axios.get(`http://localhost:3000/pizze/${encodeURIComponent(naziv)}`)
    pizza.value = response.data
  } catch (err) {
    console.error(err)
    alert('Pizza nije pronađena!')
    router.push('/')
  }
}

function natragNaPopis() {
  router.push('/')
}

onMounted(() => {
  fetchPizza()
})
</script>

<style scoped></style>
