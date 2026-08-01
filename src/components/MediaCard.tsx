import { useState } from 'react'

type MediaCardProps = {
  alt: string
  author?: string
  mediaKey: string
  sourceUrl?: string
  tags: string[]
  title: string
  type: 'image' | 'manga'
}

export function MediaCard({ alt, author, mediaKey, sourceUrl, tags, title, type }: MediaCardProps) {
  const [hasMediaError, setHasMediaError] = useState(false)
  const content = <>
    <MediaPreview alt={alt} hasMediaError={hasMediaError} mediaKey={mediaKey} onError={() => setHasMediaError(true)} />
    <div className="media-card__content">
      <h2 className="media-card__title" title={title}>{title}</h2>
      {author && <p className="media-card__author">作者：{author}</p>}
      <ul className="media-card__tags" aria-label="標籤">
        {tags.map((tag) => <li key={tag}>{tag}</li>)}
      </ul>
    </div>
  </>

  if (type === 'manga' && sourceUrl) {
    return <article className="media-card media-card--manga">
      <a className="media-card__link" href={sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`在新分頁開啟《${title}》來源頁`}>
        {content}
      </a>
    </article>
  }

  return <article className="media-card media-card--image" tabIndex={0} aria-label={`圖片：${title}`}>
    {content}
  </article>
}

type MediaPreviewProps = {
  alt: string
  hasMediaError: boolean
  mediaKey: string
  onError: () => void
}

function MediaPreview({ alt, hasMediaError, mediaKey, onError }: MediaPreviewProps) {
  if (hasMediaError) {
    return <div className="media-card__fallback" role="img" aria-label={`${alt}（縮圖載入失敗）`}>
      <span aria-hidden="true">▧</span>
      <span>縮圖無法載入</span>
    </div>
  }

  return <img className="media-card__image" src={mediaKey} alt={alt} loading="lazy" onError={onError} />
}
