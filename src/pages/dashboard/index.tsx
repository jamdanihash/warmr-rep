import { BarChart3, Users, Phone, Calendar } from 'lucide-react';

function StatCard({ title, value, icon: Icon, trend }: { title: string; value: string; icon: any; trend?: { value: string; positive: boolean } }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <p className={`mt-2 text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value} from last month
            </p>
          )}
        </div>
        <div className="p-3 bg-brand-50 rounded-full">
          <Icon className="h-6 w-6 text-brand-600" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Prospects"
            value="2,543"
            icon={Users}
            trend={{ value: '12%', positive: true }}
          />
          <StatCard
            title="Successful Calls"
            value="847"
            icon={Phone}
            trend={{ value: '8%', positive: true }}
          />
          <StatCard
            title="Conversion Rate"
            value="33.4%"
            icon={BarChart3}
            trend={{ value: '2.1%', positive: false }}
          />
          <StatCard
            title="Scheduled Follow-ups"
            value="156"
            icon={Calendar}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <div className="mt-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New prospect added</p>
                    <p className="text-sm text-gray-500">Tech Solutions Inc.</p>
                  </div>
                  <span className="text-sm text-gray-500">2h ago</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Calls</h2>
            <div className="mt-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Meeting with John Doe</p>
                    <p className="text-sm text-gray-500">Software Development Services</p>
                  </div>
                  <span className="text-sm text-brand-600">Today, 2:00 PM</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}