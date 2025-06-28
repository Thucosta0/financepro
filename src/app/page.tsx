'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  ArrowRight, 
  Smartphone, 
  TrendingUp, 
  Shield, 
  Zap, 
  CreditCard, 
  PieChart, 
  Calendar,
  Target,
  Star,
  Check,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'

// Hook para animação de contadores
function useCountUp(end: number, duration = 2000, delay = 0) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!hasStarted) return

    const timer = setTimeout(() => {
      let startTime: number
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = (currentTime - startTime) / duration
        
        if (progress < 1) {
          setCount(Math.floor(end * progress))
          requestAnimationFrame(animate)
        } else {
          setCount(end)
        }
      }
      requestAnimationFrame(animate)
    }, delay)

    return () => clearTimeout(timer)
  }, [hasStarted, end, duration, delay])

  return { count, startAnimation: () => setHasStarted(true) }
}

// Hook para detectar scroll e iniciar animações
function useInView() {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isInView])

  return { ref, isInView }
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  // Contadores animados
  const cardsCount = useCountUp(12, 1500, 800)
  const monthlyCount = useCountUp(2500, 2000, 1000)
  const recurringCount = useCountUp(8, 1200, 1200)
  const goalsCount = useCountUp(85, 1800, 1400)

  // Refs para animações
  const heroRef = useRef<HTMLDivElement>(null)
  const { ref: featuresRef, isInView: featuresInView } = useInView()
  const { ref: benefitsRef, isInView: benefitsInView } = useInView()

  // Track mouse position for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Start counters when hero is visible
  useEffect(() => {
    const timer = setTimeout(() => {
      cardsCount.startAnimation()
      monthlyCount.startAnimation()
      recurringCount.startAnimation()
      goalsCount.startAnimation()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const features = [
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Gestão de Cartões",
      description: "Controle todos seus cartões de crédito, débito e contas em um só lugar",
      color: "from-orange-500 to-amber-500",
      delay: 0
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Controle de Transações",
      description: "Registre e acompanhe todas suas receitas e despesas de forma simples",
      color: "from-blue-500 to-indigo-500",
      delay: 200
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Transações Recorrentes",
      description: "Automatize pagamentos fixos como salário, aluguel e contas mensais",
      color: "from-purple-500 to-violet-500",
      delay: 400
    },
    {
      icon: <PieChart className="h-8 w-8" />,
      title: "Relatórios Visuais",
      description: "Visualize seus gastos com gráficos interativos e relatórios detalhados",
      color: "from-green-500 to-emerald-500",
      delay: 600
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Controle de Orçamento",
      description: "Defina metas por categoria e acompanhe seu progresso financeiro",
      color: "from-red-500 to-pink-500",
      delay: 800
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Dados Seguros",
      description: "Seus dados financeiros protegidos com criptografia de ponta",
      color: "from-teal-500 to-cyan-500",
      delay: 1000
    }
  ]

  const benefits = [
    "Interface moderna e intuitiva",
    "Totalmente responsivo para mobile",
    "Sincronização em tempo real",
    "Relatórios detalhados",
    "Controle total de privacidade",
    "Suporte a múltiplas contas"
  ]

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-180deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes rotateIn {
          from {
            opacity: 0;
            transform: rotate(-180deg) scale(0.5);
          }
          to {
            opacity: 1;
            transform: rotate(0deg) scale(1);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-reverse {
          animation: floatReverse 8s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-gradient {
          background: linear-gradient(-45deg, #4F46E5, #7C3AED, #EC4899, #F59E0B);
          background-size: 400% 400%;
          animation: gradient-shift 8s ease infinite;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 3s ease-in-out infinite;
        }
        
        .animate-slide-in-left {
          animation: slideInFromLeft 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-in-right {
          animation: slideInFromRight 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-in-bottom {
          animation: slideInFromBottom 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in-scale {
          animation: fadeInScale 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-rotate-in {
          animation: rotateIn 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-800 { animation-delay: 0.8s; }
        .delay-1000 { animation-delay: 1s; }
        .delay-1200 { animation-delay: 1.2s; }
        .delay-1400 { animation-delay: 1.4s; }
        
        .parallax-element {
          transition: transform 0.3s ease-out;
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .card-hover:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-effect {
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Animated Background Particles */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-60"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-float-reverse opacity-40"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-pink-400 rounded-full animate-float opacity-80"></div>
          <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-float-reverse opacity-50"></div>
          <div className="absolute bottom-1/3 right-1/6 w-1 h-1 bg-green-400 rounded-full animate-float opacity-70"></div>
        </div>

        {/* Header */}
        <header className="relative z-50">
          <div className="animate-gradient">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                {/* Logo */}
                <div className="flex items-center space-x-2 animate-slide-in-left">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-3">
                    <span className="text-2xl font-bold text-white animate-bounce-gentle">₿</span>
                  </div>
                  <span className="text-2xl font-bold text-white">FinancePRO</span>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8 animate-slide-in-right">
                  <a href="#features" className="text-blue-100 hover:text-white transition-all duration-300 hover:scale-105 transform">
                    Recursos
                  </a>
                  <a href="#benefits" className="text-blue-100 hover:text-white transition-all duration-300 hover:scale-105 transform">
                    Benefícios
                  </a>
                  <a href="#about" className="text-blue-100 hover:text-white transition-all duration-300 hover:scale-105 transform">
                    Sobre
                  </a>
                  <Link 
                    href="/cadastro"
                    className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Começar Agora
                  </Link>
                </nav>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden text-white p-2 transition-transform duration-300 hover:scale-110"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t shadow-lg animate-slide-in-bottom glass-effect">
              <div className="px-4 py-6 space-y-4">
                <a href="#features" className="block text-gray-700 hover:text-blue-600 transition-colors">
                  Recursos
                </a>
                <a href="#benefits" className="block text-gray-700 hover:text-blue-600 transition-colors">
                  Benefícios
                </a>
                <a href="#about" className="block text-gray-700 hover:text-blue-600 transition-colors">
                  Sobre
                </a>
                <Link 
                  href="/cadastro"
                  className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium text-center transform hover:scale-105 transition-all duration-300"
                >
                  Começar Agora
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section ref={heroRef} className="relative animate-gradient overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          
          {/* Floating geometric shapes */}
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute top-20 left-20 w-20 h-20 border-2 border-white border-opacity-10 rounded-full animate-float"
              style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
            ></div>
            <div 
              className="absolute bottom-40 right-20 w-16 h-16 border-2 border-white border-opacity-10 rotate-45 animate-float-reverse"
              style={{ transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px) rotate(45deg)` }}
            ></div>
            <div 
              className="absolute top-40 right-40 w-12 h-12 bg-white bg-opacity-5 rounded-lg animate-pulse-slow"
              style={{ transform: `translate(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px)` }}
            ></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <div className="flex items-center space-x-2 mb-6 animate-fade-in-scale">
                  <Star className="h-5 w-5 text-yellow-300 fill-current animate-rotate-in delay-100" />
                  <Star className="h-5 w-5 text-yellow-300 fill-current animate-rotate-in delay-200" />
                  <Star className="h-5 w-5 text-yellow-300 fill-current animate-rotate-in delay-300" />
                  <Star className="h-5 w-5 text-yellow-300 fill-current animate-rotate-in delay-400" />
                  <Star className="h-5 w-5 text-yellow-300 fill-current animate-rotate-in delay-500" />
                  <span className="text-blue-100 text-sm ml-2 animate-slide-in-left delay-600">Controle Financeiro Completo</span>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight animate-slide-in-left delay-200">
                  Transforme sua
                  <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent animate-fade-in-scale delay-800">
                    {" "}Vida Financeira
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed animate-slide-in-left delay-400">
                  Gerencie cartões, transações, orçamentos e muito mais com a ferramenta mais completa do mercado
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-left delay-600">
                  <Link 
                    href="/cadastro"
                    className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center transform hover:scale-105 hover:shadow-2xl"
                  >
                    Começar Gratuitamente
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                  <Link 
                    href="/login"
                    className="border-2 border-white border-opacity-30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center transform hover:scale-105 glass-effect"
                  >
                    <Smartphone className="mr-2 h-5 w-5 animate-bounce-gentle" />
                    Fazer Login
                  </Link>
                </div>

                <div className="mt-12 flex items-center space-x-8 animate-slide-in-left delay-800">
                  <div className="text-center transform hover:scale-110 transition-all duration-300">
                    <div className="text-2xl font-bold animate-bounce-gentle">100%</div>
                    <div className="text-blue-200 text-sm">Gratuito</div>
                  </div>
                  <div className="text-center transform hover:scale-110 transition-all duration-300">
                    <div className="text-2xl font-bold animate-bounce-gentle delay-200">✨</div>
                    <div className="text-blue-200 text-sm">Moderno</div>
                  </div>
                  <div className="text-center transform hover:scale-110 transition-all duration-300">
                    <div className="text-2xl font-bold animate-bounce-gentle delay-400">🔒</div>
                    <div className="text-blue-200 text-sm">Seguro</div>
                  </div>
                </div>
              </div>

              {/* Hero Image/Animation */}
              <div className="relative animate-slide-in-right delay-300">
                <div 
                  className="relative z-10 glass-effect rounded-3xl p-8 border border-white border-opacity-20 parallax-element"
                  style={{ transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)` }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white card-hover animate-fade-in-scale delay-1000">
                      <CreditCard className="h-8 w-8 mb-4 animate-bounce-gentle" />
                      <div className="text-sm opacity-90">Cartões</div>
                      <div className="text-2xl font-bold font-mono">{cardsCount.count}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white card-hover animate-fade-in-scale delay-1200">
                      <TrendingUp className="h-8 w-8 mb-4 animate-bounce-gentle delay-200" />
                      <div className="text-sm opacity-90">Este Mês</div>
                      <div className="text-2xl font-bold font-mono">+R$ {(monthlyCount.count / 1000).toFixed(1)}k</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl p-6 text-white card-hover animate-fade-in-scale delay-1400">
                      <Calendar className="h-8 w-8 mb-4 animate-bounce-gentle delay-400" />
                      <div className="text-sm opacity-90">Recorrentes</div>
                      <div className="text-2xl font-bold font-mono">{recurringCount.count}</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl p-6 text-white card-hover animate-fade-in-scale delay-1600">
                      <Target className="h-8 w-8 mb-4 animate-bounce-gentle delay-600" />
                      <div className="text-sm opacity-90">Metas</div>
                      <div className="text-2xl font-bold font-mono">{goalsCount.count}%</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements with enhanced animations */}
                <div 
                  className="absolute -top-4 -left-4 w-20 h-20 bg-yellow-300 bg-opacity-20 rounded-full blur-xl animate-pulse-slow"
                  style={{ transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)` }}
                ></div>
                <div 
                  className="absolute -bottom-4 -right-4 w-16 h-16 bg-pink-300 bg-opacity-20 rounded-full blur-xl animate-pulse-slow delay-1000"
                  style={{ transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * 0.4}px)` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" ref={featuresRef} className="py-20 bg-gray-50 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-float"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-100 rounded-full opacity-20 animate-float-reverse"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className={`text-4xl font-bold text-gray-900 mb-4 ${featuresInView ? 'animate-slide-in-bottom' : 'opacity-0'}`}>
                Recursos Poderosos
              </h2>
              <p className={`text-xl text-gray-600 max-w-3xl mx-auto ${featuresInView ? 'animate-slide-in-bottom delay-200' : 'opacity-0'}`}>
                Tudo que você precisa para ter controle total sobre suas finanças pessoais
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 card-hover group ${
                    featuresInView ? 'animate-slide-in-bottom' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${feature.delay}ms` }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-all duration-300 group-hover:rotate-3`}>
                    <div className="group-hover:animate-bounce-gentle">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" ref={benefitsRef} className="py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className={benefitsInView ? 'animate-slide-in-left' : 'opacity-0'}>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Por que escolher o FinancePRO?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Desenvolvido com foco na experiência do usuário e nas melhores práticas de segurança
                </p>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center space-x-3 ${
                        benefitsInView ? 'animate-slide-in-left' : 'opacity-0'
                      }`}
                      style={{ animationDelay: `${200 + index * 100}ms` }}
                    >
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 transform hover:scale-110 transition-all duration-300">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-lg hover:text-green-600 transition-colors duration-300">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className={`mt-10 ${benefitsInView ? 'animate-slide-in-left delay-1000' : 'opacity-0'}`}>
                  <Link 
                    href="/cadastro"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 inline-flex items-center transform hover:scale-105 hover:shadow-2xl"
                  >
                    Experimentar Agora
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              <div className={`relative ${benefitsInView ? 'animate-slide-in-right delay-300' : 'opacity-0'}`}>
                <div 
                  className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 parallax-element"
                  style={{ transform: `translate(${mousePosition.x * -0.1}px, ${mousePosition.y * -0.1}px)` }}
                >
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm card-hover">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-600">Saldo Total</span>
                        <Zap className="h-5 w-5 text-yellow-500 animate-bounce-gentle" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 font-mono">R$ 12.847,50</div>
                      <div className="text-sm text-green-600 mt-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +12% este mês
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4 shadow-sm card-hover">
                        <div className="text-gray-600 text-sm mb-2">Receitas</div>
                        <div className="text-xl font-bold text-green-600 font-mono">R$ 8.500</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm card-hover">
                        <div className="text-gray-600 text-sm mb-2">Despesas</div>
                        <div className="text-xl font-bold text-red-500 font-mono">R$ 3.250</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="animate-gradient py-20 relative overflow-hidden">
          {/* Floating particles for CTA */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-20 w-3 h-3 bg-white bg-opacity-20 rounded-full animate-float"></div>
            <div className="absolute top-40 right-20 w-2 h-2 bg-white bg-opacity-30 rounded-full animate-float-reverse"></div>
            <div className="absolute bottom-20 left-1/3 w-4 h-4 bg-white bg-opacity-10 rounded-full animate-float"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in-scale">
              Pronto para transformar suas finanças?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto animate-fade-in-scale delay-200">
              Junte-se a milhares de pessoas que já estão no controle total de sua vida financeira
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-scale delay-400">
              <Link 
                href="/cadastro"
                className="bg-white text-blue-600 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 inline-flex items-center justify-center transform hover:scale-105 hover:shadow-2xl group"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              <Link 
                href="/login"
                className="border-2 border-white border-opacity-30 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:bg-opacity-10 transition-all duration-300 inline-flex items-center justify-center transform hover:scale-105 glass-effect"
              >
                Fazer Login
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2 animate-slide-in-left">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transform hover:scale-110 hover:rotate-3 transition-all duration-300">
                    <span className="text-xl font-bold animate-bounce-gentle">₿</span>
                  </div>
                  <span className="text-2xl font-bold">FinancePRO</span>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  O sistema mais completo para gestão financeira pessoal. 
                  Controle total, simplicidade máxima.
                </p>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">
                    <span className="text-sm">💼</span>
                  </div>
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">
                    <span className="text-sm">🚀</span>
                  </div>
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">
                    <span className="text-sm">💡</span>
                  </div>
                </div>
              </div>
              
              <div className="animate-slide-in-bottom delay-200">
                <h3 className="font-semibold text-lg mb-4">Recursos</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><Link href="/login" className="hover:text-white transition-colors transform hover:translate-x-1 duration-300 inline-block">Login</Link></li>
                  <li><Link href="/cadastro" className="hover:text-white transition-colors transform hover:translate-x-1 duration-300 inline-block">Cadastro</Link></li>
                  <li><a href="#features" className="hover:text-white transition-colors transform hover:translate-x-1 duration-300 inline-block">Recursos</a></li>
                  <li><a href="#benefits" className="hover:text-white transition-colors transform hover:translate-x-1 duration-300 inline-block">Benefícios</a></li>
                </ul>
              </div>
              
              <div className="animate-slide-in-bottom delay-400">
                <h3 className="font-semibold text-lg mb-4">Suporte</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#about" className="hover:text-white transition-colors transform hover:translate-x-1 duration-300 inline-block">Sobre</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors transform hover:translate-x-1 duration-300 inline-block">Funcionalidades</a></li>
                  <li><a href="#benefits" className="hover:text-white transition-colors transform hover:translate-x-1 duration-300 inline-block">Benefícios</a></li>
                  <li><a href="mailto:contato@financepro.com" className="hover:text-white transition-colors transform hover:translate-x-1 duration-300 inline-block">Contato</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 text-center animate-fade-in-scale delay-600">
              <p className="text-gray-400">
                © 2025 FinancePRO. Desenvolvido com ❤️ para transformar sua vida financeira.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
