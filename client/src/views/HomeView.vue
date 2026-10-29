<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MessageList from '@/components/MessageList.vue'
import { Button, InputText, Textarea } from 'primevue'
import type { Message } from '@/types/message'

const messages = ref<Message[]>([])

onMounted(async () => {
	const res = await fetch(`${import.meta.env.VITE_API_URL}/messages`)
	messages.value = await res.json()
})

const form = ref({
	content: '',
	author: ''
})

const errors = ref<Record<string, string>>({})

const handleSubmit = async () => {
	try {
		const res = await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
			method: 'POST',
			body: JSON.stringify(form.value),
			headers: {
				'Content-Type': 'application/json'
			}
		})

		errors.value = {}

		const data = await res.json()
		console.log(data)

		if (res.status === 201) {
			form.value.content = ''
			form.value.author = ''
			messages.value.unshift(data)
		} else if(res.status === 422) {
			errors.value = data.errors
		}
	} catch (err) {
		console.log(err)
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
			<small v-if="errors.content">{{ errors.content }}</small>

			<div class="flex gap-2">
				<InputText placeholder="Auteur" v-model="form.author" />
				<Button type="submit" label="Envoyer" />			
			</div>
			<small v-if="errors.author">{{ errors.author }}</small>
		</form>
	</div>

	<MessageList :messages="messages" />
</template>
