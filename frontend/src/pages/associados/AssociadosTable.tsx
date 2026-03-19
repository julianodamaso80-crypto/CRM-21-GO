import { useState } from 'react'
import type { AssociadoWithStats } from '../../../../shared/types'
import { useDeleteAssociado } from '../../hooks/useAssociados'
import { MoreVertical, Edit, Trash2, Eye, Users, Car } from 'lucide-react'

interface AssociadosTableProps {
  associados: AssociadoWithStats[]
  onEdit: (associado: AssociadoWithStats) => void
  onView: (associado: AssociadoWithStats) => void
}

const STATUS_CONFIG = {
  ativo: { label: 'Ativo', cls: 'bg-emerald-500/15 text-emerald-400' },
  inativo: { label: 'Inativo', cls: 'bg-dark-700 text-gray-400' },
  inadimplente: { label: 'Inadimplente', cls: 'bg-red-500/15 text-red-400' },
  cancelado: { label: 'Cancelado', cls: 'bg-gray-500/15 text-gray-500' },
  em_adesao: { label: 'Em Adesao', cls: 'bg-blue-500/15 text-blue-400' },
} as const

const ORIGEM_LABEL: Record<string, string> = {
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  instagram: 'Instagram',
  site_organico: 'Site Organico',
  indicacao: 'Indicacao',
  whatsapp: 'WhatsApp',
  direto: 'Direto',
  outro: 'Outro',
}

export function AssociadosTable({ associados, onEdit, onView }: AssociadosTableProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const deleteAssociado = useDeleteAssociado()

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o associado "${name}"?`)) {
      await deleteAssociado.mutateAsync(id)
      setActionMenuOpen(null)
    }
  }

  const formatCPF = (cpf?: string) => {
    if (!cpf) return '-'
    return cpf
  }

  if (associados.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Nenhum associado encontrado</h3>
          <p className="text-gray-400 mb-6">Comece cadastrando o primeiro associado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="table-container">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-700/40">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Associado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">WhatsApp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Veiculos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Origem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">NPS</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Acoes</th>
            </tr>
          </thead>
          <tbody className="bg-dark-800/60 divide-y divide-dark-700/40">
            {associados.map((associado) => {
              const statusCfg = STATUS_CONFIG[associado.status as keyof typeof STATUS_CONFIG] || { label: associado.status || '-', cls: 'bg-dark-700 text-gray-400' }
              const vehicleCount = associado._count?.vehicles ?? (associado.vehicles?.length ?? 0)

              return (
                <tr key={associado.id} className="table-row cursor-pointer" onClick={() => onView(associado)}>
                  {/* Nome + CPF */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                          <span className="text-gold-400 font-medium text-sm">
                            {associado.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{associado.fullName}</div>
                        <div className="text-xs text-gray-400">{formatCPF(associado.cpf)}</div>
                      </div>
                    </div>
                  </td>

                  {/* WhatsApp / Telefone */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {associado.whatsapp || associado.phone || <span className="text-gray-500">-</span>}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.cls}`}>
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Veiculos */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-300">
                      <Car className="w-4 h-4 text-gray-500" />
                      <span>{vehicleCount}</span>
                    </div>
                  </td>

                  {/* Origem */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {associado.origem ? ORIGEM_LABEL[associado.origem] || associado.origem : <span className="text-gray-600">-</span>}
                  </td>

                  {/* NPS */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {associado.npsScore != null ? (
                      <span className={`text-sm font-medium ${associado.npsScore >= 9 ? 'text-emerald-400' : associado.npsScore >= 7 ? 'text-amber-400' : 'text-red-400'}`}>
                        {associado.npsScore}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600">-</span>
                    )}
                  </td>

                  {/* Acoes */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block text-left">
                      <button onClick={(e) => { e.stopPropagation(); setActionMenuOpen(actionMenuOpen === associado.id ? null : associado.id) }}
                        className="text-gray-500 hover:text-gray-300">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {actionMenuOpen === associado.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActionMenuOpen(null) }} />
                          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg shadow-black/20 bg-dark-800/60 ring-1 ring-dark-700/40 z-20">
                            <div className="py-1">
                              <button onClick={(e) => { e.stopPropagation(); onView(associado); setActionMenuOpen(null) }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-700/50">
                                <Eye className="w-4 h-4 mr-3" /> Visualizar
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); onEdit(associado); setActionMenuOpen(null) }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-700/50">
                                <Edit className="w-4 h-4 mr-3" /> Editar
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(associado.id, associado.fullName) }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/15">
                                <Trash2 className="w-4 h-4 mr-3" /> Excluir
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
