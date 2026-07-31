type CataloguePageProps = {
  accent: 'sage' | 'clay'
  description: string
  eyebrow: string
  title: string
}

export function CataloguePage({
  accent,
  description,
  eyebrow,
  title,
}: CataloguePageProps) {
  return (
    <section className={`catalogue-page catalogue-page--${accent}`}>
      <div className="page-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>

      <div className="phase-card">
        <div className="phase-card__number" aria-hidden="true">
          01
        </div>
        <div>
          <p className="phase-card__label">目前階段</p>
          <h2>基礎架構已就位</h2>
          <p>
            這個頁面目前只提供路由與響應式版面。下一階段會加入經過驗證的假資料、載入狀態與共用資料層。
          </p>
        </div>
      </div>

      <div className="placeholder-grid" aria-label={`${title}預留內容區`}>
        {[0, 1, 2].map((item) => (
          <div className="placeholder-card" key={item}>
            <div className="placeholder-card__media" />
            <div className="placeholder-card__line placeholder-card__line--wide" />
            <div className="placeholder-card__line" />
          </div>
        ))}
      </div>
    </section>
  )
}
