import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FinancialProvider } from '@/context/financial-context';
import { AuthProvider } from '@/context/auth-context';
import { ConditionalNavigation } from '@/components/conditional-navigation';
import { AIAssistantWrapper } from '@/components/ai-assistant-wrapper';

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#4F46E5',
}

export const metadata: Metadata = {
  title: "FinancePRO - Gestão Financeira Completa",
  description: "Controle suas finanças de forma inteligente com o FinancePRO. Gerencie cartões, transações, orçamentos e muito mais.",
  keywords: "finanças, gestão financeira, controle de gastos, orçamento pessoal, financepro",
  authors: [{ name: "FinancePRO Team" }],
  manifest: "/manifest.json",
  icons: [
    {
      url: "/favicon.svg",
      type: "image/svg+xml",
    },
    {
      url: "/favicon.ico",
      sizes: "32x32",
      type: "image/x-icon",
    },
    {
      url: "/favicon.png",
      sizes: "32x32",
      type: "image/png",
    },
    {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
      rel: "apple-touch-icon",
    },
    {
      url: "/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      url: "/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#4F46E5" />
        
        {/* Configurações adicionais para prevenir zoom */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Previne zoom em todos os navegadores */
            html, body {
              touch-action: manipulation;
              -webkit-text-size-adjust: 100%;
              -moz-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
              text-size-adjust: 100%;
            }
            
            /* Previne zoom ao fazer duplo toque */
            * {
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
            
            /* Permite seleção de texto em inputs e elementos de texto */
            input, textarea, [contenteditable="true"] {
              -webkit-user-select: auto;
              -khtml-user-select: auto;
              -moz-user-select: auto;
              -ms-user-select: auto;
              user-select: auto;
            }
            
            /* Previne zoom no Safari iOS */
            input[type="text"], 
            input[type="email"], 
            input[type="password"], 
            input[type="number"], 
            input[type="tel"], 
            input[type="url"], 
            input[type="search"], 
            textarea, 
            select {
              font-size: 16px !important;
              transform-origin: left top;
              transform: scale(1);
            }
            
            /* Previne zoom com gestos no Chrome/Safari */
            html {
              -ms-touch-action: manipulation;
              touch-action: manipulation;
            }
            
            /* Previne zoom com Ctrl+Scroll no desktop */
            body {
              zoom: 1.0;
              -moz-transform: scale(1.0);
              -webkit-transform: scale(1.0);
              transform: scale(1.0);
              -moz-transform-origin: 0 0;
              -webkit-transform-origin: 0 0;
              transform-origin: 0 0;
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <FinancialProvider>
            <ConditionalNavigation>
              {children}
            </ConditionalNavigation>
            <AIAssistantWrapper />
          </FinancialProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
