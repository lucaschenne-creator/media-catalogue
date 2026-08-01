import { useMemo, useState } from 'react'

type SearchableCatalogueItem = {
  author?: string
  tags: string[]
  title: string
}

export function filterCatalogueItems<T extends SearchableCatalogueItem>(items: readonly T[], searchTerm: string): T[] {
  const normalizedTerm = searchTerm.trim().toLocaleLowerCase()
  if (!normalizedTerm) return [...items]

  return items.filter((item) => {
    const searchableValues = [item.title, item.author, ...item.tags]
    return searchableValues.some((value) => value?.toLocaleLowerCase().includes(normalizedTerm))
  })
}

export function useCatalogueSearch<T extends SearchableCatalogueItem>(items: readonly T[]) {
  const [searchTerm, setSearchTerm] = useState('')
  const filteredItems = useMemo(() => filterCatalogueItems(items, searchTerm), [items, searchTerm])

  return {
    clearSearch: () => setSearchTerm(''),
    filteredItems,
    searchTerm,
    setSearchTerm,
  }
}
