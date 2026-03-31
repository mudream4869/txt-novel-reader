<template>
  <section class="chapter-reader" :class="{ 'sidebar-collapsed': !isSidebarOpen }" :style="themeStyleVars">
    <button
      v-if="!isSidebarOpen"
      type="button"
      class="reopen-button"
      aria-label="展開側邊欄"
      @click="emit('update:isSidebarOpen', true)"
    >
      >
    </button>

    <aside class="sidebar" :class="{ hidden: !isSidebarOpen }">
      <div class="sidebar-header">
        <h2>章節</h2>
        <button
          type="button"
          class="toggle-button"
          aria-label="收合側邊欄"
          :aria-expanded="isSidebarOpen"
          @click="emit('update:isSidebarOpen', false)"
        >
          <
        </button>
      </div>

      <ul v-show="isSidebarOpen">
        <li v-for="(title, index) in chapter_title_list" :key="`${title}-${index}`">
          <button
            type="button"
            class="chapter-button"
            :class="{ active: selectedIndex === index }"
            @click="selectedIndex = index"
          >
            {{ title }}
          </button>
        </li>
      </ul>
    </aside>

    <article class="content">
      <h2>{{ currentTitle }}</h2>
      <p>{{ currentContent }}</p>

      <div class="chapter-nav">
        <button
          type="button"
          class="nav-button"
          :disabled="!hasPrevChapter"
          @click="goToPrevChapter"
        >
          上一章
        </button>
        <button
          type="button"
          class="nav-button"
          :disabled="!hasNextChapter"
          @click="goToNextChapter"
        >
          下一章
        </button>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ReaderTheme } from '../types/theme'

interface Props {
  chapter_title_list: string[]
  read_chapter: (index: number) => string
  theme: ReaderTheme
  novelKey?: string | null
  initialIndex?: number
  isSidebarOpen?: boolean
}

const { chapter_title_list, read_chapter, theme, novelKey, initialIndex, isSidebarOpen = true } = defineProps<Props>()

const emit = defineEmits<{
  'update:selectedIndex': [value: number]
  'update:isSidebarOpen': [value: boolean]
}>()

const selectedIndex = ref(initialIndex ?? 0)

watch(() => novelKey, () => {
  selectedIndex.value = initialIndex ?? 0
})

watch(selectedIndex, (value) => {
  emit('update:selectedIndex', value)
})
const currentTitle = computed(() => {
  if (chapter_title_list.length === 0) {
    return '沒有章節'
  }
  return chapter_title_list[selectedIndex.value] ?? '未選擇章節'
})

const currentContent = computed(() => {
  if (chapter_title_list.length === 0) {
    return '目前沒有可顯示的內容。'
  }
  return read_chapter(selectedIndex.value)
})

const hasPrevChapter = computed(() => selectedIndex.value > 0)
const hasNextChapter = computed(() => selectedIndex.value < chapter_title_list.length - 1)

const themeStyleVars = computed(() => ({
  '--reader-panel-bg': theme.colors.panelBackground,
  '--reader-panel-border': theme.colors.panelBorder,
  '--reader-button-bg': theme.colors.buttonBackground,
  '--reader-button-border': theme.colors.buttonBorder,
  '--reader-button-active-bg': theme.colors.buttonActiveBackground,
  '--reader-button-active-border': theme.colors.buttonActiveBorder,
  '--reader-text-primary': theme.colors.textPrimary,
  '--reader-text-secondary': theme.colors.textSecondary
}))

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goToPrevChapter(): void {
  if (!hasPrevChapter.value) {
    return
  }
  selectedIndex.value -= 1
  scrollToTop()
}

function goToNextChapter(): void {
  if (!hasNextChapter.value) {
    return
  }
  selectedIndex.value += 1
  scrollToTop()
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()
  return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

function onWindowKeydown(event: KeyboardEvent): void {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return
  }

  if (isEditableTarget(event.target)) {
    return
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    goToPrevChapter()
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    goToNextChapter()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onWindowKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onWindowKeydown)
})
</script>

<style scoped>
.chapter-reader {
  position: relative;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 1rem;
  max-width: 900px;
  margin: 2rem auto;
  transition: grid-template-columns 0.2s ease;
  color: var(--reader-text-primary);
}

.chapter-reader.sidebar-collapsed {
  grid-template-columns: 0 minmax(0, 1fr);
  gap: 0;
}

.sidebar {
  transition: all 0.2s ease;
  overflow: hidden;
}

.sidebar.hidden {
  width: 0;
  min-width: 0;
  padding: 0;
  border: 0;
  opacity: 0;
  pointer-events: none;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.sidebar-header h2 {
  margin: 0;
}

.reopen-button {
  position: absolute;
  top: 1rem;
  left: 0;
  z-index: 2;
  border: 1px solid var(--reader-button-border);
  background: var(--reader-button-bg);
  color: var(--reader-text-primary);
  border-radius: 0 6px 6px 0;
  padding: 0.25rem 0.6rem;
  cursor: pointer;
}

.toggle-button {
  border: 1px solid var(--reader-button-border);
  background: var(--reader-button-bg);
  color: var(--reader-text-primary);
  border-radius: 6px;
  padding: 0.25rem 0.6rem;
  cursor: pointer;
}

.sidebar,
.content {
  border: 1px solid var(--reader-panel-border);
  border-radius: 8px;
  padding: 1rem;
  background: var(--reader-panel-bg);
}

.content {
  grid-column: 2;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chapter-button {
  width: 100%;
  text-align: left;
  border: 1px solid var(--reader-button-border);
  background: var(--reader-button-bg);
  color: var(--reader-text-primary);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.chapter-button.active {
  border-color: var(--reader-button-active-border);
  background: var(--reader-button-active-bg);
}

.content p {
  line-height: 1.6;
  white-space: pre-wrap;
  color: var(--reader-text-primary);
}

.chapter-nav {
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
}

.chapter-nav .nav-button:last-child {
  margin-left: auto;
}

.nav-button {
  border: 1px solid var(--reader-button-border);
  background: var(--reader-button-bg);
  color: var(--reader-text-primary);
  border-radius: 6px;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
}

.nav-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 700px) {
  .chapter-reader,
  .chapter-reader.sidebar-collapsed {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .content {
    grid-column: 1;
  }

  .reopen-button {
    left: 0.5rem;
  }
}
</style>
