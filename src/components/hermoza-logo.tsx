import { cn } from "@/lib/utils";

/** Hermoza "H" monogramı — marka dosyasındaki logodan vektörleştirildi. */
export function HermozaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 204 514"
      fill="currentColor"
      aria-hidden
      className={cn("h-8 w-auto", className)}
    >
      <rect x="0" y="0" width="204" height="6" />
      <rect x="178" y="0" width="26" height="459" />
      <rect x="0" y="56" width="24" height="458" />
      <rect x="30" y="56" width="6" height="458" />
      <rect x="89" y="56" width="26" height="458" />
      <rect x="24" y="255" width="138" height="6" />
      <rect x="0" y="508" width="204" height="6" />
    </svg>
  );
}

export function HermozaLogo({
  className,
  withTagline = true,
}: {
  className?: string;
  withTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <HermozaMark className="h-9" />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-normal tracking-[0.18em]">HERMOZA</span>
        {withTagline && (
          <span className="mt-1 text-[7.5px] font-normal tracking-[0.55em] opacity-70">
            WOOD INDUSTRY
          </span>
        )}
      </span>
    </span>
  );
}
