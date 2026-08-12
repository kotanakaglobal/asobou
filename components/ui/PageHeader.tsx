import Link from "next/link";

export function PageHeader({
  title,
  backHref,
  backLabel = "戻る",
}: {
  title: string;
  backHref: string;
  backLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Link href={backHref} className="w-fit text-sm font-bold text-ink-soft hover:text-brand-600">
        ← {backLabel}
      </Link>
      <h1 className="text-xl font-extrabold text-ink">{title}</h1>
    </div>
  );
}
