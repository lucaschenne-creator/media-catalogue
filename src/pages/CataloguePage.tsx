import type { ReactNode } from 'react'
import type { z } from 'zod'
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
  const { clearSearch, filteredItems, searchTerm, setSearchTerm } = useCatalogueSearch(items)
  let content: ReactNode
  if (state.status === 'loading') {
    content = <p className="catalogue-status" role="status">正在載入資料…</p>
  } else if (state.status === 'error') {
    content = <p className="catalogue-status catalogue-status--error" role="alert">{state.message}</p>
  } else if (items.length === 0) {
    content = <p className="catalogue-status">目前沒有可顯示的收藏。</p>
  } else if (filteredItems.length === 0) {
    content = <p className="catalogue-status">找不到符合「{searchTerm.trim()}」的收藏。</p>
  } else {
    content = <>
      <p className="catalogue-count">顯示 {filteredItems.length}／{items.length} 筆虛構示範資料</p>
      <div className="placeholder-grid" aria-label={`${title}資料列表`}>
        {filteredItems.map((item) => <article className="catalogue-item" key={item.id}>
          <div className="placeholder-card__media" aria-hidden="true" />
          <h2>{item.title}</h2>
          {'author' in item && <p className="catalogue-item__author">作者：{item.author}</p>}
          <ul className="catalogue-item__tags" aria-label="標籤">{item.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
        </article>)}
      </div>
    </>
  }
  return <section className={`catalogue-page catalogue-page--${accent}`}>
    <div className="page-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>
    <div className="phase-card"><div className="phase-card__number" aria-hidden="true">03</div><div><p className="phase-card__label">目前階段</p><h2>前端搜尋已就位</h2><p>可依標題與標籤搜尋；漫畫也會比對作者。所有比對均在瀏覽器中完成。</p></div></div>
    <form className="catalogue-search" role="search" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor={`catalogue-search-${accent}`}>搜尋{title}</label>
      <div className="catalogue-search__controls">
        <input id={`catalogue-search-${accent}`} type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={accent === 'clay' ? '搜尋標題、作者或標籤' : '搜尋標題或標籤'} />
        <button type="button" onClick={clearSearch} disabled={!searchTerm}>清除</button>
      </div>
    </form>
    {content}
  </section>
}
