import { useRouteError } from 'react-router-dom'

export default function NotFound() {
  const error = useRouteError()

  return (
    <div className="page-content error">
      <h1>Página não encontrada</h1>
      <p>A página que você está procurando não existe.</p>
      {import.meta.env.DEV && (
        <details>
          <summary>Detalhes do erro</summary>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </details>
      )}
    </div>
  )
}
