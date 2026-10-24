// Mientras el servidor arma la evaluación: el esqueleto de la pantalla con el
// mismo lienzo, para que abrir el enlace desde WhatsApp no muestre un blanco.
export default function CargandoEvaluacion() {
  return (
    <div className="min-h-screen bg-[#f3efea]" role="status" aria-label="Cargando tu evaluación">
      <div className="h-16 bg-white border-b border-[#e0dfdc]" />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="ev-skeleton h-11 rounded-2xl" />
        <div className="bg-white border border-[#e0dfdc] rounded-2xl p-5 space-y-3">
          <div className="ev-skeleton h-3 w-24 rounded" />
          <div className="ev-skeleton h-6 w-40 rounded" />
          <div className="ev-skeleton h-4 w-full rounded" />
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="ev-skeleton h-16 rounded-xl" />
            <div className="ev-skeleton h-16 rounded-xl" />
            <div className="ev-skeleton h-16 rounded-xl" />
          </div>
        </div>
        <div className="bg-white border border-[#e0dfdc] rounded-2xl p-5 space-y-2.5">
          <div className="ev-skeleton h-12 rounded-full" />
          <div className="ev-skeleton h-4 w-2/3 rounded" />
        </div>
      </div>
    </div>
  );
}
