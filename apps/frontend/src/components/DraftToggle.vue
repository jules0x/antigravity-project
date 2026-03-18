<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  pageId?: number | string
}>()

const user = ref<any>(null)
const isPreview = ref(false)
// ... keeping other logic exactly the same ...
onMounted(async () => {
  try {
    isPreview.value = new URLSearchParams(window.location.search).get('preview') === 'true'
    
    // Check if logged in to Payload
    const res = await fetch('/api/users/me')
    if (res.ok) {
      const data = await res.json()
      user.value = data.user
    }
  } catch (err) {
    console.error('Failed to fetch user:', err)
  }
})

const togglePreview = () => {
  const url = new URL(window.location.href)
  if (isPreview.value) {
    url.searchParams.delete('preview')
  } else {
    url.searchParams.set('preview', 'true')
  }
  // Reload the page with the new URL params
  window.location.href = url.toString()
}
</script>

<template>
  <!-- Only render the toggle floating UI if the user is authenticated -->
  <div v-if="user" class="draft-toggle">
    <div class="toggle-track" :class="{ 'is-active': isPreview }" @click="togglePreview">
      <div class="toggle-thumb"></div>
    </div>
    <div class="toggle-text">
      <span class="toggle-label">{{ isPreview ? 'Viewing Drafts' : 'Viewing Published' }}</span>
      <span class="toggle-sub">{{ user.email }}</span>
    </div>
    
    <template v-if="pageId">
      <div class="edit-link-divider"></div>
      <a :href="'http://localhost:3000/admin/collections/pages/' + pageId" target="_blank" class="edit-link" title="Open in CMS Admin UI">
        Edit
        <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </a>
    </template>
  </div>
</template>

<style scoped>
.draft-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 9999;
  border: 1px solid var(--border-color, #eee);
  font-family: system-ui, sans-serif;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.9);
}

.toggle-track {
  width: 44px;
  height: 24px;
  background-color: #d1d5db;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toggle-track.is-active {
  background-color: var(--primary-color, #646cff);
}

.toggle-track:hover {
  opacity: 0.9;
}

.toggle-thumb {
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-track.is-active .toggle-thumb {
  transform: translateX(20px);
}

.toggle-text {
  display: flex;
  flex-direction: column;
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  user-select: none;
}

.toggle-sub {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.edit-link-divider {
  width: 1px;
  height: 24px;
  background-color: var(--border-color, #eee);
  margin: 0 4px;
}

.edit-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--primary-color, #646cff);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.edit-link:hover {
  background-color: rgba(100, 108, 255, 0.1);
}

.external-icon {
  width: 12px;
  height: 12px;
}
</style>
