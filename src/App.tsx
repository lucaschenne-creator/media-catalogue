import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { CataloguePage } from './pages/CataloguePage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate replace to="/images" />} />
        <Route
          path="images"
          element={
            <CataloguePage
              eyebrow="Image library"
              title="圖片庫"
              description="整理圖片、標題與標籤。縮圖瀏覽與 Lightbox 將在後續階段加入。"
              accent="sage"
            />
          }
        />
        <Route
          path="manga"
          element={
            <CataloguePage
              eyebrow="Manga collection"
              title="漫畫收藏"
              description="集中管理封面、作者、來源與多重標籤，快速回到收藏作品。"
              accent="clay"
            />
          }
        />
        <Route path="*" element={<Navigate replace to="/images" />} />
      </Route>
    </Routes>
  )
}

export default App
