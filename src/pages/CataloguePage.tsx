import type { ReactNode } from 'react'
import type { z } from 'zod'
import { MediaCard } from '../components/MediaCard'
import { useCatalogData } from '../hooks/useCatalogData'
import { useCatalogueSearch } from '../hooks/useCatalogueSearch'
import type { Catalog, ImageItem, MangaItem } from '../types'

type CatalogueItem = ImageItem | MangaItem
type CataloguePageProps<T extends CatalogueItem> = {
  accent: 'sage' | 'clay'
  dataUrl: string
  description: string
  eyebrow: string
  schema: z.ZodType<Catalog<T>>
  title: string
}

export function CataloguePage<T extends CatalogueItem>({ accent, dataUrl, description, eyebrow, schema, title }: CataloguePageProps<T>) {
  const state = useCatalogData(dataUrl, schema)
  const items = state.status === 'success' ? state.catalog.items : []
  const {
    clearSearch,
    clearTags,
    filteredItems,
    searchTerm,
    selectedTags,
    setSearchTerm,
    setTagMatchMode,
    tagMatchMode,
    tags,
    toggleTag,
  } = useCatalogueSearch(items)
  let content: ReactNode
  if (state.status === 'loading') {
    content = <p className="catalogue-status" role="status">正在載入資料…</p>
  } else if (state.status === 'error') {
    content = <p className="catalogue-status catalogue-status--error" role="alert">{state.message}</p>
  } else if (items.length === 0) {
    content = <p className="catalogue-status">目前沒有可顯示的收藏。</p>
  } else if (filteredItems.length === 0) {
    content = <p className="catalogue-status">找不到符合目前搜尋與 Tag 條件的收藏。</p>
  } else {
    content = <>
      <div className="media-grid" aria-label={`${title}資料列表`}>
        {filteredItems.map((item) => 'author' in item
          ? <MediaCard key={item.id} type="manga" title={item.title} author={item.author} tags={item.tags} mediaKey={item.coverKey} sourceUrl={item.sourceUrl} alt={`《${item.title}》的封面`} />
          : <MediaCard key={item.id} type="image" title={item.title} tags={item.tags} mediaKey={item.thumbnailKey} alt={item.title} />)}
      </div>
    </>
  }
  return <section className={`catalogue-page catalogue-page--${accent}`}>
    <div className="page-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>
    <div className="phase-card"><div className="phase-card__number" aria-hidden="true">05</div><div><p className="phase-card__label">目前階段</p><h2>卡片瀏覽已就位</h2><p>圖片只會載入縮圖；漫畫只會載入封面。圖片原圖會在後續 Lightbox 階段才載入。</p></div></div>
    <form className="catalogue-search" role="search" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor={`catalogue-search-${accent}`}>搜尋{title}</label>
      <div className="catalogue-search__controls">
        <input id={`catalogue-search-${accent}`} type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={accent === 'clay' ? '搜尋標題、作者或標籤' : '搜尋標題或標籤'} />
        <button type="button" onClick={clearSearch} disabled={!searchTerm}>清除</button>
      </div>
    </form>
    {state.status === 'success' && items.length > 0 && <section className="catalogue-tags" aria-labelledby={`catalogue-tags-${accent}`}>
      <div className="catalogue-tags__heading">
        <div>
          <p className="catalogue-tags__label">篩選條件</p>
          <h2 id={`catalogue-tags-${accent}`}>Tag</h2>
        </div>
        <button type="button" className="catalogue-tags__clear" onClick={clearTags} disabled={selectedTags.length === 0}>清除所有 Tag</button>
      </div>
      <fieldset className="catalogue-tags__mode">
        <legend>多個 Tag 的比對方式</legend>
        <label><input type="radio" name={`tag-match-mode-${accent}`} value="and" checked={tagMatchMode === 'and'} onChange={() => setTagMatchMode('and')} />AND（必須全部符合）</label>
        <label><input type="radio" name={`tag-match-mode-${accent}`} value="or" checked={tagMatchMode === 'or'} onChange={() => setTagMatchMode('or')} />OR（符合任一即可）</label>
      </fieldset>
      <div className="catalogue-tags__list" aria-label="可選擇的 Tag">
        {tags.map((tag) => <button type="button" key={tag} className="catalogue-tag" aria-pressed={selectedTags.includes(tag)} onClick={() => toggleTag(tag)}>{tag}</button>)}
      </div>
    </section>}
    {state.status === 'success' && items.length > 0 && <p className="catalogue-count" role="status">顯示 {filteredItems.length}／{items.length} 筆虛構示範資料</p>}
    {content}
  </section>
}
