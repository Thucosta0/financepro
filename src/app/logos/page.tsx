'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function LogosPage() {
  const [copiedPath, setCopiedPath] = useState<string | null>(null)

  const copyToClipboard = (path: string) => {
    navigator.clipboard.writeText(path)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  const logos = [
    {
      name: 'Logo Horizontal Completo',
      path: '/logo-horizontal.svg',
      description: 'Logo completo com ícone, texto e subtítulo. Ideal para cabeçalhos e documentos.',
      size: '280x80px',
      usage: 'Cabeçalho do site, documentos, apresentações'
    },
    {
      name: 'Logo Clean & Moderno',
      path: '/logo-clean.svg',
      description: 'Versão mais limpa e profissional. Perfeita para uso corporativo.',
      size: '320x80px',
      usage: 'Stripe, faturas, emails profissionais'
    },
    {
      name: 'Ícone Grande (128px)',
      path: '/logo-icon.svg',
      description: 'Ícone circular com gradiente. Ideal para redes sociais e avatares.',
      size: '128x128px',
      usage: 'Redes sociais, avatar, app icons'
    },
    {
      name: 'Favicon Moderno',
      path: '/favicon-new.svg',
      description: 'Favicon otimizado para tamanhos pequenos. Substituir o atual.',
      size: '32x32px',
      usage: 'Favicon do site, ícone da aba do navegador'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎨 Logotipos FinancePRO
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Logos profissionais criados para sua marca
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 className="font-bold text-blue-800 mb-2">📋 Para usar no Stripe:</h3>
            <p className="text-blue-700 text-sm">
              Recomendo o <strong>"Logo Clean & Moderno"</strong> para o logotipo completo e o 
              <strong>"Ícone Grande"</strong> para o ícone pequeno.
            </p>
          </div>
        </div>

        {/* Grid de Logos */}
        <div className="grid md:grid-cols-2 gap-8">
          {logos.map((logo, index) => (
            <Card key={index} className="p-6 bg-white shadow-lg">
              {/* Preview */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 mb-6 flex items-center justify-center min-h-[200px]">
                <img 
                  src={logo.path} 
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain"
                  style={{ 
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }}
                />
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {logo.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {logo.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Tamanho:</span>
                    <div className="text-gray-600">{logo.size}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Uso ideal:</span>
                    <div className="text-gray-600">{logo.usage}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => copyToClipboard(logo.path)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {copiedPath === logo.path ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Caminho
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => window.open(logo.path, '_blank')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Instruções para o Stripe */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📋 Como usar no Stripe
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                🎨 Configurações Recomendadas
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <strong>Ícone:</strong> /logo-icon.svg ou /favicon-new.svg
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <strong>Logotipo:</strong> /logo-clean.svg
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <strong>Cor da marca:</strong> #3B82F6
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <strong>Cor de destaque:</strong> #1D4ED8
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                📤 Passos para Upload
              </h3>
              
              <ol className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                  Acesse o dashboard do Stripe
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                  Vá em "Configurações" → "Elementos da marca"
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                  Faça upload dos arquivos SVG
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                  Configure as cores recomendadas
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">5</span>
                  Visualize o preview e salve
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            💡 Todos os logos são em formato SVG (vetorial) para melhor qualidade em qualquer tamanho
          </p>
        </div>
      </div>
    </div>
  )
} 