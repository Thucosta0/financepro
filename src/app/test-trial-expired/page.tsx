'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  TrendingUp, 
  Crown,
  X,
  Plus,
  Eye,
  EyeOff,
  CreditCard
} from 'lucide-react'
import { PlanosPreview } from './planos-preview'

export default function TestTrialExpiredPage() {
  const router = useRouter()
  const [showExpiredView, setShowExpiredView] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planos'>('dashboard')

  // Componente que simula o SubscriptionStatus quando expirado
  const ExpiredSubscriptionStatus = () => (
    <Card className="p-4 bg-red-50 border-2 border-red-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-800">
              Trial de 30 dias expirado
            </h3>
            <p className="text-sm text-red-600">
              Faça upgrade para continuar com acesso ilimitado
            </p>
          </div>
        </div>
        
        <Button
          onClick={() => router.push('/planos')}
          size="sm"
          className="bg-red-600 hover:bg-red-700"
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          Renovar Agora
        </Button>
      </div>

      <div className="mt-4 p-3 bg-red-100 rounded-lg">
        <p className="text-sm text-red-700">
          ⚠️ <strong>Acesso bloqueado:</strong> Seu trial completo de 30 dias expirou. Faça upgrade para continuar usando todas as funcionalidades.
        </p>
      </div>
    </Card>
  )

  // Componente que simula modal bloqueado
  const BlockedTransactionModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full m-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Nova Transação</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h4 className="text-xl font-bold text-red-800 mb-2">Acesso Bloqueado</h4>
          <p className="text-gray-600 mb-6">
            Seu trial de 30 dias expirou. Faça upgrade para continuar criando transações.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/planos')}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Fazer Upgrade Agora
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const [showBlockedModal, setShowBlockedModal] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header de Teste */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🧪 Teste: Trial Expirado
          </h1>
          <p className="text-gray-600 mb-6">
            Simule como fica a interface quando o trial de 30 dias expira
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={() => setShowExpiredView(!showExpiredView)}
              className={`${
                showExpiredView 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {showExpiredView ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Ocultar Trial Expirado
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Simular Trial Expirado
                </>
              )}
            </Button>

            {/* Abas de Navegação */}
            <div className="flex bg-white rounded-lg p-1 shadow-lg">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setActiveTab('planos')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'planos'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <CreditCard className="w-4 h-4 mr-1 inline" />
                Página de Planos
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo baseado na aba ativa */}
        {activeTab === 'dashboard' && (
          <>
            {/* Status da Assinatura */}
            {showExpiredView && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">📊 Banner de Status (Trial Expirado)</h2>
                <ExpiredSubscriptionStatus />
              </div>
            )}

            {/* Simulação de Dashboard */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Dashboard Principal</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">✅ Visualização de dados: <strong>Permitida</strong></p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">✅ Gráficos e relatórios: <strong>Funcionam</strong></p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <p className="text-sm text-red-600">❌ Criar transações: <strong>Bloqueado</strong></p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <p className="text-sm text-red-600">❌ Criar categorias: <strong>Bloqueado</strong></p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Ações do Usuário</h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowBlockedModal(true)}
                    className="w-full"
                    disabled={!showExpiredView}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {showExpiredView ? 'Tentar Criar Transação (Bloqueado)' : 'Nova Transação'}
                  </Button>
                  
                  <Button
                    onClick={() => setActiveTab('planos')}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Ver Página de Planos
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    className="w-full"
                  >
                    Voltar ao Dashboard Real
                  </Button>
                </div>
              </Card>
            </div>

            {/* Informações do Teste */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                ℹ️ O que acontece quando o trial expira?
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">✅ Ainda Funciona:</h4>
                  <ul className="space-y-1 text-blue-600">
                    <li>• Visualização de todos os dados</li>
                    <li>• Dashboard e gráficos</li>
                    <li>• Relatórios existentes</li>
                    <li>• Navegação geral</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-700 mb-2">❌ Fica Bloqueado:</h4>
                  <ul className="space-y-1 text-red-600">
                    <li>• Criar novas transações</li>
                    <li>• Criar categorias</li>
                    <li>• Adicionar cartões</li>
                    <li>• Editar dados existentes</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Modal Bloqueado */}
            {showBlockedModal && (
              <BlockedTransactionModal onClose={() => setShowBlockedModal(false)} />
            )}
          </>
        )}

        {/* Aba da Página de Planos */}
        {activeTab === 'planos' && (
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">💳 Página de Planos (Trial Expirado)</h2>
              <p className="text-gray-600">Veja como fica a página de planos quando o trial expira</p>
            </div>
            <PlanosPreview />
          </div>
        )}
      </div>
    </div>
  )
} 