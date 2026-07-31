import type { ReactNode } from 'react'
import type { z } from 'zod'
import { useCatalogData } from '../hooks/useCatalogData'
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
  let content: ReactNode
  if (state.status === 'loading') {
    content = <p className="catalogue-status" role="status">正在載入資料…</p>
  } else if (state.status === 'error') {
    content = <p className="catalogue-status catalogue-status--error" role="alert">{state.message}</p>
  } else if (state.catalog.items.length === 0) {
    content = <p className="catalogue-status">目前沒有可顯示的收藏。</p>
  } else {
    content = <>
      <p className="catalogue-count">共 {state.catalog.items.length} 筆虛構示範資料</p>
      <div className="placeholder-grid" aria-label={`${title}資料列表`}>
        {state.catalog.items.map((item) => <article className="catalogue-item" key={item.id}>
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
    <div className="phase-card"><div className="phase-card__number" aria-hidden="true">02</div><div><p className="phase-card__label">目前階段</p><h2>資料層已就位</h2><p>這個頁面使用共用 hook 載入並驗證虛構 fixture。搜尋與篩選將在後續階段加入。</p></div></div>
    {content}
  </section>
}
