<script setup lang="ts">
import Card from 'primevue/card'
import type { Message } from '@/types/message'

defineProps<{
  messages: Message[]
}>()

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short'
  })
}
</script>

<template>
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
