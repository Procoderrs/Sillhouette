import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Pagination({ page, pages, query, basePath }) {
  if (pages <= 1) return null;

  const href = (p) => {
    const q = new URLSearchParams({ ...query, page: String(p) });
    return `${basePath}?${q.toString()}`;
  };

  return (
    <nav className="mt-12 flex items-center justify-center gap-6 text-[15px]">
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) =>
        p === page ? (
          <span key={p} className="text-black/30">{p}</span>
        ) : (
          <Link key={p} href={href(p)} className="hover:underline">{p}</Link>
        )
      )}
      {page < pages && (
        <Link
          href={href(page + 1)}
          aria-label="Next page"
          className="flex h-10 w-10 items-center justify-center bg-black text-white"
        >
          <ChevronRight size={18} />
        </Link>
      )}
    </nav>
  );
}
