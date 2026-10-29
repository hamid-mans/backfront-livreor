<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MessageList from '@/components/MessageList.vue'

const messages = ref([])

onMounted(async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/messages`)
  messages.value = await res.json()
})

</script>

<template>
  <h1 class="text-2xl font-bold mb-5">
    Bienvenue sur le livre d'Or
  </h1>

  <MessageList :messages="messages" />
</template>
