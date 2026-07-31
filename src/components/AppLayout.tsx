import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { to: '/images', label: '圖片庫', marker: '01' },
  { to: '/manga', label: '漫畫收藏', marker: '02' },
]

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink className="brand" to="/images" aria-label="Media Catalogue 首頁">
          <span className="brand-mark" aria-hidden="true">
            MC
          </span>
          <span>
            <strong>Media Catalogue</strong>
            <small>Personal archive</small>
          </span>
        </NavLink>

        <nav aria-label="主要導覽">
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link--active' : 'nav-link'
              }
              key={item.to}
              to={item.to}
            >
              <span aria-hidden="true">{item.marker}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        <span>Media Catalogue</span>
        <span>Private by design</span>
      </footer>
    </div>
  )
}
