import { useState } from 'react'
import type { ContactWithStats } from '../../../../shared/types'
import { useDeleteContact } from '../../hooks/useContacts'
import { MoreVertical, Edit, Trash2, Eye, AlertTriangle, Calendar } from 'lucide-react'

interface ContactsTableProps {
  contacts: ContactWithStats[]
  onEdit: (contact: ContactWithStats) => void
  onView: (contact: ContactWithStats) => void
}

export function ContactsTable({ contacts, onEdit, onView }: ContactsTableProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const deleteContact = useDeleteContact()

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o paciente "${name}"?`)) {
      await deleteContact.mutateAsync(id)
      setActionMenuOpen(null)
    }
  }

  const formatDate = (d?: string) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const calcAge = (dob?: string) => {
    if (!dob) return null
    const birth = new Date(dob)
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--
    return age
  }

  if (contacts.length === 0) {
    return (
      <div className="bg-dark-800 rounded-lg border border-dark-700 p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Nenhum paciente encontrado</h3>
          <p className="text-gray-400 mb-6">Comece cadastrando seu primeiro paciente</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-700">
          <thead className="bg-dark-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Convenio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Medico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ultima Visita</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Prox. Retorno</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Alertas</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Acoes</th>
            </tr>
          </thead>
          <tbody className="bg-dark-800 divide-y divide-dark-700">
            {contacts.map((patient) => {
              const age = calcAge(patient.dateOfBirth)
              const hasAllergy = !!patient.allergies
              const isReturnSoon = patient.nextVisitAt && new Date(patient.nextVisitAt).getTime() <= Date.now() + 7 * 24 * 60 * 60 * 1000

              return (
                <tr key={patient.id} className="hover:bg-dark-700 transition-colors cursor-pointer" onClick={() => onView(patient)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                          <span className="text-primary-200 font-medium text-sm">
                            {patient.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{patient.fullName}</div>
                        <div className="text-xs text-gray-400">
                          {age !== null && <span>{age} anos</span>}
                          {patient.bloodType && <span className="ml-2 text-red-400 font-medium">{patient.bloodType}</span>}
                          {patient.cpf && <span className="ml-2">CPF: {patient.cpf}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {patient.phone || patient.whatsapp || <span className="text-gray-500">-</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.convenioName ? (
                      <div>
                        <div className="text-sm text-white">{patient.convenioName}</div>
                        {patient.convenioNumber && <div className="text-xs text-gray-400">{patient.convenioNumber}</div>}
                      </div>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-gray-400">Particular</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {patient.preferredDoctorName || <span className="text-gray-500">-</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(patient.lastVisitAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.nextVisitAt ? (
                      <span className={`text-sm ${isReturnSoon ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                        {formatDate(patient.nextVisitAt)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {hasAllergy && (
                        <span title={`Alergias: ${patient.allergies}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-500/15 text-red-400">
                          <AlertTriangle size={10} /> Alergia
                        </span>
                      )}
                      {patient.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded text-xs bg-blue-500/15 text-blue-400">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block text-left">
                      <button onClick={(e) => { e.stopPropagation(); setActionMenuOpen(actionMenuOpen === patient.id ? null : patient.id) }}
                        className="text-gray-500 hover:text-gray-300">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {actionMenuOpen === patient.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActionMenuOpen(null) }} />
                          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg shadow-black/20 bg-dark-800 ring-1 ring-dark-600 z-20">
                            <div className="py-1">
                              <button onClick={(e) => { e.stopPropagation(); onView(patient); setActionMenuOpen(null) }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-700">
                                <Eye className="w-4 h-4 mr-3" /> Visualizar
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); onEdit(patient); setActionMenuOpen(null) }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-700">
                                <Edit className="w-4 h-4 mr-3" /> Editar
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(patient.id, patient.fullName) }}
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
