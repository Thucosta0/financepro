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
  initialScale: 1.0,
  maximumScale: 1.0,
  minimumScale: 1.0,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#4F46E5',
  colorScheme: 'light',
}

export const metadata: Metadata = {
  title: "FinancePRO - Gestão Financeira Completa",
  description: "Controle suas finanças de forma inteligente com o FinancePRO. Gerencie cartões, transações, orçamentos e muito mais.",
  keywords: "finanças, gestão financeira, controle de gastos, orçamento pessoal, financepro",
  authors: [{ name: "FinancePRO Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FinancePRO',
    startupImage: '/icons/icon-512x512.png',
  },
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
        
        {/* Meta tags avançadas para prevenir zoom */}
        <meta name="theme-color" content="#4F46E5" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FinancePRO" />
        <meta name="application-name" content="FinancePRO" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="width" />
        
        {/* Previne zoom - CSS e JavaScript integrados */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* === PREVENÇÃO DE ZOOM ULTRA ROBUSTA === */
            
            /* Configurações globais */
            html {
              -webkit-text-size-adjust: 100% !important;
              -moz-text-size-adjust: 100% !important;
              -ms-text-size-adjust: 100% !important;
              text-size-adjust: 100% !important;
              touch-action: manipulation !important;
              -ms-touch-action: manipulation !important;
              -webkit-touch-callout: none !important;
              -webkit-user-select: none !important;
              user-select: none !important;
              zoom: 1.0 !important;
              min-zoom: 1.0 !important;
              max-zoom: 1.0 !important;
              overflow-x: hidden !important;
            }
            
            body {
              touch-action: manipulation !important;
              -ms-touch-action: manipulation !important;
              -webkit-text-size-adjust: 100% !important;
              -moz-text-size-adjust: 100% !important;
              text-size-adjust: 100% !important;
              zoom: 1.0 !important;
              -moz-transform: scale(1.0) !important;
              -webkit-transform: scale(1.0) !important;
              transform: scale(1.0) !important;
              -moz-transform-origin: 0 0 !important;
              -webkit-transform-origin: 0 0 !important;
              transform-origin: 0 0 !important;
              -webkit-user-select: none !important;
              -moz-user-select: none !important;
              user-select: none !important;
              overflow-x: hidden !important;
              position: relative !important;
            }
            
            /* Previne zoom em todos os elementos */
            * {
              -webkit-touch-callout: none !important;
              -webkit-user-select: none !important;
              -khtml-user-select: none !important;
              -moz-user-select: none !important;
              -ms-user-select: none !important;
              user-select: none !important;
              -webkit-tap-highlight-color: transparent !important;
              -webkit-focus-ring-color: transparent !important;
              outline: none !important;
            }
            
            /* Permite seleção apenas em elementos de entrada */
            input, 
            textarea, 
            [contenteditable="true"], 
            [contenteditable=""],
            .selectable {
              -webkit-user-select: auto !important;
              -khtml-user-select: auto !important;
              -moz-user-select: auto !important;
              -ms-user-select: auto !important;
              user-select: auto !important;
            }
            
            /* Previne zoom no Safari iOS com font-size */
            input[type="text"], 
            input[type="email"], 
            input[type="password"], 
            input[type="number"], 
            input[type="tel"], 
            input[type="url"], 
            input[type="search"], 
            input[type="date"],
            input[type="time"],
            input[type="datetime-local"],
            textarea, 
            select {
              font-size: 16px !important;
              -webkit-transform: scale(1) !important;
              -moz-transform: scale(1) !important;
              transform: scale(1) !important;
              -webkit-transform-origin: left top !important;
              -moz-transform-origin: left top !important;
              transform-origin: left top !important;
              zoom: 1 !important;
            }
            
            /* Previne zoom em botões e links */
            button, 
            a, 
            [role="button"] {
              -webkit-touch-callout: none !important;
              -webkit-user-select: none !important;
              user-select: none !important;
              touch-action: manipulation !important;
            }
            
            /* Configurações específicas para WebKit */
            @media screen and (-webkit-min-device-pixel-ratio: 0) {
              html {
                -webkit-text-size-adjust: 100% !important;
              }
              
              select,
              textarea,
              input {
                font-size: 16px !important;
              }
            }
            
            /* Configurações para Firefox */
            @-moz-document url-prefix() {
              html {
                -moz-text-size-adjust: 100% !important;
              }
            }
            
            /* Desabilita context menu em mobile */
            img, 
            svg, 
            picture {
              -webkit-touch-callout: none !important;
              -webkit-user-select: none !important;
              user-select: none !important;
              pointer-events: none !important;
            }
            
            /* Permite pointer events apenas em elementos interativos */
            button, 
            input, 
            textarea, 
            select, 
            a, 
            [role="button"], 
            [tabindex] {
              pointer-events: auto !important;
            }
            
            /* Remove outline focus que pode causar zoom */
            :focus {
              outline: none !important;
              -webkit-tap-highlight-color: transparent !important;
            }
            
            /* Previne scroll horizontal que pode ativar zoom */
            html, body {
              overflow-x: hidden !important;
              max-width: 100vw !important;
            }
            
            /* Configurações para PWA fullscreen */
            @media all and (display-mode: standalone) {
              html, body {
                -webkit-user-select: none !important;
                user-select: none !important;
                touch-action: manipulation !important;
              }
            }
          `
        }} />
        

        
        {/* JavaScript para interceptar eventos de zoom */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              'use strict';
              
              // Previne zoom via JavaScript
              let lastTouchEnd = 0;
              let lastTouchDistance = 0;
              let lastScale = 1;
              
              // Detecta e previne duplo toque (double tap)
              document.addEventListener('touchend', function(event) {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                  event.preventDefault();
                  event.stopPropagation();
                  return false;
                }
                lastTouchEnd = now;
              }, { passive: false });
              
              // Previne gestos de zoom (pinch)
              document.addEventListener('touchstart', function(event) {
                if (event.touches.length > 1) {
                  event.preventDefault();
                  event.stopPropagation();
                  return false;
                }
              }, { passive: false });
              
              document.addEventListener('touchmove', function(event) {
                if (event.touches.length > 1) {
                  event.preventDefault();
                  event.stopPropagation();
                  return false;
                }
                
                // Previne scroll horizontal excessivo
                const touch = event.touches[0];
                if (touch) {
                  const deltaX = Math.abs(touch.clientX - (touch.target.offsetWidth / 2));
                  if (deltaX > touch.target.offsetWidth * 0.3) {
                    event.preventDefault();
                  }
                }
              }, { passive: false });
              
              // Previne zoom via teclado (Ctrl + Plus/Minus)
              document.addEventListener('keydown', function(event) {
                if ((event.ctrlKey || event.metaKey) && 
                    (event.key === '+' || event.key === '-' || event.key === '=' || 
                     event.keyCode === 187 || event.keyCode === 189 || event.keyCode === 107 || event.keyCode === 109)) {
                  event.preventDefault();
                  event.stopPropagation();
                  return false;
                }
                
                // Previne F11 (fullscreen que pode causar zoom)
                if (event.keyCode === 122) {
                  event.preventDefault();
                  return false;
                }
              }, { passive: false });
              
              // Previne zoom via mouse wheel + Ctrl
              document.addEventListener('wheel', function(event) {
                if (event.ctrlKey || event.metaKey) {
                  event.preventDefault();
                  event.stopPropagation();
                  return false;
                }
              }, { passive: false });
              
              // Detecta mudanças no zoom e redefine
              let lastInnerWidth = window.innerWidth;
              let lastInnerHeight = window.innerHeight;
              
              function checkZoom() {
                const currentWidth = window.innerWidth;
                const currentHeight = window.innerHeight;
                
                // Se a largura ou altura mudou drasticamente, pode ser zoom
                if (Math.abs(currentWidth - lastInnerWidth) > 50 || 
                    Math.abs(currentHeight - lastInnerHeight) > 50) {
                  
                  // Força reset do viewport
                  const viewport = document.querySelector('meta[name="viewport"]');
                  if (viewport) {
                    viewport.setAttribute('content', 
                      'width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no,viewport-fit=cover'
                    );
                  }
                }
                
                lastInnerWidth = currentWidth;
                lastInnerHeight = currentHeight;
              }
              
              // Monitora mudanças de tamanho
              window.addEventListener('resize', checkZoom);
              window.addEventListener('orientationchange', function() {
                setTimeout(checkZoom, 500);
              });
              
              // Previne context menu que pode interferir
              document.addEventListener('contextmenu', function(event) {
                if (!event.target.tagName || 
                    !['INPUT', 'TEXTAREA'].includes(event.target.tagName.toUpperCase())) {
                  event.preventDefault();
                  return false;
                }
              });
              
              // Configuração inicial
              setTimeout(function() {
                document.body.style.zoom = '1';
                document.documentElement.style.zoom = '1';
                checkZoom();
              }, 100);
              
              // Força escala em 1 periodicamente
              setInterval(function() {
                if (window.visualViewport && window.visualViewport.scale !== 1) {
                  window.scrollTo(0, 0);
                }
              }, 1000);
              
            })();
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
