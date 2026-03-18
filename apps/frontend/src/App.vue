<script setup lang="ts">
import { ref, onMounted } from 'vue'
import GlobalNav from './components/GlobalNav.vue'
import GlobalFooter from './components/GlobalFooter.vue'
import RichTextRenderer from './components/RichTextRenderer.vue'
import DraftToggle from './components/DraftToggle.vue'
import FormRenderer from './components/FormRenderer.vue'
import PageBanner from './components/PageBanner.vue'

const page = ref<any>(null)
const error = ref<string | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const path = window.location.pathname
    const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true'

    let query = ''
    if (path === '/' || path === '') {
      query = 'where[slug][equals]=home'
    } else {
      const slug = path.replace(/^\/|\/$/g, '')
      query = `where[slug][equals]=${slug}`
    }

    const statusFilter = isPreview ? '' : '&where[_status][equals]=published'
    const draftParam = isPreview ? '&draft=true' : ''

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(`/api/pages?${query}${statusFilter}${draftParam}&limit=1`, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)

    const data = await res.json()
    if (data.docs && data.docs.length > 0) {
      page.value = data.docs[0]
      error.value = null
    } else {
      // Fallback: Try to find a custom 404 page
      const errorRes = await fetch(`/api/pages?where[slug][equals]=404&where[_status][equals]=published&limit=1`)
      if (errorRes.ok) {
        const errorData = await errorRes.json()
        if (errorData.docs && errorData.docs.length > 0) {
          page.value = errorData.docs[0]
          error.value = null
        } else {
          page.value = null
          error.value = 'Page not found'
        }
      } else {
        page.value = null
        error.value = 'Page not found'
      }
    }
  } catch (e: any) {
    if (e.name === 'AbortError') {
      error.value = 'CMS is taking too long to respond. Is it running?'
    } else {
      error.value = e.message
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <GlobalNav />

  <main class="page-content">
    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>Loading your site...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <h2>Oops!</h2>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="page" class="page-container">
      <PageBanner v-if="page.banner" :image="page.banner.image" :text="page.banner.text" />
      <h1 class="page-title">{{ page.title }}</h1>
      <div class="page-body">
        <RichTextRenderer v-if="page.content?.root" :content="page.content.root" />
        <p v-else>No content yet</p>
      </div>
      <FormRenderer v-if="page.form" :form-id="typeof page.form === 'object' ? page.form.id : page.form" />
    </div>

    <div v-else class="not-found-state">
      <h2>Welcome!</h2>
      <p>Please go to the CMS and create some pages.</p>
    </div>
  </main>

  <GlobalFooter />
  <DraftToggle :page-id="page?.id" />
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
