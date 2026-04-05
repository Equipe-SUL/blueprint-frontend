type DashboardErrorProps = {
  title: string
  message: string
  onRetry: () => void
}

export default function DashboardError({ title, message, onRetry }: DashboardErrorProps) {
  return (
    <div className="dashboard-error-wrapper">
      <div className="dashboard-error-box">
        <h3>{title}</h3>
        <p>{message}</p>
        <button className="dashboard-retry-btn" onClick={onRetry}>
          Tentar novamente
        </button>
      </div>
    </div>
  )
}