import { DashboardStats } from '../dashboard-stats'

export default function DashboardStatsExample() {
  return (
    <div className="p-4">
      <DashboardStats
        totalBooks={12}
        inProgress={3}
        completed={8}
        totalWords={487500}
      />
    </div>
  )
}