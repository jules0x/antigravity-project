<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Page {
  id: string
  title: string
  slug: string
  isHomepage?: boolean
}

const navItems = ref<Page[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true'
    const statusFilter = isPreview ? '' : '&where[_status][equals]=published'
    const draftParam = isPreview ? '&draft=true' : ''

    const res = await fetch(`/api/pages?where[parent][exists]=false&where[excludeFromNav][not_equals]=true${statusFilter}${draftParam}&limit=100`)
    if (!res.ok) throw new Error('Failed to fetch navigation')
    const data = await res.json()
    navItems.value = data.docs
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <nav class="global-nav">
    <div class="nav-container">
      <div class="logo">
        <span class="logo-text">Antigravity</span>
      </div>
      
      <ul v-if="!loading && !error" class="nav-links">
        <li v-for="item in navItems" :key="item.id">
          <a :href="item.isHomepage ? '/' : '/' + item.slug" class="nav-link">
            {{ item.title }}
          </a>
        </li>
      </ul>
      
      <div v-if="loading" class="nav-loading">...</div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.global-nav {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 1rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.05em;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.nav-link {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s ease, transform 0.2s ease;
  
  &:hover {
    color: #6366f1;
    transform: translateY(-1px);
  }
}

.nav-loading {
  font-size: 0.8rem;
  color: #9ca3af;
}
</style>
