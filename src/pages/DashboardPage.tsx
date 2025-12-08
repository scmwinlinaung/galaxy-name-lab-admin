import { StatsCard } from '../components/StatsCard';
import { ChartComponent } from '../components/ChartComponent';
import { Card, CardHeader } from '../widgets';
import { Users, TrendingUp, Package, ShoppingCart, BarChart3, FileText } from 'lucide-react';

export function DashboardPage() {
  const stats = [
    { title: 'Total Users', value: '1,234', icon: Users, change: '+12%', changeType: 'positive' as const },
    { title: 'Revenue', value: '$45,678', icon: TrendingUp, change: '+23%', changeType: 'positive' as const },
    { title: 'Products', value: '89', icon: Package, change: '+5%', changeType: 'positive' as const },
    { title: 'Orders', value: '456', icon: ShoppingCart, change: '-2%', changeType: 'negative' as const },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader title="Revenue Trend" />
          <div className="p-6">
            <div className="h-64">
              <ChartComponent />
            </div>
          </div>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader title="User Growth" />
          <div className="p-6">
            <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm">User analytics chart will be displayed here</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader title="Recent Activity" />
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New package created</p>
                    <p className="text-xs text-gray-500">Premium Business Naming package</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New user registered</p>
                    <p className="text-xs text-gray-500">john.doe@example.com</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">5 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New order received</p>
                    <p className="text-xs text-gray-500">Order #12345</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">1 day ago</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader title="Quick Stats" />
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">98.5%</div>
              <p className="text-sm text-gray-600 mt-1">Customer Satisfaction</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.5%' }}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">24h</div>
              <p className="text-sm text-gray-600 mt-1">Average Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">4.9</div>
              <p className="text-sm text-gray-600 mt-1">Average Rating</p>
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;