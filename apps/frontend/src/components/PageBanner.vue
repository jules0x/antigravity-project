<script setup lang="ts">
defineProps<{
  image?: {
    url: string
    alt?: string
    width?: number
    height?: number
  } | null
  text?: string | null
}>()
</script>

<template>
  <div v-if="image || text" class="page-banner">
    <img
      v-if="image"
      :src="image.url"
      :alt="image.alt || ''"
      class="page-banner__image"
    />
    <div v-if="text" class="page-banner__overlay">
      <p class="page-banner__text">{{ text }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-banner {
  position: relative;
  width: 100%;
  max-height: 480px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 2rem;

  &__image {
    display: block;
    width: 100%;
    height: 100%;
    max-height: 480px;
    object-fit: cover;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    padding: 2rem;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.65) 0%,
      rgba(0, 0, 0, 0.1) 60%,
      transparent 100%
    );
  }

  &__text {
    margin: 0;
    color: #fff;
    font-size: clamp(1.25rem, 3vw, 2rem);
    font-weight: 700;
    line-height: 1.25;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }
}
</style>
