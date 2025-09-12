import { Dashboard } from '../Dashboard'
import { Router } from 'wouter'

export default function DashboardExample() {
  return (
    <Router>
      <div className="p-6 max-w-7xl mx-auto">
        <Dashboard />
      </div>
    </Router>
  )
}