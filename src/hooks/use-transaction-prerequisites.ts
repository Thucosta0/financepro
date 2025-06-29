'use client'

import { useFinancial } from '@/context/financial-context'

export function useTransactionPrerequisites() {
  const { categories, cards } = useFinancial()
  
  const activeCards = cards.filter(card => card.is_active)
  const hasCategories = categories.length > 0
  const hasCards = activeCards.length > 0
  const canCreateTransaction = hasCategories && hasCards

  const checkPrerequisites = () => {
    return {
      canCreate: canCreateTransaction,
      hasCategories,
      hasCards,
      categoriesCount: categories.length,
      cardsCount: activeCards.length,
      missingItems: [
        ...(hasCategories ? [] : ['categorias']),
        ...(hasCards ? [] : ['cartões/contas'])
      ]
    }
  }

  return {
    canCreateTransaction,
    hasCategories,
    hasCards,
    categoriesCount: categories.length,
    cardsCount: activeCards.length,
    checkPrerequisites
  }
} 