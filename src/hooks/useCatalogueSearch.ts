import { useMemo, useState } from 'react'

export type TagMatchMode = 'and' | 'or'

type SearchableCatalogueItem = {
  author?: string
  tags: string[]
  title: string
}

export function getCatalogueTags<T extends SearchableCatalogueItem>(items: readonly T[]): string[] {
  return [...new Set(items.flatMap((item) => item.tags))].sort((first, second) => first.localeCompare(second))
}

export function filterCatalogueItems<T extends SearchableCatalogueItem>(
  items: readonly T[],
  searchTerm: string,
  selectedTags: readonly string[] = [],
  tagMatchMode: TagMatchMode = 'and',
): T[] {
  const normalizedTerm = searchTerm.trim().toLocaleLowerCase()

  return items.filter((item) => {
    const searchableValues = [item.title, item.author, ...item.tags]
    const matchesSearch = !normalizedTerm || searchableValues.some((value) => value?.toLocaleLowerCase().includes(normalizedTerm))
    const matchesTags = selectedTags.length === 0 || (tagMatchMode === 'and'
      ? selectedTags.every((tag) => item.tags.includes(tag))
      : selectedTags.some((tag) => item.tags.includes(tag)))
    return matchesSearch && matchesTags
  })
}

export function useCatalogueSearch<T extends SearchableCatalogueItem>(items: readonly T[]) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagMatchMode, setTagMatchMode] = useState<TagMatchMode>('and')
  const tags = useMemo(() => getCatalogueTags(items), [items])
  const filteredItems = useMemo(
    () => filterCatalogueItems(items, searchTerm, selectedTags, tagMatchMode),
    [items, searchTerm, selectedTags, tagMatchMode],
  )

  function toggleTag(tag: string) {
    setSelectedTags((currentTags) => currentTags.includes(tag)
      ? currentTags.filter((currentTag) => currentTag !== tag)
      : [...currentTags, tag])
  }

  return {
    clearSearch: () => setSearchTerm(''),
    clearTags: () => setSelectedTags([]),
    filteredItems,
    searchTerm,
    selectedTags,
    setSearchTerm,
    setTagMatchMode,
    tagMatchMode,
    tags,
    toggleTag,
  }
}
