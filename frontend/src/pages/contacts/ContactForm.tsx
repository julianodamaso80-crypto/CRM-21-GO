import { useState, useEffect } from 'react'
import type { Contact, CreateContactRequest } from '../../../../shared/types'
import { X } from 'lucide-react'
import { useDoctors } from '../../hooks/useDoctors'
import { useConvenios } from '../../hooks/useConvenios'

interface ContactFormProps {
  contact?: Contact | null
  onSubmit: (data: CreateContactRequest) => void
  onClose: () => void
  isSubmitting?: boolean
}

export function ContactForm({
  contact,
  onSubmit,
  onClose,
  isSubmitting = false,
}: ContactFormProps) {
  const { data: doctors } = useDoctors()
  const { data: convenios } = useConvenios()

  const [formData, setFormData] = useState<CreateContactRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsapp: '',
    cpf: '',
    dateOfBirth: '',
    gender: undefined,
    bloodType: undefined,
    allergies: '',
    medicalNotes: '',
    convenioId: '',
    convenioNumber: '',
    responsibleName: '',
    responsiblePhone: '',
    preferredDoctorId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    tags: [],
  })

  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: contact.email || '',
        phone: contact.phone || '',
        whatsapp: contact.whatsapp || '',
        cpf: contact.cpf || '',
        dateOfBirth: contact.dateOfBirth || '',
        gender: contact.gender,
        bloodType: contact.bloodType,
        allergies: contact.allergies || '',
        medicalNotes: contact.medicalNotes || '',
        convenioId: contact.convenioId || '',
        convenioNumber: contact.convenioNumber || '',
        responsibleName: contact.responsibleName || '',
        responsiblePhone: contact.responsiblePhone || '',
        preferredDoctorId: contact.preferredDoctorId || '',
        address: contact.address || '',
        city: contact.city || '',
        state: contact.state || '',
        zipCode: contact.zipCode || '',
        tags: contact.tags || [],
      })
    }
  }, [contact])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value || undefined }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [] }))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag() }
  }

  const inputClass = 'w-full px-3 py-2 border border-dark-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm bg-dark-800 text-gray-200 placeholder-gray-500'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados Pessoais */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Dados Pessoais</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nome *</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
              className={inputClass} placeholder="Joao" required />
          </div>
          <div>
            <label className={labelClass}>Sobrenome *</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
              className={inputClass} placeholder="Silva" required />
          </div>
          <div>
            <label className={labelClass}>CPF</label>
            <input type="text" name="cpf" value={formData.cpf} onChange={handleChange}
              className={inputClass} placeholder="123.456.789-00" />
          </div>
          <div>
            <label className={labelClass}>Data de Nascimento</label>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Sexo</label>
            <select name="gender" value={formData.gender || ''} onChange={handleChange} className={inputClass}>
              <option value="">Selecione</option>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
              <option value="other">Outro</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Tipo Sanguineo</label>
            <select name="bloodType" value={formData.bloodType || ''} onChange={handleChange} className={inputClass}>
              <option value="">Selecione</option>
              <option value="A+">A+</option><option value="A-">A-</option>
              <option value="B+">B+</option><option value="B-">B-</option>
              <option value="AB+">AB+</option><option value="AB-">AB-</option>
              <option value="O+">O+</option><option value="O-">O-</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contato */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Contato</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Telefone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
              className={inputClass} placeholder="(11) 98765-4321" />
          </div>
          <div>
            <label className={labelClass}>WhatsApp</label>
            <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange}
              className={inputClass} placeholder="(11) 98765-4321" />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              className={inputClass} placeholder="paciente@email.com" />
          </div>
        </div>
      </div>

      {/* Informacoes Medicas */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Informacoes Medicas</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Alergias</label>
            <input type="text" name="allergies" value={formData.allergies} onChange={handleChange}
              className={inputClass} placeholder="Ex: Dipirona, Penicilina, Latex" />
          </div>
          <div>
            <label className={labelClass}>Observacoes Medicas</label>
            <textarea name="medicalNotes" value={formData.medicalNotes} onChange={handleChange} rows={3}
              className={inputClass} placeholder="Historico, condicoes cronicas, medicamentos em uso..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Medico Preferencial</label>
              <select name="preferredDoctorId" value={formData.preferredDoctorId || ''} onChange={handleChange} className={inputClass}>
                <option value="">Nenhum</option>
                {doctors?.filter((d) => d.isActive).map((d) => (
                  <option key={d.id} value={d.id}>{d.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Convenio</label>
              <select name="convenioId" value={formData.convenioId || ''} onChange={handleChange} className={inputClass}>
                <option value="">Particular</option>
                {convenios?.filter((c) => c.isActive).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          {formData.convenioId && (
            <div>
              <label className={labelClass}>Numero da Carteirinha</label>
              <input type="text" name="convenioNumber" value={formData.convenioNumber} onChange={handleChange}
                className={inputClass} placeholder="UNI-12345" />
            </div>
          )}
        </div>
      </div>

      {/* Responsavel */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Responsavel (menor de idade)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nome do Responsavel</label>
            <input type="text" name="responsibleName" value={formData.responsibleName} onChange={handleChange}
              className={inputClass} placeholder="Nome completo" />
          </div>
          <div>
            <label className={labelClass}>Telefone do Responsavel</label>
            <input type="tel" name="responsiblePhone" value={formData.responsiblePhone} onChange={handleChange}
              className={inputClass} placeholder="(11) 98765-4321" />
          </div>
        </div>
      </div>

      {/* Endereco */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Endereco</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Endereco</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange}
              className={inputClass} placeholder="Rua Exemplo, 123" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Cidade</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange}
                className={inputClass} placeholder="Sao Paulo" />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange}
                className={inputClass} placeholder="SP" />
            </div>
            <div>
              <label className={labelClass}>CEP</label>
              <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange}
                className={inputClass} placeholder="01234-567" />
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Tags</h3>
        <div>
          <div className="flex gap-2">
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleKeyDown}
              className={`flex-1 ${inputClass}`} placeholder="Digite e pressione Enter" />
            <button type="button" onClick={addTag} className="px-4 py-2 bg-dark-700 text-gray-300 rounded-md hover:bg-dark-600 text-sm">Adicionar</button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-500/15 text-blue-400">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-blue-400 hover:text-blue-300">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botoes */}
      <div className="flex justify-end gap-3 pt-6 border-t border-dark-700">
        <button type="button" onClick={onClose} disabled={isSubmitting}
          className="px-4 py-2 text-gray-300 bg-dark-800 border border-dark-600 rounded-md hover:bg-dark-700">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting}
          className="px-4 py-2 text-white bg-primary-500 rounded-md hover:bg-primary-400 disabled:opacity-50">
          {isSubmitting ? 'Salvando...' : contact ? 'Atualizar' : 'Cadastrar'}
        </button>
      </div>
    </form>
  )
}
