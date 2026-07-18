export function VerifiedBadge() {
  return (
    <span className="chip bg-blue-50 text-primary" title="RUC verificado por Worka">
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M16.4 3.9a1 1 0 0 1 .2 1.4l-7 9a1 1 0 0 1-1.5.1l-4-4a1 1 0 1 1 1.4-1.4l3.2 3.2 6.3-8.1a1 1 0 0 1 1.4-.2Z"
          clipRule="evenodd"
        />
      </svg>
      Verificada
    </span>
  );
}

export function FastResponderBadge() {
  return (
    <span
      className="chip bg-emerald-50 text-emerald-700"
      title="Responde a los postulantes en menos de 72 horas"
    >
      ⚡ Responde rápido
    </span>
  );
}

export function UrgentBadge() {
  return <span className="chip bg-amber-50 text-amber-700">Contratación inmediata</span>;
}

export function FirstJobBadge() {
  return <span className="chip bg-purple-50 text-purple-700">Sin experiencia</span>;
}

export function ModalityChip({ modality }: { modality: string }) {
  return <span className="chip bg-surface text-gray-600">{modality}</span>;
}

export function StatusChip({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Activo: "bg-emerald-50 text-emerald-700",
    Pausado: "bg-amber-50 text-amber-700",
    Cerrado: "bg-gray-100 text-gray-500",
    Moderacion: "bg-red-50 text-red-600",
    Pendiente: "bg-gray-100 text-gray-600",
    Revisado: "bg-blue-50 text-primary",
    Contactado: "bg-emerald-50 text-emerald-700",
    Rechazado: "bg-red-50 text-red-600",
  };
  const label = status === "Moderacion" ? "En moderación" : status;
  return <span className={`chip ${styles[status] ?? "bg-surface text-gray-600"}`}>{label}</span>;
}
