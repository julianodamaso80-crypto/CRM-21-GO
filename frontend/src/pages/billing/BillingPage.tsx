import { useState } from 'react'
import { Loader2, CreditCard, Receipt, BarChart3, Check, Star, AlertTriangle } from 'lucide-react'
import { usePlans, useSubscription, useInvoices, useUsage, useChangePlan, useCancelSubscription } from '../../hooks/useBilling'
import type { Plan } from '../../../../shared/types'

type Tab = 'subscription' | 'plans' | 'usage' | 'invoices'

export function BillingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('subscription')

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'subscription', label: 'Assinatura', icon: <CreditCard size={16} /> },
    { key: 'plans', label: 'Planos', icon: <Star size={16} /> },
    { key: 'usage', label: 'Uso', icon: <BarChart3 size={16} /> },
    { key: 'invoices', label: 'Faturas', icon: <Receipt size={16} /> },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Faturamento</h1>
        <p className="text-sm text-gray-400 mt-1">Gerencie seu plano, uso e faturas</p>
      </div>

      <div className="flex gap-1 border-b border-dark-700">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key ? 'border-primary-400 text-primary-400' : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'subscription' && <SubscriptionTab />}
      {activeTab === 'plans' && <PlansTab />}
      {activeTab === 'usage' && <UsageTab />}
      {activeTab === 'invoices' && <InvoicesTab />}
    </div>
  )
}

// --------------- Subscription Tab ---------------

function SubscriptionTab() {
  const { data: sub, isLoading } = useSubscription()
  const cancelMutation = useCancelSubscription()
  const [showCancel, setShowCancel] = useState(false)

  if (isLoading) return <Loading />

  if (!sub) return <div className="text-gray-400">Nenhuma assinatura encontrada</div>

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Ativa', color: 'bg-green-500/15 text-green-400' },
    canceled: { label: 'Cancelada', color: 'bg-red-500/15 text-red-400' },
    past_due: { label: 'Em atraso', color: 'bg-yellow-500/15 text-yellow-400' },
    trialing: { label: 'Periodo de teste', color: 'bg-blue-500/15 text-blue-400' },
  }

  const status = statusMap[sub.status] || statusMap.active

  return (
    <div className="space-y-6">
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">{sub.plan.displayName}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">{sub.plan.description}</p>
            <p className="text-3xl font-bold text-white mt-4">
              {formatCurrency(sub.plan.price)}<span className="text-sm font-normal text-gray-400">/mes</span>
            </p>
          </div>
          <CreditCard size={40} className="text-blue-400/30" />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-dark-700">
          <div>
            <p className="text-xs text-gray-400">Periodo atual</p>
            <p className="text-sm font-medium text-white">{formatDate(sub.currentPeriodStart)} - {formatDate(sub.currentPeriodEnd)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Proxima cobranca</p>
            <p className="text-sm font-medium text-white">{sub.status === 'canceled' ? 'Cancelada' : formatDate(sub.currentPeriodEnd)}</p>
          </div>
        </div>

        {sub.status === 'active' && (
          <div className="mt-6 pt-4 border-t border-dark-700 flex justify-end">
            <button onClick={() => setShowCancel(true)} className="text-sm text-red-400 hover:text-red-300 font-medium">
              Cancelar assinatura
            </button>
          </div>
        )}

        {sub.status === 'canceled' && sub.cancelAt && (
          <div className="mt-6 pt-4 border-t border-dark-700">
            <div className="flex items-center gap-2 text-yellow-400 bg-yellow-500/15 border border-yellow-500/30 rounded-lg p-3 text-sm">
              <AlertTriangle size={16} />
              Assinatura cancelada. Acesso disponivel ate {formatDate(sub.cancelAt)}.
            </div>
          </div>
        )}
      </div>

      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowCancel(false)} />
          <div className="relative bg-dark-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white">Cancelar assinatura</h3>
            <p className="text-sm text-gray-400 mt-2">
              Voce perdera acesso aos recursos do plano ao final do periodo atual. Tem certeza?
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCancel(false)} className="px-4 py-2 text-sm text-gray-300 border border-dark-600 rounded-lg hover:bg-dark-700">Manter</button>
              <button onClick={() => { cancelMutation.mutate(); setShowCancel(false) }}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">Cancelar assinatura</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --------------- Plans Tab ---------------

function PlansTab() {
  const { data: plans, isLoading } = usePlans()
  const { data: sub } = useSubscription()
  const changePlanMutation = useChangePlan()

  if (isLoading) return <Loading />

  const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const formatLimit = (v: number) => v === -1 ? 'Ilimitado' : v.toString()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans?.map((plan: Plan) => {
        const isCurrent = sub?.planId === plan.id
        return (
          <div key={plan.id} className={`bg-dark-800 border rounded-xl p-6 flex flex-col ${plan.isPopular ? 'border-primary-400 ring-2 ring-primary-500/20' : 'border-dark-700'}`}>
            {plan.isPopular && (
              <div className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-2">Mais popular</div>
            )}
            <h3 className="text-lg font-bold text-white">{plan.displayName}</h3>
            <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
            <p className="text-3xl font-bold text-white mt-4">
              {plan.price === 0 ? 'Gratis' : formatCurrency(plan.price)}
              {plan.price > 0 && <span className="text-sm font-normal text-gray-400">/mes</span>}
            </p>

            <ul className="mt-6 space-y-2 flex-1">
              <PlanFeature label={`${formatLimit(plan.maxUsers)} usuarios`} />
              <PlanFeature label={`${formatLimit(plan.maxLeadsPerMonth)} leads/mes`} />
              <PlanFeature label={`${formatLimit(plan.maxDealsPerMonth)} cards/mes`} />
              <PlanFeature label={`${formatLimit(plan.maxAIMessages)} msgs IA/mes`} />
              <PlanFeature label={`${formatLimit(plan.maxWebhooks)} webhooks`} />
              <PlanFeature label={`${plan.maxStorageGB}GB armazenamento`} />
              {plan.features?.sso && <PlanFeature label="SSO (Single Sign-On)" />}
              {plan.features?.dedicated_support && <PlanFeature label="Suporte dedicado" />}
            </ul>

            <div className="mt-6">
              {isCurrent ? (
                <div className="w-full text-center px-4 py-2 bg-dark-700 text-gray-400 rounded-lg text-sm font-medium">
                  Plano atual
                </div>
              ) : (
                <button
                  onClick={() => changePlanMutation.mutate(plan.id)}
                  disabled={changePlanMutation.isPending}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                    plan.isPopular ? 'bg-primary-500 text-white hover:bg-primary-400' : 'bg-gray-100 text-white hover:bg-gray-200/10'
                  } disabled:opacity-50`}>
                  {changePlanMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Escolher plano
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PlanFeature({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-gray-400">
      <Check size={14} className="text-green-500 flex-shrink-0" />
      {label}
    </li>
  )
}

// --------------- Usage Tab ---------------

function UsageTab() {
  const { data: usage, isLoading } = useUsage()

  if (isLoading) return <Loading />
  if (!usage) return null

  const items = [
    { key: 'users', label: 'Usuarios', unit: '' },
    { key: 'leads', label: 'Leads/mes', unit: '' },
    { key: 'deals', label: 'Cards/mes', unit: '' },
    { key: 'aiMessages', label: 'Mensagens IA/mes', unit: '' },
    { key: 'webhooks', label: 'Webhooks', unit: '' },
    { key: 'apiCalls', label: 'Chamadas API/dia', unit: '' },
    { key: 'storage', label: 'Armazenamento', unit: 'GB' },
  ] as const

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const data = usage[item.key]
        const pct = data.limit === -1 ? 0 : Math.min((data.used / data.limit) * 100, 100)
        const isWarning = pct > 80
        const isCritical = pct > 95
        return (
          <div key={item.key} className="bg-dark-800 border border-dark-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">{item.label}</span>
              <span className="text-sm text-gray-400">
                {data.used}{item.unit} / {data.limit === -1 ? 'Ilimitado' : `${data.limit}${item.unit}`}
              </span>
            </div>
            {data.limit !== -1 && (
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-primary-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// --------------- Invoices Tab ---------------

function InvoicesTab() {
  const { data: invoices, isLoading } = useInvoices()

  if (isLoading) return <Loading />

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const statusColors: Record<string, string> = {
    paid: 'bg-green-500/15 text-green-400',
    pending: 'bg-yellow-500/15 text-yellow-400',
    failed: 'bg-red-500/15 text-red-400',
  }

  const statusLabels: Record<string, string> = {
    paid: 'Pago',
    pending: 'Pendente',
    failed: 'Falhou',
  }

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-dark-700">
        <thead className="bg-dark-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Periodo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Valor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pago em</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-700">
          {invoices?.map((inv) => (
            <tr key={inv.id} className="hover:bg-dark-700">
              <td className="px-6 py-4 text-sm text-white">
                {formatDate(inv.periodStart)} - {formatDate(inv.periodEnd)}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-white">{formatCurrency(inv.amount)}</td>
              <td className="px-6 py-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[inv.status] || ''}`}>
                  {statusLabels[inv.status] || inv.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-400">{inv.paidAt ? formatDate(inv.paidAt) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {invoices?.length === 0 && (
        <div className="text-center p-8 text-gray-400 text-sm">Nenhuma fatura encontrada</div>
      )}
    </div>
  )
}

// --------------- Shared ---------------

function Loading() {
  return (
    <div className="flex justify-center p-12">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
    </div>
  )
}
