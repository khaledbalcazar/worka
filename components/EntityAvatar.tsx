// Avatar unificado: muestra la imagen (logo de empresa o foto de persona)
// y cae a las iniciales si no hay imagen. Usar en TODOS los listados para
// que la identidad visual acompañe a la empresa/persona en toda la app.
export default function EntityAvatar({
  url,
  name,
  className = "w-11 h-11 rounded-xl text-sm",
}: {
  url: string | null | undefined;
  name: string;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={`shrink-0 bg-blue-50 text-primary flex items-center justify-center font-bold overflow-hidden ${className}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}
