<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <section class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <header class="settings-header">
        <h2 id="settings-title">閱讀設定</h2>
        <button type="button" class="close-button" aria-label="關閉設定" @click="emit('close')">
          x
        </button>
      </header>

      <div class="settings-tabs" role="tablist" aria-label="設定分類">
        <button
          type="button"
          class="tab-button"
          :class="{ active: activeTab === 'content' }"
          role="tab"
          :aria-selected="activeTab === 'content'"
          aria-controls="content-panel"
          @click="activeTab = 'content'"
        >
          內容
        </button>
        <button
          type="button"
          class="tab-button"
          :class="{ active: activeTab === 'theme' }"
          role="tab"
          :aria-selected="activeTab === 'theme'"
          aria-controls="theme-panel"
          @click="activeTab = 'theme'"
        >
          主題
        </button>
        <button
          type="button"
          class="tab-button"
          :class="{ active: activeTab === 'about' }"
          role="tab"
          :aria-selected="activeTab === 'about'"
          aria-controls="about-panel"
          @click="activeTab = 'about'"
        >
          關於
        </button>
      </div>

      <div v-if="activeTab === 'about'" id="about-panel" class="settings-panel" role="tabpanel">
        <div class="settings-section about-section">
          <h3>Txt Novel Reader</h3>
          <p class="about-text">一個輕量的本地 <code>.txt</code> 小說閱讀器，以 Vue 3 + TypeScript + Vite 打造，無須後端、直接在瀏覽器執行。</p>
          <a
            href="https://github.com/mudream4869/txt-novel-reader"
            target="_blank"
            rel="noopener noreferrer"
            class="github-link"
          >
            <svg class="github-icon" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            mudream4869/txt-novel-reader
          </a>
        </div>
      </div>

      <div v-else-if="activeTab === 'theme'" id="theme-panel" class="settings-panel" role="tabpanel">
        <div class="settings-section">
          <h3>外觀</h3>
          <div class="theme-switch" role="group" aria-label="閱讀主題">
            <button
              v-for="name in themeNames"
              :key="name"
              type="button"
              class="theme-button"
              :class="{ active: selectedThemeName === name }"
              @click="emit('update:selectedThemeName', name)"
            >
              {{ themeLabels[name] }}
            </button>
          </div>
        </div>

        <div class="settings-section">
          <h3>字體</h3>
          <div class="font-family-switch" role="group" aria-label="字體">
            <button
              v-for="name in fontFamilyNames"
              :key="name"
              type="button"
              class="theme-button"
              :class="{ active: fontFamily === name }"
              @click="emit('update:fontFamily', name)"
            >
              {{ fontFamilyLabels[name] }}
            </button>
          </div>
        </div>

        <div class="settings-section">
          <h3>字級</h3>
          <div class="font-size-control">
            <input
              id="font-size-range"
              :value="fontSize"
              type="range"
              min="12"
              max="32"
              step="1"
              class="font-size-range"
              @input="onFontSizeInput"
            />
            <span class="font-size-value">{{ fontSize }}px</span>
          </div>
        </div>
      </div>

      <div v-else id="content-panel" class="settings-panel" role="tabpanel">
        <div class="settings-section">
          <h3>檔案</h3>
          <button type="button" class="open-file-button" @click="emit('open-file')">開啟 novel.txt</button>
          <p class="hint-text">目前檔案：{{ fileName }}</p>
        </div>

        <div class="settings-section">
          <h3>切分方式</h3>
          <div class="split-method-switch" role="group" aria-label="章節切分方式">
            <button
              type="button"
              class="method-button"
              :class="{ active: splitMethod === 'regex' }"
              @click="emit('update:splitMethod', 'regex')"
            >
              依正規表示式
            </button>
            <button
              type="button"
              class="method-button"
              :class="{ active: splitMethod === 'line-count' }"
              @click="emit('update:splitMethod', 'line-count')"
            >
              依每章最大行數
            </button>
          </div>
        </div>


        <div v-if="splitMethod === 'regex'" class="settings-section">
          <h3>章節切分</h3>
          <label class="field-label" for="split-regex-input">正規表示式（JavaScript）</label>
          <input
            id="split-regex-input"
            :value="splitRegex"
            type="text"
            class="regex-input"
            spellcheck="false"
            placeholder="第.*章[^\\n\\r]*"
            @input="onSplitRegexInput"
          />
          <p class="hint-text">會以<strong>全域</strong>正規表示式比對章節標題行。</p>
          <p v-if="!isSplitRegexValid" class="error-text">
            正規表示式格式無效。修正前，閱讀器會先將全文視為單一章節。
          </p>
        </div>

        <div v-else class="settings-section">
          <h3>章節切分</h3>
          <label class="field-label" for="split-line-count-input">每章最大行數</label>
          <input
            id="split-line-count-input"
            :value="splitMaxLineCount"
            type="number"
            min="1"
            step="1"
            class="regex-input"
            @input="onSplitMaxLineCountInput"
          />
          <p class="hint-text">會依照每章最多幾行切分內容，並自動產生章節標題。</p>
          <p v-if="!isSplitMaxLineCountValid" class="error-text">
            請輸入大於 0 的整數。修正前，閱讀器會先將全文視為單一章節。
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FontFamily, SplitMethod } from '../types/reader-config'
import type { ReaderThemeName } from '../types/theme'

interface Props {
  isOpen: boolean
  fileName: string
  themeNames: ReaderThemeName[]
  themeLabels: Record<ReaderThemeName, string>
  selectedThemeName: ReaderThemeName
  splitMethod: SplitMethod
  splitRegex: string
  splitMaxLineCount: string
  isSplitRegexValid: boolean
  isSplitMaxLineCountValid: boolean
  fontSize: string
  fontFamily: FontFamily
  fontFamilyNames: FontFamily[]
  fontFamilyLabels: Record<FontFamily, string>
}

defineProps<Props>()

const activeTab = ref<'theme' | 'content' | 'about'>('content')

const emit = defineEmits<{
  close: []
  'open-file': []
  'update:selectedThemeName': [value: ReaderThemeName]
  'update:splitMethod': [value: SplitMethod]
  'update:splitRegex': [value: string]
  'update:splitMaxLineCount': [value: string]
  'update:fontSize': [value: string]
  'update:fontFamily': [value: FontFamily]
}>()

function onSplitRegexInput(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:splitRegex', target.value)
}

function onSplitMaxLineCountInput(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:splitMaxLineCount', target.value)
}

function onFontSizeInput(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:fontSize', target.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  padding: 1rem;
}

.settings-modal {
  width: min(560px, 100%);
  border: 1px solid var(--app-button-border);
  border-radius: 12px;
  background: var(--app-bg);
  color: var(--app-text-primary);
  padding: 1rem;
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.25);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.settings-header h2,
.settings-section h3 {
  margin: 0;
}

.close-button {
  border: 1px solid var(--app-button-border);
  border-radius: 6px;
  padding: 0.2rem 0.55rem;
  background: var(--app-button-bg);
  color: var(--app-text-primary);
  cursor: pointer;
}

.settings-section {
  border: 1px solid var(--app-button-border);
  border-radius: 8px;
  padding: 0.75rem;
  margin-top: 0.75rem;
}

.settings-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tab-button {
  border: 1px solid var(--app-button-border);
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  background: var(--app-button-bg);
  color: var(--app-text-primary);
  cursor: pointer;
}

.tab-button.active {
  border-color: var(--app-button-active-border);
  background: var(--app-button-active-bg);
}

.settings-panel {
  min-height: 0;
}

.open-file-button {
  border: 1px solid var(--app-button-border);
  border-radius: 6px;
  padding: 0.45rem 0.8rem;
  background: var(--app-button-bg);
  color: var(--app-text-primary);
  cursor: pointer;
}

.hint-text {
  margin: 0.6rem 0 0;
  color: var(--app-text-secondary);
  font-size: 0.9rem;
}

.theme-switch {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.theme-button {
  border: 1px solid var(--app-button-border);
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  background: var(--app-button-bg);
  color: var(--app-text-primary);
  cursor: pointer;
}

.theme-button.active {
  border-color: var(--app-button-active-border);
  background: var(--app-button-active-bg);
}

.split-method-switch {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.method-button {
  border: 1px solid var(--app-button-border);
  border-radius: 6px;
  padding: 0.45rem 0.8rem;
  background: var(--app-button-bg);
  color: var(--app-text-primary);
  cursor: pointer;
}

.method-button.active {
  border-color: var(--app-button-active-border);
  background: var(--app-button-active-bg);
}

.field-label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  color: var(--app-text-secondary);
}

.regex-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--app-button-border);
  border-radius: 6px;
  padding: 0.5rem 0.65rem;
  background: var(--app-button-bg);
  color: var(--app-text-primary);
}

.error-text {
  margin: 0.6rem 0 0;
  color: #d94848;
  font-size: 0.9rem;
}

.font-family-switch {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.font-size-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.font-size-range {
  flex: 1;
  accent-color: var(--app-button-active-border);
}

.font-size-value {
  min-width: 3rem;
  text-align: right;
  font-size: 0.9rem;
  color: var(--app-text-secondary);
}

.about-section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.about-text {
  margin: 0;
  font-size: 0.95rem;
  color: var(--app-text-secondary);
  line-height: 1.6;
}

.about-text code {
  font-family: monospace;
  font-size: 0.9em;
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.8rem;
  border: 1px solid var(--app-button-border);
  border-radius: 6px;
  background: var(--app-button-bg);
  color: var(--app-text-primary);
  text-decoration: none;
  font-size: 0.9rem;
  width: fit-content;
}

.github-link:hover {
  border-color: var(--app-button-active-border);
  background: var(--app-button-active-bg);
}

.github-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

@media (max-width: 700px) {
  .theme-switch {
    width: 100%;
  }
}
</style>
