import { Link } from 'react-router-dom'
import { MessageSquare, Sparkles, BookOpen, Zap } from 'lucide-react'

/**
 * Página Home - Landing do Chatify
 * Seções: Hero, Features, Como Usar, CTA
 */

export function Home() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
              Núcleo de Inteligência e Conhecimento
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Chatify
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Seu assistente inteligente para análises, insights e decisões baseadas em dados.
            Converse, explore e descubra o potencial da IA aplicada ao seu contexto.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/chat"
              className="px-8 py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              Começar Agora →
            </Link>
            <Link
              to="/admin"
              className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Configurações
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            O que o Chatify pode fazer
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Conversação Inteligente
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Faça perguntas naturais e receba respostas contextualizadas com base nos seus dados
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Insights Automáticos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Descubra padrões e tendências que você não perceberia manualmente
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Memória de Contexto
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Suas conversas são salvas e o sistema aprende com cada interação
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Respostas em Tempo Real
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Streaming progressivo para você acompanhar o raciocínio da IA
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Usar Section */}
      <section id="como-usar" className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Como Usar
          </h2>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                  Acesse o Chat
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Clique no botão flutuante no canto inferior direito ou acesse a página /chat
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                  Faça sua pergunta
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Digite sua dúvida ou solicitação de análise de forma natural
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                  Acompanhe a resposta
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  O sistema responde em tempo real com análises e insights baseados em dados
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section id="cta" className="py-20 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Pronto para começar?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Descubra o poder da inteligência artificial aplicada aos seus dados
          </p>
          <Link
            to="/chat"
            className="inline-block px-10 py-4 bg-white text-blue-600 rounded-lg font-bold hover:shadow-2xl transition-all text-lg"
          >
            Iniciar Conversa Agora
          </Link>
        </div>
      </section>
    </div>
  )
}
