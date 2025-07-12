'use client'

import { memo, useMemo } from 'react'
import { Check, Edit2, Trash2 } from 'lucide-react'
import type { Transaction } from '@/lib/supabase-client'

interface TransactionItemProps {
  transaction: Transaction
  isSelected?: boolean
  isSelectMode?: boolean
  onSelect?: (id: string) => void
  onToggleStatus?: (transaction: Transaction) => void
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: string, description: string) => void
  formatValue: (value: number) => string
  formatDate: (date: string) => string
  getCardName: (cardId?: string) => string
  isTrialExpired: boolean
}

const TransactionItem = memo(function TransactionItem({
  transaction,
  isSelected = false,
  isSelectMode = false,
  onSelect,
  onToggleStatus,
  onEdit,
  onDelete,
  formatValue,
  formatDate,
  getCardName,
  isTrialExpired
}: TransactionItemProps) {
  return (
    <div className={`p-6 transition-colors ${
      transaction.is_completed ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Checkbox de seleção em massa */}
          {isSelectMode && (
            <button
              onClick={() => onSelect?.(transaction.id)}
              className={`flex items-center justify-center w-6 h-6 rounded border-2 transition-all ${
                isSelected
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              title={isSelected ? 'Desmarcar transação' : 'Selecionar transação'}
            >
              {isSelected && <Check className="h-4 w-4" />}
            </button>
          )}
          
          {/* Checkbox para finalizar */}
          {!isSelectMode && (
            <button
              onClick={() => onToggleStatus?.(transaction)}
              className={`flex items-center justify-center w-6 h-6 rounded-lg border-2 transition-all ${
                transaction.is_completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-green-400'
              } ${isTrialExpired ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
              disabled={isTrialExpired}
              title={transaction.is_completed ? 'Marcar como pendente' : 'Marcar como finalizada'}
            >
              {transaction.is_completed && <Check className="h-4 w-4" />}
            </button>
          )}

          {/* Informações da transação */}
          <div className="flex-1">
            <h3 className={`text-lg font-medium ${
              transaction.is_completed ? 'text-gray-600 line-through' : 'text-gray-900'
            }`}>
              {transaction.description}
            </h3>
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full mr-2" 
                      style={{ backgroundColor: transaction.category?.color || '#gray' }}></span>
                {transaction.category?.name || 'Sem categoria'}
              </span>
              <span>•</span>
              <span>{getCardName(transaction.card_id)}</span>
              <span>•</span>
              <span>{formatDate(transaction.transaction_date)}</span>

              {/* Mostrar informações de parcela se existir */}
              {transaction.installment_number && transaction.total_installments && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    📅 {transaction.installment_number}/{transaction.total_installments}
                  </span>
                </>
              )}

              {transaction.is_completed && (
                <>
                  <span>•</span>
                  <span className="text-green-600 font-medium">✅ Finalizada</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Valor e botões de ação */}
        <div className="flex items-center space-x-4">
          <div className={`text-right font-semibold text-lg ${
            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
          } ${transaction.is_completed ? 'opacity-60' : ''}`}>
            {transaction.type === 'income' ? '+' : '-'}{formatValue(transaction.amount)}
          </div>

          {/* Botões de ação individual - ocultos no modo de seleção */}
          {!isSelectMode && (
            <>
              {/* Botão de editar */}
              <button
                onClick={() => onEdit?.(transaction)}
                className={`p-2 rounded-lg transition-colors ${
                  isTrialExpired 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
                title={isTrialExpired ? 'Trial expirado' : 'Editar transação'}
                disabled={isTrialExpired}
              >
                <Edit2 className="h-4 w-4" />
              </button>

              {/* Botão de excluir */}
              <button
                onClick={() => onDelete?.(transaction.id, transaction.description)}
                className={`p-2 rounded-lg transition-colors ${
                  isTrialExpired 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-red-600 hover:bg-red-50'
                }`}
                title={isTrialExpired ? 'Trial expirado' : 'Excluir transação'}
                disabled={isTrialExpired}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
})

interface TransactionsListProps {
  transactions: Transaction[]
  selectedTransactions: Set<string>
  isSelectMode: boolean
  onSelect: (id: string) => void
  onToggleStatus: (transaction: Transaction) => void
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string, description: string) => void
  formatValue: (value: number) => string
  formatDate: (date: string) => string
  getCardName: (cardId?: string) => string
  isTrialExpired: boolean
}

export const TransactionsList = memo(function TransactionsList({
  transactions,
  selectedTransactions,
  isSelectMode,
  onSelect,
  onToggleStatus,
  onEdit,
  onDelete,
  formatValue,
  formatDate,
  getCardName,
  isTrialExpired
}: TransactionsListProps) {
  const memoizedTransactions = useMemo(() => transactions, [transactions])

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {memoizedTransactions.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {memoizedTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              isSelected={selectedTransactions.has(transaction.id)}
              isSelectMode={isSelectMode}
              onSelect={onSelect}
              onToggleStatus={onToggleStatus}
              onEdit={onEdit}
              onDelete={onDelete}
              formatValue={formatValue}
              formatDate={formatDate}
              getCardName={getCardName}
              isTrialExpired={isTrialExpired}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">💳</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transação encontrada</h3>
          <p className="text-gray-600 mb-4">
            Comece adicionando sua primeira transação.
          </p>
        </div>
      )}
    </div>
  )
}) 