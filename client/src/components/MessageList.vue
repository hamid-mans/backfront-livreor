<script setup lang="ts">
import { defineProps } from 'vue'
import Card from 'primevue/card';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short'
  })
}

defineProps({
  messages: Array
})
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