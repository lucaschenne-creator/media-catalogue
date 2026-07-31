import { useEffect, useState } from 'react'
import type { z } from 'zod'
import type { Catalog } from '../types'

export type CatalogDataState<T> =
  | { status: 'loading' }
  | { status: 'success'; catalog: Catalog<T> }
  | { status: 'error'; message: string }

function formatValidationError(error: z.ZodError): string {
  const issue = error.issues[0]
  if (!issue) return '資料格式不正確。'
  const path = issue.path.length > 0 ? `欄位「${issue.path.join('.')}」` : '資料根目錄'
  return `資料格式不正確：${path} ${issue.message}`
}

export function useCatalogData<T>(dataUrl: string, schema: z.ZodType<Catalog<T>>): CatalogDataState<T> {
  const [state, setState] = useState<CatalogDataState<T>>({ status: 'loading' })
  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    async function loadCatalog() {
      try {
        const response = await fetch(dataUrl, { signal: controller.signal })
        if (!response.ok) throw new Error(`無法載入資料（HTTP ${response.status}）。請稍後再試。`)
        const body = await response.text()
        let parsed: unknown
        try { parsed = JSON.parse(body) as unknown } catch { throw new Error('資料檔不是有效的 JSON，請檢查檔案內容。') }
        const result = schema.safeParse(parsed)
        if (!result.success) throw new Error(formatValidationError(result.error))
        if (!controller.signal.aborted) setState({ status: 'success', catalog: result.data })
      } catch (error: unknown) {
        if (controller.signal.aborted) return
        const message = error instanceof TypeError ? '網路連線失敗，無法載入資料。請確認連線後再試。'
          : error instanceof Error ? error.message : '載入資料時發生未知錯誤。'
        setState({ status: 'error', message })
      }
    }
    void loadCatalog()
    return () => controller.abort()
  }, [dataUrl, schema])
  return state
}
