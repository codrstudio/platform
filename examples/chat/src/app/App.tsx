import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { JourneyProgressProvider } from '@/contexts/JourneyProgressContext'
import { NextStepWidgetProvider } from '@/contexts/NextStepWidgetContext'
import { FloatingActionStack } from '@/components/FloatingActionStack'
import { ProgressBar } from '@/components/gamification/ProgressBar'
import { NextStepWidget } from '@/components/gamification/NextStepWidget'
import { CompletionBadge } from '@/components/gamification/CompletionBadge'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { Chat } from '@/pages/Chat'
import { Admin } from '@/pages/Admin'
import { Guide } from '@/pages/Guide'

function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <JourneyProgressProvider>
          <NextStepWidgetProvider>
            <ChatProvider>
              <Router>
              <Routes>
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/chat" element={<Layout><Chat /></Layout>} />
                <Route path="/admin" element={<Layout><Admin /></Layout>} />
                <Route path="/guide/:stepId" element={<Guide />} />
              </Routes>

              {/* Componentes de Gamificação */}
              <ProgressBar />
              <NextStepWidget />
              <CompletionBadge />

              {/* Stack de Botões Flutuantes (Chat + Índice + Toggle Guia) */}
              <FloatingActionStack />
            </Router>
          </ChatProvider>
        </NextStepWidgetProvider>
      </JourneyProgressProvider>
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default App
