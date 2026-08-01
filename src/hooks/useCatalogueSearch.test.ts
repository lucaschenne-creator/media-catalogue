import { describe, expect, it } from 'vitest'
import { filterCatalogueItems } from './useCatalogueSearch'

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
})
