<template>
  <div class="mx-auto min-h-screen p-8 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="pizza in pizze"
        :key="pizza.id"
        @click="odaberiPizzu(pizza)"
        :class="[
          'bg-inherit rounded-xl overflow-hidden cursor-pointer transition-all duration-300',
          odabranaPizza?.id === pizza.id
            ? 'ring-4 ring-orange-300 shadow-lg shadow-orange-300/50 scale-[1.02]'
            : 'hover:scale-[1.01]'
        ]"
      >
        <div class="w-full h-48 flex items-center justify-center bg-inherit overflow-hidden rounded-xl">
          <img :src="pizza.slika_url" :alt="pizza.naziv" class="w-full h-full object-cover" />
        </div>

        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-orange-500">{{ pizza.naziv }}</h2>

            <div class="flex space-x-2">
              <div
                v-for="(sastojak, index) in pizza.sastojci"
                :key="index"
                class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs"
              >
                {{ emojiMap[sastojak] || '❓' }}
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-gray-700">
              <span class="font-medium">Mala</span>
              <span>€{{ pizza.cijene.mala.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span class="font-medium">Srednja</span>
              <span>€{{ pizza.cijene.srednja.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span class="font-medium">Jumbo</span>
              <span>€{{ pizza.cijene.jumbo.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-if="odabranaPizza" class="mt-6 text-xl text-white">
      Odabrana pizza: <strong>{{ odabranaPizza.naziv }}</strong>
    </p>

    <OrderFooter
      v-if="odabranaPizza"
      :pizza="odabranaPizza"
      @orderAdded="resetSelection"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import OrderFooter from './OrderFooter.vue'

const odabranaPizza = ref(null)
const pizze = ref([])

const emojiMap = {
  sir: '🧀',
  šunj: '🥓',
  gljive: '🍄',
  paprika: '🌶',
  masline: '🫒',
  šunka: '🥓',
  kukuruz: '🌽',
  pelat: '🍅',
  tunjevina: '🐟',
  'crveni luk': '🧅',
  kulen: '🌶',
  panceta: '🥓',
  'feferoni ljuti': '🔥',
  vrhnje: '🥛'
}

function odaberiPizzu(pizza) {
  odabranaPizza.value = pizza
}

function resetSelection() {
  odabranaPizza.value = null
}

function handleEsc(event) {
  if (event.key === 'Escape') {
    resetSelection()
  }
}

onMounted(() => {
  fetchPizze()
  window.addEventListener('keydown', handleEsc)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEsc)
})

async function fetchPizze() {
  try {
    const response = await axios.get('http://localhost:3000/pizze')
    pizze.value = response.data.map((pizza, index) => ({
      id: pizza.id || index,
      ...pizza,
      sastojci: pizza.sastojci || ['sir', 'šunj', 'gljive']
    }))
    console.log('Dohvaćene pizze:', pizze.value)
  } catch (error) {
    console.error('Greška pri dohvaćanju podataka o pizzama:', error)
  }
}
</script>

<style scoped>
</style>
