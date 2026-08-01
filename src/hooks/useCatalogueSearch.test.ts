import { describe, expect, it } from 'vitest'
import { filterCatalogueItems, getCatalogueTags } from './useCatalogueSearch'

const images = [
  { id: 'image-1', title: 'Morning Window', tags: ['室內', 'Sunlight'] },
  { id: 'image-2', title: '雨後的郵筒', tags: ['街景', '雨天'] },
  { id: 'image-3', title: '星空散步', tags: ['夜空', 'ほし'] },
]

const manga = [
  { id: 'manga-1', title: 'Paper Airplane', author: 'Aiko Tanaka', tags: ['日常'] },
  { id: 'manga-2', title: '圖書館的第七盞燈', author: '林澄', tags: ['奇幻'] },
  { id: 'manga-3', title: '夜の図書館', author: '山田太郎', tags: ['短篇'] },
]

describe('filterCatalogueItems', () => {
  it('finds image titles', () => {
    expect(filterCatalogueItems(images, 'Window').map((item) => item.id)).toEqual(['image-1'])
  })

  it('finds manga titles', () => {
    expect(filterCatalogueItems(manga, 'Airplane').map((item) => item.id)).toEqual(['manga-1'])
  })

  it('finds manga authors', () => {
    expect(filterCatalogueItems(manga, 'Aiko').map((item) => item.id)).toEqual(['manga-1'])
  })

  it('matches English without regard to case', () => {
    expect(filterCatalogueItems(images, 'SUNLIGHT').map((item) => item.id)).toEqual(['image-1'])
  })

  it('matches partial Chinese strings', () => {
    expect(filterCatalogueItems(images, '郵筒').map((item) => item.id)).toEqual(['image-2'])
  })

  it('matches partial Japanese strings', () => {
    expect(filterCatalogueItems(manga, '図書').map((item) => item.id)).toEqual(['manga-3'])
  })

  it('trims whitespace and returns every item for an empty search', () => {
    expect(filterCatalogueItems(images, '  morning  ').map((item) => item.id)).toEqual(['image-1'])
    expect(filterCatalogueItems(images, '   ')).toEqual(images)
  })

  it('returns no items when nothing matches', () => {
    expect(filterCatalogueItems(manga, 'not-found')).toEqual([])
  })

  it('returns every distinct tag in alphabetical order', () => {
    expect(getCatalogueTags(manga)).toEqual(['奇幻', '日常', '短篇'])
  })

  it('filters by a single tag', () => {
    expect(filterCatalogueItems(manga, '', ['日常']).map((item) => item.id)).toEqual(['manga-1'])
  })

  it('requires every selected tag in AND mode', () => {
    const items = [
      { id: 'one', title: 'One', tags: ['日常', '短篇'] },
      { id: 'two', title: 'Two', tags: ['日常'] },
      { id: 'three', title: 'Three', tags: ['短篇'] },
    ]
    expect(filterCatalogueItems(items, '', ['日常', '短篇']).map((item) => item.id)).toEqual(['one'])
  })

  it('returns any matching item in OR mode', () => {
    const items = [
      { id: 'one', title: 'One', tags: ['日常', '短篇'] },
      { id: 'two', title: 'Two', tags: ['日常'] },
      { id: 'three', title: 'Three', tags: ['奇幻'] },
    ]
    expect(filterCatalogueItems(items, '', ['日常', '奇幻'], 'or').map((item) => item.id)).toEqual(['one', 'two', 'three'])
  })

  it('combines search and tag filters', () => {
    expect(filterCatalogueItems(manga, 'Paper', ['日常']).map((item) => item.id)).toEqual(['manga-1'])
  })

  it('returns no items when selected tags do not match', () => {
    expect(filterCatalogueItems(manga, '', ['奇幻', '日常']).map((item) => item.id)).toEqual([])
  })

  it('returns every item again after clearing all tags', () => {
    expect(filterCatalogueItems(manga, '', [])).toEqual(manga)
  })
})
