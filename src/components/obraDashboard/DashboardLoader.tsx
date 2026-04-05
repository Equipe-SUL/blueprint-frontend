type DashboardLoaderProps = {
  message: string
}

export default function DashboardLoader({ message }: DashboardLoaderProps) {
  return (
    <div className="obra-dashboard-loading">
      <div className="list-loader">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="list-loader-square"></div>
        ))}
      </div>
      <p className="list-loading-text">{message}</p>
    </div>
  )
}