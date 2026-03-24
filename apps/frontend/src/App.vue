<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import GlobalNav from './components/GlobalNav.vue'
import GlobalFooter from './components/GlobalFooter.vue'
import RichTextRenderer from './components/RichTextRenderer.vue'
import DraftToggle from './components/DraftToggle.vue'
import FormRenderer from './components/FormRenderer.vue'
import PageBanner from './components/PageBanner.vue'

const page = ref<any>(null)
const error = ref<string | null>(null)
const loading = ref(true)

useHead({
  title: () => page.value?.meta?.title || page.value?.title || 'Loading...',
  meta: [
    {
      name: 'description',
      content: () => page.value?.meta?.description,
    },
    {
      property: 'og:title',
      content: () => page.value?.meta?.title || page.value?.title,
    },
    {
      property: 'og:image',
      content: () => {
        const url = page.value?.meta?.image?.url
        if (url && url.startsWith('/')) {
          return typeof window !== 'undefined' ? `${window.location.origin}${url}` : url
        }
        return url
      }
    },
    {
      name: 'robots',
      content: () => {
        const robots = []
        if (page.value?.meta?.noindex) robots.push('noindex')
        if (page.value?.meta?.nofollow) robots.push('nofollow')
        return robots.join(', ') || 'index, follow'
      }
    }
  ],
  link: [
    {
      rel: 'canonical',
      href: () => page.value?.meta?.url,
    }
  ]
})

onMounted(async () => {
  let redirecting = false
  try {
    const path = window.location.pathname

    // 1. Check for Redirects
    try {
      const pathWithSlash = path.startsWith('/') ? path : `/${path}`
      const pathWithoutSlash = path.startsWith('/') ? path.substring(1) : path
      
      const redirectRes = await fetch(`/api/redirects?where[from][in]=${pathWithSlash},${pathWithoutSlash}&limit=1`)
      
      if (redirectRes.ok) {
        const redirectData = await redirectRes.json()
        if (redirectData.docs && redirectData.docs.length > 0) {
          const redirect = redirectData.docs[0]
          let redirectUrl = ''
          
          if (redirect.to?.type === 'custom') {
            redirectUrl = redirect.to.url
          } else if (redirect.to?.reference?.value?.slug) {
            const slug = redirect.to.reference.value.slug
            redirectUrl = slug === 'home' ? '/' : `/${slug}`
          }
          
          if (redirectUrl && redirectUrl !== path && redirectUrl !== pathWithoutSlash) {
            redirecting = true
            window.location.replace(redirectUrl)
            return
          }
        }
      }
    } catch (e) {
      console.warn('Redirect check failed:', e)
    }

    // 2. Load Page Data
    const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true'
    
    // ... rest of the logic ...
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
    if (!redirecting) {
      loading.value = false
    }
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
