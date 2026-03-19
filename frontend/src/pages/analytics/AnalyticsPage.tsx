import { useState } from 'react'
import {
  BarChart3,
  Target,
  Megaphone,
  Filter,
  TrendingUp,
  DollarSign,
  Activity,
} from 'lucide-react'
import { AnalyticsFilters } from './components/AnalyticsFilters'
import { OverviewTab } from './components/OverviewTab'
import { SourcesTab } from './components/SourcesTab'
import { CampaignsTab } from './components/CampaignsTab'
import { FunnelTab } from './components/FunnelTab'
import { LTVTab } from './components/LTVTab'
import { ROITab } from './components/ROITab'
import { TrendsTab } from './components/TrendsTab'
import type { AnalyticsFilters as FiltersType } from '../../../../shared/types'

type Tab = 'overview' | 'sources' | 'campaigns' | 'funnel' | 'ltv' | 'roi' | 'trends'

const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
  { key: 'overview', label: 'Visao Geral', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'sources', label: 'Origens', icon: <Target className="w-4 h-4" /> },
  { key: 'campaigns', label: 'Campanhas', icon: <Megaphone className="w-4 h-4" /> },
  { key: 'funnel', label: 'Funil', icon: <Filter className="w-4 h-4" /> },
  { key: 'ltv', label: 'LTV', icon: <DollarSign className="w-4 h-4" /> },
  { key: 'roi', label: 'ROI', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'trends', label: 'Tendencias', icon: <Activity className="w-4 h-4" /> },
]

function getDefaultDateRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [filters, setFilters] = useState<FiltersType>(getDefaultDateRange)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">
          Analise completa de marketing, vendas e performance
        </p>
      </div>

      {/* Filters */}
      <AnalyticsFilters filters={filters} onChange={setFilters} />

      {/* Tabs */}
      <div className="border-b border-dark-700">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-primary-400 text-primary-200'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-dark-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab filters={filters} />}
        {activeTab === 'sources' && <SourcesTab filters={filters} />}
        {activeTab === 'campaigns' && <CampaignsTab filters={filters} />}
        {activeTab === 'funnel' && <FunnelTab filters={filters} />}
        {activeTab === 'ltv' && <LTVTab filters={filters} />}
        {activeTab === 'roi' && <ROITab filters={filters} />}
        {activeTab === 'trends' && <TrendsTab filters={filters} />}
      </div>
    </div>
  )
}
