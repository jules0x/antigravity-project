<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HelloWorld from './components/HelloWorld.vue'

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
  <HelloWorld />

  <div class="api-test-container">
    <h2>Payload API Data (Proxy Test)</h2>
    <p v-if="error" class="error-text">Error: {{ error }}</p>
    <pre v-else-if="payloadUsers" class="api-output">
      {{ JSON.stringify(payloadUsers, null, 2) }}
    </pre>
    <p v-else>Loading payload data...</p>
  </div>
</template>

<style scoped lang="scss">
.api-test-container {
  margin: 40px auto;
  padding: 20px;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 8px;
  max-width: 600px;
  text-align: center;
}

.error-text {
  color: #ff4d4d;
}

.api-output {
  text-align: left;
  background: var(--bg-secondary, #eee);
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  max-height: 300px;
  font-family: monospace;
}
</style>
