<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from 'primevue/card';

const messages = ref([])

onMounted(async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/messages`)
  messages.value = await res.json()
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short'
  })
}

</script>

<template>
  <h1 class="text-2xl font-bold mb-5">
    Bienvenue sur le livre d'Or
  </h1>

  <ul>
    <li v-for="message in messages" :key="message.id">
      <Card class="mb-4">
        <template #content>
          <p>{{ message.content }}</p>
          <p class="italic text-sm mt-2">{{ formatDate(message.createdAt) }} - Par {{ message.author }}</p>
        </template>
      </Card>
    </li>
  </ul>
</template>
