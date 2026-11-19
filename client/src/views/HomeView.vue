<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MessageList from '@/components/MessageList.vue'
import { Button, InputText, Textarea } from 'primevue'
import type { Message } from '@/types/message'
import { getMessages, postMessage } from '@/services/messages'

const messages = ref<Message[]>([])

onMounted(async () => {
	messages.value = await getMessages()
})

const form = ref({
	content: '',
	author: ''
})

const errors = ref<Record<string, string>>({})

const handleSubmit = async () => {
	try {
		errors.value = {}

		const result = await postMessage({ ...form.value })

		if (result.ok) {
			form.value.content = ''
			form.value.author = ''
			messages.value.unshift(result.message)
		} else {
			errors.value = result.errors
		}
	} catch (err) {
		console.error(err)
	}
}
</script>

<template>
	<h1 class="text-2xl font-bold">
		Bienvenue sur le livre d'Or
	</h1>

	<div class="my-5">
		<form @submit.prevent="handleSubmit">
			<Textarea class="w-full" placeholder="Votre message" v-model="form.content" />
			<small v-if="errors.content" data-test="error-content">{{ errors.content }}</small>

			<div class="flex gap-2">
				<InputText placeholder="Auteur" v-model="form.author" />
				<Button type="submit" label="Envoyer" />
			</div>
			<small v-if="errors.author" data-test="error-author">{{ errors.author }}</small>
		</form>
	</div>

	<MessageList :messages="messages" />
</template>
