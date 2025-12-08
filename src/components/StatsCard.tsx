import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  change: string
  changeType: 'positive' | 'negative'
}

export function StatsCard({ title, value, icon: Icon, change, changeType }: StatsCardProps) {
  const isPositive = changeType === 'positive'

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>

          <div className="mt-4 flex items-center">
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isPositive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {change}
            </div>
            <span className="text-sm text-gray-500 ml-2">from last month</span>
          </div>
        </div>

        <div className={`ml-4 rounded-xl p-4 ${
          isPositive
            ? 'bg-gradient-to-br from-green-50 to-emerald-100'
            : 'bg-gradient-to-br from-red-50 to-pink-100'
        }`}>
          <Icon className={`h-8 w-8 ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`} />
        </div>
      </div>
    </div>
  )
}