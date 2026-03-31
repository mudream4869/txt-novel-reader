<template>
  <main :style="appThemeStyleVars">
    <header class="toolbar">
      <span class="file-name">{{ fileName }}</span>
      <button
        type="button"
        class="settings-button"
        aria-label="開啟設定"
        :aria-expanded="isSettingsOpen"
        @click="openSettings"
      >
        設定
      </button>
    </header>

    <input
      ref="fileInput"
      type="file"
      accept=".txt,text/plain"
      class="hidden-input"
      @change="onFileChange"
    />

    <TxtReader
      :novel="novel"
      :theme="selectedTheme"
      :split-method="splitMethod"
      :split-regex="splitRegex"
      :split-max-line-count="splitMaxLineCount"
      :novel-key="novelHash"
      :chapter-index="chapterIndex"
      :is-sidebar-open="isSidebarOpen"
      @update:chapter-index="chapterIndex = $event"
      @update:is-sidebar-open="isSidebarOpen = $event"
    />

    <ConfigDialog
      :is-open="isSettingsOpen"
      :file-name="fileName"
      :theme-names="themeNames"
      :theme-labels="themeLabels"
      :selected-theme-name="selectedThemeName"
      :split-method="splitMethod"
      :split-regex="splitRegex"
      :split-max-line-count="splitMaxLineCount"
      :is-split-regex-valid="isSplitRegexValid"
      :is-split-max-line-count-valid="isSplitMaxLineCountValid"
      @close="closeSettings"
      @open-file="openFileDialog"
      @update:selected-theme-name="selectedThemeName = $event"
      @update:split-method="splitMethod = $event"
      @update:split-regex="splitRegex = $event"
      @update:split-max-line-count="splitMaxLineCount = $event"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ConfigDialog from './components/ConfigDialog.vue'
import TxtReader from './components/TxtReader.vue'
import type { SplitMethod } from './types/reader-config'
import { readerThemes } from './types/theme'
import type { ReaderThemeName } from './types/theme'

const THEME_STORAGE_KEY = 'txt-novel-reader.theme'
const SPLIT_METHOD_STORAGE_KEY = 'txt-novel-reader.split-method'
const SPLIT_REGEX_STORAGE_KEY = 'txt-novel-reader.split-regex'
const SPLIT_MAX_LINE_COUNT_STORAGE_KEY = 'txt-novel-reader.split-max-line-count'
const NOVEL_SPLIT_CONFIG_KEY_PREFIX = 'txt-novel-reader.novel-split.'
const NOVEL_CHAPTER_KEY_PREFIX = 'txt-novel-reader.novel-chapter.'
const LATEST_NOVEL_TEXT_KEY = 'txt-novel-reader.latest-novel-text'
const LATEST_NOVEL_NAME_KEY = 'txt-novel-reader.latest-novel-name'
const SIDEBAR_OPEN_KEY = 'txt-novel-reader.sidebar-open'
const DEFAULT_SPLIT_REGEX = '第.*章[^\\n\\r]*'
const DEFAULT_SPLIT_MAX_LINE_COUNT = '20'

const novel = ref(`
第1章 初到陌城
雨像細線一樣落在月台邊，街燈在水面上碎成一片金色。
她拖著箱子走出車站，心裡只剩下一個念頭：先找到那封信裡提到的地址。

第2章 無名來信
信封沒有寄件人，封口處只壓著一個陌生家族的蠟印。
紙上只有一行字：午夜之前，來舊橋盡頭。

第3章 舊橋盡頭
橋下的河水緩慢而黑，像一條沉睡的影子。
當鐘聲敲到第十二下時，她看見霧裡站著一個人。
`)

interface NovelSplitConfig {
  method: SplitMethod
  regex: string
  maxLineCount: string
}

async function hashNovel(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-1', encoded)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('使用示範小說')
const novelHash = ref<string | null>(null)
const chapterIndex = ref(0)
const isSidebarOpen = ref(window.localStorage.getItem(SIDEBAR_OPEN_KEY) !== 'false')
const isSettingsOpen = ref(false)
const splitMethod = ref<SplitMethod>('regex')
const splitRegex = ref(DEFAULT_SPLIT_REGEX)
const splitMaxLineCount = ref(DEFAULT_SPLIT_MAX_LINE_COUNT)
const themeNames: ReaderThemeName[] = ['white', 'yellow', 'dark']
const themeLabels: Record<ReaderThemeName, string> = {
  white: '白底',
  yellow: '護眼黃',
  dark: '深色'
}
const selectedThemeName = ref<ReaderThemeName>('white')

const selectedTheme = computed(() => readerThemes[selectedThemeName.value])
const appThemeStyleVars = computed(() => ({
  '--app-bg': selectedTheme.value.colors.appBackground,
  '--app-text-primary': selectedTheme.value.colors.textPrimary,
  '--app-text-secondary': selectedTheme.value.colors.textSecondary,
  '--app-button-bg': selectedTheme.value.colors.buttonBackground,
  '--app-button-border': selectedTheme.value.colors.buttonBorder,
  '--app-button-active-bg': selectedTheme.value.colors.buttonActiveBackground,
  '--app-button-active-border': selectedTheme.value.colors.buttonActiveBorder
}))
const isSplitRegexValid = computed(() => {
  try {
    void new RegExp(splitRegex.value, 'g')
    return true
  } catch {
    return false
  }
})
const isSplitMaxLineCountValid = computed(() => {
  const parsed = Number.parseInt(splitMaxLineCount.value, 10)
  return Number.isInteger(parsed) && parsed > 0
})

function isThemeName(value: string): value is ReaderThemeName {
  return value === 'white' || value === 'yellow' || value === 'dark'
}

function isSplitMethod(value: string): value is SplitMethod {
  return value === 'regex' || value === 'line-count'
}

function openSettings(): void {
  isSettingsOpen.value = true
}

function closeSettings(): void {
  isSettingsOpen.value = false
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()
  return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

function onWindowKeydown(event: KeyboardEvent): void {
  if (event.metaKey && event.key === ',') {
    event.preventDefault()
    openSettings()
    return
  }

  if (!isSettingsOpen.value || event.key !== 'Escape') {
    return
  }

  if (isEditableTarget(event.target)) {
    return
  }

  event.preventDefault()
  closeSettings()
}

onMounted(async () => {
  const persistedThemeName = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (persistedThemeName && isThemeName(persistedThemeName)) {
    selectedThemeName.value = persistedThemeName
  }

  const persistedSplitRegex = window.localStorage.getItem(SPLIT_REGEX_STORAGE_KEY)
  if (persistedSplitRegex) {
    splitRegex.value = persistedSplitRegex
  }

  const persistedSplitMethod = window.localStorage.getItem(SPLIT_METHOD_STORAGE_KEY)
  if (persistedSplitMethod && isSplitMethod(persistedSplitMethod)) {
    splitMethod.value = persistedSplitMethod
  }

  const persistedSplitMaxLineCount = window.localStorage.getItem(SPLIT_MAX_LINE_COUNT_STORAGE_KEY)
  if (persistedSplitMaxLineCount) {
    splitMaxLineCount.value = persistedSplitMaxLineCount
  }

  const latestNovelText = window.localStorage.getItem(LATEST_NOVEL_TEXT_KEY)
  const latestNovelName = window.localStorage.getItem(LATEST_NOVEL_NAME_KEY)
  if (latestNovelText && latestNovelName) {
    novel.value = latestNovelText
    fileName.value = latestNovelName
    const hash = await hashNovel(latestNovelText)
    novelHash.value = hash
    const storedChapter = window.localStorage.getItem(NOVEL_CHAPTER_KEY_PREFIX + hash)
    chapterIndex.value = storedChapter !== null ? (Number.parseInt(storedChapter, 10) || 0) : 0
    const storedSplit = window.localStorage.getItem(NOVEL_SPLIT_CONFIG_KEY_PREFIX + hash)
    if (storedSplit) {
      try {
        const config: NovelSplitConfig = JSON.parse(storedSplit)
        if (isSplitMethod(config.method)) splitMethod.value = config.method
        if (config.regex) splitRegex.value = config.regex
        if (config.maxLineCount) splitMaxLineCount.value = config.maxLineCount
      } catch {
        // ignore malformed stored config
      }
    }
  }

  window.addEventListener('keydown', onWindowKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onWindowKeydown)
})

watch(selectedThemeName, (value) => {
  window.localStorage.setItem(THEME_STORAGE_KEY, value)
})

watch(splitMethod, (value) => {
  window.localStorage.setItem(SPLIT_METHOD_STORAGE_KEY, value)
})

watch(splitRegex, (value) => {
  window.localStorage.setItem(SPLIT_REGEX_STORAGE_KEY, value)
})

watch(splitMaxLineCount, (value) => {
  window.localStorage.setItem(SPLIT_MAX_LINE_COUNT_STORAGE_KEY, value)
})

watch(isSidebarOpen, (value) => {
  window.localStorage.setItem(SIDEBAR_OPEN_KEY, String(value))
})

watch(chapterIndex, (value) => {
  if (novelHash.value === null) {
    return
  }
  window.localStorage.setItem(NOVEL_CHAPTER_KEY_PREFIX + novelHash.value, String(value))
})

watch([splitMethod, splitRegex, splitMaxLineCount], ([method, regex, maxLineCount]) => {
  if (novelHash.value === null) {
    return
  }
  const config: NovelSplitConfig = { method, regex, maxLineCount }
  window.localStorage.setItem(NOVEL_SPLIT_CONFIG_KEY_PREFIX + novelHash.value, JSON.stringify(config))
})

function openFileDialog(): void {
  fileInput.value?.click()
}

async function onFileChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  const text = await file.text()
  novel.value = text
  fileName.value = file.name
  window.localStorage.setItem(LATEST_NOVEL_TEXT_KEY, text)
  window.localStorage.setItem(LATEST_NOVEL_NAME_KEY, file.name)

  const hash = await hashNovel(text)
  novelHash.value = hash

  const storedChapter = window.localStorage.getItem(NOVEL_CHAPTER_KEY_PREFIX + hash)
  chapterIndex.value = storedChapter !== null ? (Number.parseInt(storedChapter, 10) || 0) : 0

  const stored = window.localStorage.getItem(NOVEL_SPLIT_CONFIG_KEY_PREFIX + hash)
  if (stored) {
    try {
      const config: NovelSplitConfig = JSON.parse(stored)
      if (isSplitMethod(config.method)) {
        splitMethod.value = config.method
      }
      if (config.regex) {
        splitRegex.value = config.regex
      }
      if (config.maxLineCount) {
        splitMaxLineCount.value = config.maxLineCount
      }
    } catch {
      // ignore malformed stored config
    }
  } else {
    splitMethod.value = 'regex'
    splitRegex.value = DEFAULT_SPLIT_REGEX
    splitMaxLineCount.value = DEFAULT_SPLIT_MAX_LINE_COUNT
  }

  input.value = ''
}
</script>

<style scoped>
:global(body) {
  margin: 0;
}

main {
  padding: 1rem;
  min-height: 100vh;
  background: var(--app-bg);
  color: var(--app-text-primary);
}

.toolbar {
  max-width: 900px;
  margin: 0 auto 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.settings-button {
  margin-left: auto;
  border: 1px solid var(--app-button-border);
  border-radius: 6px;
  padding: 0.45rem 0.8rem;
  background: var(--app-button-bg);
  color: var(--app-text-primary);
  cursor: pointer;
}

.file-name {
  color: var(--app-text-secondary);
  font-size: 0.9rem;
}

.hidden-input {
  display: none;
}

@media (max-width: 700px) {
  .toolbar {
    flex-wrap: wrap;
  }

  .settings-button {
    margin-left: 0;
  }
}
</style>
