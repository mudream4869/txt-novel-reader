<template>
  <ChapterReader
    :chapter_title_list="chapterTitleList"
    :read_chapter="readChapter"
    :theme="theme"
    :novel-key="novelKey"
    :initial-index="chapterIndex"
    :is-sidebar-open="isSidebarOpen"
    @update:selected-index="emit('update:chapterIndex', $event)"
    @update:is-sidebar-open="emit('update:isSidebarOpen', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SplitMethod } from '../types/reader-config'
import type { ReaderTheme } from '../types/theme'
import ChapterReader from './ChapterReader.vue'

interface Props {
  novel: string
  theme: ReaderTheme
  splitMethod: SplitMethod
  splitRegex: string
  splitMaxLineCount: string
  novelKey?: string | null
  chapterIndex?: number
  isSidebarOpen?: boolean
}

const { novel, theme, splitMethod, splitRegex, splitMaxLineCount, novelKey, chapterIndex, isSidebarOpen } = defineProps<Props>()

const emit = defineEmits<{
  'update:chapterIndex': [value: number]
  'update:isSidebarOpen': [value: boolean]
}>()

interface ParsedChapter {
  title: string
  content: string
}

function compileChapterPattern(pattern: string): RegExp | null {
  try {
    return new RegExp(pattern, 'g')
  } catch {
    return null
  }
}

function parseNovelByRegex(text: string, pattern: string): ParsedChapter[] {
  const normalized = text.trim()
  if (!normalized) {
    return []
  }

  const chapterPattern = compileChapterPattern(pattern)
  if (!chapterPattern) {
    return [{ title: '全文', content: normalized }]
  }

  const matches = Array.from(normalized.matchAll(chapterPattern))

  if (matches.length === 0) {
    return [{ title: '全文', content: normalized }]
  }

  const chapters: ParsedChapter[] = []

  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i]
    const next = matches[i + 1]
    const startIndex = current.index ?? 0
    const endIndex = next?.index ?? normalized.length

    const section = normalized.slice(startIndex, endIndex).trim()
    const firstLineBreakIndex = section.search(/[\n\r]/)

    if (firstLineBreakIndex === -1) {
      chapters.push({ title: section, content: '' })
      continue
    }

    const title = section.slice(0, firstLineBreakIndex).trim()
    const content = section.slice(firstLineBreakIndex).trim()

    chapters.push({ title, content })
  }

  return chapters
}

function parseNovelByLineCount(text: string, maxLineCountValue: string): ParsedChapter[] {
  const normalized = text.trim()
  if (!normalized) {
    return []
  }

  const maxLineCount = Number.parseInt(maxLineCountValue, 10)
  if (!Number.isInteger(maxLineCount) || maxLineCount <= 0) {
    return [{ title: '全文', content: normalized }]
  }

  const lines = normalized.split(/\r?\n/)
  const chapters: ParsedChapter[] = []

  for (let index = 0; index < lines.length; index += maxLineCount) {
    const contentLines = lines.slice(index, index + maxLineCount)
    chapters.push({
      title: `第${chapters.length + 1}章`,
      content: contentLines.join('\n').trim()
    })
  }

  return chapters.length > 0 ? chapters : [{ title: '全文', content: normalized }]
}

function parseNovel(
  text: string,
  method: SplitMethod,
  pattern: string,
  maxLineCountValue: string
): ParsedChapter[] {
  if (method === 'line-count') {
    return parseNovelByLineCount(text, maxLineCountValue)
  }

  return parseNovelByRegex(text, pattern)
}

const parsedChapters = computed(() => parseNovel(novel, splitMethod, splitRegex, splitMaxLineCount))

const chapterTitleList = computed(() => parsedChapters.value.map((chapter) => chapter.title))

function readChapter(index: number): string {
  return parsedChapters.value[index]?.content ?? ''
}
</script>
