<script setup lang="ts">
import { ref, onMounted } from 'vue'

const navItems = ref<any[]>([])
const isPreview = ref(false)

onMounted(async () => {
  try {
    isPreview.value = new URLSearchParams(window.location.search).get('preview') === 'true'
    const endpoint = isPreview.value ? '/api/globals/footer?draft=true' : '/api/globals/footer'
    
    const res = await fetch(endpoint)
    if (!res.ok) throw new Error('Failed to fetch footer')
    
    const data = await res.json()
    if (data.navItems && data.navItems.length > 0) {
      navItems.value = data.navItems
    }
  } catch (error) {
    console.error('Footer fetch error:', error)
  }
})
</script>

<template>
  <footer class="global-footer">
    <div class="footer-content">
      <nav aria-label="Footer Navigation">
        <ul class="footer-nav">
          <li v-for="item in navItems" :key="item.id">
            <!-- Internal Page Link (Renders published pages, or all pages if in preview mode) -->
            <template v-if="item.linkType === 'internal' && item.page && typeof item.page === 'object' && (isPreview || item.page._status === 'published')">
              <a :href="'/' + item.page.slug + (isPreview ? '?preview=true' : '')">
                {{ item.label || item.page.title }}
              </a>
            </template>
            <!-- External Custom URL link -->
            <template v-else-if="item.linkType === 'external'">
              <a :href="item.url" target="_blank" rel="noopener noreferrer">
                {{ item.label }}
              </a>
            </template>
          </li>
        </ul>
      </nav>
      <div class="footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} Dynamic Vue CMS. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.global-footer {
  background: var(--bg-secondary, #fafafa);
  border-top: 1px solid var(--border-color, #eee);
  padding: 60px 20px 20px;
  margin-top: 80px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  list-style: none;
  padding: 0;
  margin: 0 0 40px 0;
  justify-content: center;

  a {
    color: var(--text-color, #333);
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    transition: color 0.2s ease, transform 0.2s ease;

    &:hover {
      color: var(--primary-color, #646cff);
    }
  }
}

.footer-bottom {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted, #777);
  padding-top: 24px;
  border-top: 1px solid var(--border-color, #eee);
}
</style>
