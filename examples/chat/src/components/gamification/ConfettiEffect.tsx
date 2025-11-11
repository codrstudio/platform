// components/gamification/ConfettiEffect.tsx
/**
 * Animação de Confete em CSS Puro
 *
 * Cria 50 partículas de confete com cores NIC que caem pela tela.
 * Performance otimizada: apenas transform e opacity (GPU-accelerated).
 */

export function ConfettiEffect() {
  const colors = ['#5FBCD3', '#3D95DF', '#181818', '#DEDEDE', '#10b981', '#f59e0b']

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  )
}
