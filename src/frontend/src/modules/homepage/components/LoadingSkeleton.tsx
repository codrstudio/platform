import { Skeleton } from '@/components/ui/skeleton';

/**
 * LoadingSkeleton Component
 *
 * Renderiza skeletons para todas as seções da homepage durante carregamento.
 * Representa a estrutura visual completa da página para melhor experiência durante load.
 *
 * Specs:
 * - SPEC-M-HP-F-004: Loading states devem usar Skeleton UI
 * - SPEC-M-HP-F-005: Skeleton deve representar estrutura da página real
 * - SPEC-M-HP-F-006: Prevenir Cumulative Layout Shift (CLS)
 *
 * @returns {JSX.Element} Skeleton UI completo da homepage
 *
 * @example
 * ```tsx
 * const { isLoading } = useHomepageConfig(instanceId);
 * if (isLoading) return <LoadingSkeleton />;
 * ```
 */
export function LoadingSkeleton() {
  return (
    <main
      className="homepage-loading min-h-screen"
      aria-busy="true"
      aria-label="Carregando página inicial"
    >
      {/* Hero Section Skeleton */}
      <section className="hero-skeleton py-24 md:py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Title skeleton - H1 height */}
            <Skeleton className="h-16 w-3/4 max-w-2xl" />

            {/* Subtitle skeleton - multi-line */}
            <Skeleton className="h-24 w-2/3 max-w-xl" />

            {/* CTA buttons skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
              <Skeleton className="h-12 flex-1 sm:flex-none sm:w-40" />
              <Skeleton className="h-12 flex-1 sm:flex-none sm:w-40" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="features-skeleton py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          {/* Section title */}
          <div className="text-center mb-12 space-y-4">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto max-w-full" />
          </div>

          {/* Features grid - 6 items default */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4 p-6 rounded-lg border bg-card">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals Section Skeleton */}
      <section className="portals-skeleton py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Section title */}
          <div className="text-center mb-12 space-y-4">
            <Skeleton className="h-10 w-80 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto max-w-full" />
          </div>

          {/* Portals grid - 3 items default */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4 rounded-lg border bg-card overflow-hidden">
                {/* Portal screenshot */}
                <Skeleton className="h-48 w-full rounded-none" />

                <div className="p-6 space-y-3">
                  {/* Portal icon + name */}
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                  </div>

                  {/* Description */}
                  <Skeleton className="h-16 w-full" />

                  {/* Button */}
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="cta-skeleton py-24 px-4 bg-primary/5">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="space-y-8">
            {/* CTA title */}
            <Skeleton className="h-12 w-3/4 mx-auto" />

            {/* CTA description */}
            <Skeleton className="h-20 w-2/3 mx-auto" />

            {/* CTA button */}
            <Skeleton className="h-12 w-48 mx-auto" />
          </div>
        </div>
      </section>
    </main>
  );
}
