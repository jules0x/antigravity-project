<script setup lang="ts">
import { ref, onMounted } from 'vue'

const payloadUsers = ref<any>(null)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await fetch('/api/users')
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('403 Forbidden (Working specifically as expected! Payload blocks public access to /api/users by default)')
      }
      throw new Error(`Failed to fetch from Payload CMS: ${res.status} ${res.statusText}`)
    }
    const data = await res.json()
    payloadUsers.value = data
  } catch (e: any) {
    error.value = e.message
  }
})
</script>

<template>
  <div style="font-family: sans-serif; max-width: 600px; margin: 40px auto; text-align: center;">
    <h1>Vite 8 + Vue + Payload CMS</h1>
    <p>This is a starter boilerplate demonstrating the workspace setup.</p>
    
    <div style="margin-top: 40px; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
      <h2>Payload API Data (Proxy Test)</h2>
      <p v-if="error" style="color: red;">Error: {{ error }}</p>
      <pre v-else-if="payloadUsers" style="text-align: left; background: #eee; padding: 10px; border-radius: 4px; overflow: auto; max-height: 300px;">
        {{ JSON.stringify(payloadUsers, null, 2) }}
      </pre>
      <p v-else>Loading payload data...</p>
    </div>
  </div>
</template>
