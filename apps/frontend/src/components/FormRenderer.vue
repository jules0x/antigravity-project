<script setup lang="ts">
import RichTextRenderer from './RichTextRenderer.vue'
import { ref, onMounted } from 'vue'

const props = defineProps<{
  formId: string | number
}>()

interface FormField {
  id: string
  name: string
  label?: string
  blockType: string
  required?: boolean
  options?: { label: string; value: string }[]
  width?: number
}

interface Form {
  id: string
  title: string
  fields: FormField[]
  submitButtonLabel?: string
  confirmationType?: 'message' | 'redirect'
  confirmationMessage?: { root: unknown }
  redirect?: { url: string }
}

const form = ref<Form | null>(null)
const values = ref<Record<string, string>>({})
const submitting = ref(false)
const submitted = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await fetch(`/api/forms/${props.formId}`)
    if (!res.ok) throw new Error(`Failed to load form: ${res.status}`)
    form.value = await res.json()
  } catch (e: any) {
    error.value = e.message
  }
})

async function handleSubmit() {
  if (!form.value) return
  submitting.value = true
  error.value = null

  try {
    const submissionData = Object.entries(values.value).map(([field, value]) => ({ field, value }))

    const res = await fetch('/api/form-submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form: form.value.id, submissionData }),
    })

    if (!res.ok) throw new Error(`Submission failed: ${res.status}`)

    if (form.value.confirmationType === 'redirect' && form.value.redirect?.url) {
      window.location.href = form.value.redirect.url
    } else {
      submitted.value = true
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="form-renderer">
    <div v-if="error" class="form-error">{{ error }}</div>

    <div v-else-if="submitted" class="form-success">
      <RichTextRenderer
        v-if="form?.confirmationMessage?.root"
        :content="form.confirmationMessage.root"
      />
      <p v-else>Thanks! Your submission has been received.</p>
    </div>

    <form v-else-if="form" class="form" @submit.prevent="handleSubmit">
      <h2 v-if="form.title" class="form-title">{{ form.title }}</h2>

      <div
        v-for="field in form.fields"
        :key="field.id"
        class="form-field"
      >
        <label :for="field.name" class="form-label">
          {{ field.label || field.name }}
          <span v-if="field.required" class="form-required">*</span>
        </label>

        <textarea
          v-if="field.blockType === 'textarea'"
          :id="field.name"
          v-model="values[field.name]"
          :required="field.required"
          class="form-input form-textarea"
        />

        <select
          v-else-if="field.blockType === 'select'"
          :id="field.name"
          v-model="values[field.name]"
          :required="field.required"
          class="form-input form-select"
        >
          <option value="">Please select…</option>
          <option
            v-for="opt in field.options"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>

        <input
          v-else
          :id="field.name"
          v-model="values[field.name]"
          :type="field.blockType === 'email' ? 'email' : field.blockType === 'number' ? 'number' : 'text'"
          :required="field.required"
          class="form-input"
        />
      </div>

      <button type="submit" class="form-submit" :disabled="submitting">
        {{ submitting ? 'Sending…' : (form.submitButtonLabel || 'Submit') }}
      </button>
    </form>

    <div v-else class="form-loading">Loading form…</div>
  </div>
</template>

<style scoped lang="scss">
.form-renderer {
  margin: 2rem 0;
}

.form-title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
}

.form-required {
  color: var(--color-error, #e53e3e);
  margin-left: 0.2rem;
}

.form-input {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 6px;
  font-size: 1rem;
  background: var(--bg-input, #fff);
  color: inherit;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--color-accent, #6366f1);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.form-select {
  appearance: none;
  cursor: pointer;
}

.form-submit {
  padding: 0.65rem 1.5rem;
  background: var(--color-accent, #6366f1);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: 0.85;
  }
}

.form-success {
  padding: 1rem;
  border-radius: 8px;
  background: var(--bg-success, #f0fdf4);
  color: var(--color-success, #15803d);
  font-weight: 600;
}

.form-error {
  color: var(--color-error, #e53e3e);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.form-loading {
  opacity: 0.6;
  font-style: italic;
}
</style>
