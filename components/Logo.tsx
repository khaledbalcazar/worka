import Link from "next/link";

export default function Logo({
  href = "/",
  light = false,
}: {
  href?: string;
  light?: boolean;
}) {
  return (
    <Link href={href} className="inline-flex items-baseline gap-1 select-none">
      <span
        className={`text-2xl font-extrabold tracking-tight ${
          light ? "text-white" : "text-primary-dark"
        }`}
      >
        Work<span className="text-primary">a</span>
      </span>
    </Link>
  );
}
