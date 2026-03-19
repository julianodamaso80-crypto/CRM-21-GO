import { X } from 'lucide-react'
import type { AnalyticsFilters as Filters } from '../../../../../shared/types'

interface AnalyticsFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export function AnalyticsFilters({ filters, onChange }: AnalyticsFiltersProps) {
  const hasFilters = filters.source || filters.platform

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400">De</label>
        <input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
          className="px-3 py-1.5 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400">Ate</label>
        <input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
          className="px-3 py-1.5 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
      <select
        value={filters.source || ''}
        onChange={(e) => onChange({ ...filters, source: e.target.value || undefined })}
        className="px-3 py-1.5 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      >
        <option value="">Todas origens</option>
        <option value="google">Google Ads</option>
        <option value="facebook">Meta Ads</option>
        <option value="organic">Organico</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="referral">Indicacao</option>
        <option value="instagram">Instagram</option>
        <option value="email">Email Marketing</option>
      </select>
      <select
        value={filters.platform || ''}
        onChange={(e) => onChange({ ...filters, platform: e.target.value || undefined })}
        className="px-3 py-1.5 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      >
        <option value="">Todas plataformas</option>
        <option value="google_ads">Google Ads</option>
        <option value="meta_ads">Meta Ads</option>
      </select>
      {hasFilters && (
        <button
          onClick={() => onChange({ startDate: filters.startDate, endDate: filters.endDate })}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300 border border-dark-600 rounded-lg hover:bg-dark-700"
        >
          <X className="w-3.5 h-3.5" />
          Limpar filtros
        </button>
      )}
    </div>
  )
}
