import { BarChart, LineChart, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

function MetricCard({ title, value, change }: { title: string; value: string; change: { value: string; positive: boolean } }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className={`ml-2 text-sm ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
          {change.positive ? '↑' : '↓'} {change.value}
        </p>
      </div>
    </div>
  );
}

function ChartCard({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <Button variant="outline" size="sm">
            <Icon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="mt-6 h-64 bg-gray-50 rounded flex items-center justify-center">
          <p className="text-gray-500">Chart visualization would go here</p>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <div className="flex space-x-4">
            <Button variant="outline">
              Last 7 Days
            </Button>
            <Button variant="outline">
              Export Report
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Conversion Rate"
            value="32.48%"
            change={{ value: "4.1%", positive: true }}
          />
          <MetricCard
            title="Total Calls"
            value="1,429"
            change={{ value: "12%", positive: true }}
          />
          <MetricCard
            title="Avg. Call Duration"
            value="8m 42s"
            change={{ value: "1m 12s", positive: true }}
          />
          <MetricCard
            title="Success Rate"
            value="67.8%"
            change={{ value: "2.3%", positive: false }}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Call Performance Trends" icon={LineChart} />
          <ChartCard title="Conversion by Industry" icon={PieChart} />
          <ChartCard title="Daily Call Volume" icon={BarChart} />
          <ChartCard title="Response Rate Analysis" icon={LineChart} />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Performance Breakdown</h2>
            <div className="mt-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metric
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previous
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { metric: 'Calls Made', current: '450', previous: '380', change: '+18.4%' },
                    { metric: 'Successful Connections', current: '285', previous: '210', change: '+35.7%' },
                    { metric: 'Follow-up Rate', current: '68%', previous: '62%', change: '+9.7%' },
                    { metric: 'Average Response Time', current: '1.2h', previous: '1.8h', change: '-33.3%' },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.metric}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.current}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.previous}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {row.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}