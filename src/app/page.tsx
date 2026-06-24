// Ruta: src/app/page.tsx
import Link from "next/link";

export default function TestPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">

      {/* Elementos decorativos de fondo para probar el desenfoque (Glassmorphism) */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-upds-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-upds-tertiary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl z-10 space-y-8">

        {/* Encabezado Principal - Prueba de Tipografía */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-upds-primary sm:text-5xl">
            UPDS Lab Management System
          </h1>
          <p className="text-lg text-upds-neutral max-w-2xl mx-auto">
            Entorno de pruebas de arquitectura y diseño web. Sede Cochabamba - Gestión 2026.
          </p>
        </div>

        {/* Panel con Efecto Cristal - Prueba de utilidades avanzadas */}
        <div className="glass-panel rounded-2xl p-8 backdrop-blur-lg">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-upds-primary rounded-full block"></span>
            Verificación de Design Tokens (UI Kit)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Columna 1: Muestra de la Paleta de Colores */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-upds-neutral">
                Colores Corporativos
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                  <div className="w-12 h-12 rounded-lg bg-upds-primary shadow-xs" />
                  <div>
                    <p className="font-bold text-slate-700">Primary Color</p>
                    <p className="text-xs text-upds-neutral">bg-upds-primary (#004B87)</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                  <div className="w-12 h-12 rounded-lg bg-upds-secondary border border-upds-primary/10" />
                  <div>
                    <p className="font-bold text-slate-700">Secondary Color</p>
                    <p className="text-xs text-upds-neutral">bg-upds-secondary (#E6F0F8)</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                  <div className="w-12 h-12 rounded-lg bg-upds-tertiary shadow-xs" />
                  <div>
                    <p className="font-bold text-slate-700">Tertiary Color</p>
                    <p className="text-xs text-upds-neutral">bg-upds-tertiary (#0EA5E9)</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                  <div className="w-12 h-12 rounded-lg bg-upds-neutral shadow-xs" />
                  <div>
                    <p className="font-bold text-slate-700">Neutral Color</p>
                    <p className="text-xs text-upds-neutral">bg-upds-neutral (#6B7280)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 2: Muestra de Tipografías y Botones */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-upds-neutral">
                  Escalas Tipográficas (Inter)
                </h3>
                <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-2">
                  <p className="text-2xl font-bold tracking-tight text-slate-800">Headline Aa</p>
                  <p className="text-base text-slate-600">Body text layout for standard descriptions.</p>
                  <p className="text-xs font-medium text-upds-neutral">Label or caption state text specification.</p>
                </div>
              </div>

              {/* Botón de Acción - Flujo UX hacia el siguiente paso */}
              <div className="pt-4 md:pt-0">
                <Link
                  href="/login"
                  className="w-full bg-upds-primary hover:bg-upds-primary/95 text-white font-semibold py-3 px-6 rounded-xl text-center block transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  Proceder a Pantalla de Acceso (Login) →
                </Link>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Informativo */}
        <div className="text-center text-xs text-upds-neutral">
          Estructura de estilos construida bajo Tailwind CSS v4.0 Engine & Next.js App Router.
        </div>

      </div>
    </main>
  );
}