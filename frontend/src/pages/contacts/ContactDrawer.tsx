import { X } from 'lucide-react'
import type { Contact, CreateContactRequest } from '../../../../shared/types'
import { ContactForm } from './ContactForm'

interface ContactDrawerProps {
  isOpen: boolean
  contact?: Contact | null
  onClose: () => void
  onSubmit: (data: CreateContactRequest) => void
  isSubmitting?: boolean
}

export function ContactDrawer({
  isOpen,
  contact,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ContactDrawerProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="drawer-overlay"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="drawer-panel max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700/40">
          <h2 className="text-xl font-semibold font-display text-white">
            {contact ? 'Editar Associado' : 'Novo Associado'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 focus:outline-none"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ContactForm
            contact={contact}
            onSubmit={onSubmit}
            onClose={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </>
  )
}
