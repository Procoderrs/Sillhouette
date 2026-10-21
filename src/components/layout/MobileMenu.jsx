"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { menu, topLinks } from "@/data/menu";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="lg:hidden">
      <button aria-label="Menu" onClick={() => setOpen(true)}>
        <Menu size={22} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="flex justify-end p-4">
            <button aria-label="Close" onClick={() => setOpen(false)}>
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          <ul className="flex flex-col px-6 pb-10 text-[14px] uppercase">
            {topLinks.map((l) => (
              <li key={l.slug} className="border-b border-line py-4">
                <Link href={`/collections/${l.slug}`} onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              </li>
            ))}

            {menu.map((item, i) => (
              <li key={item.slug} className="border-b border-line py-4">
                <button
                  className="flex w-full items-center justify-between"
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  {item.label}
                  <ChevronDown size={16} className={expanded === i ? "rotate-180" : ""} />
                </button>
                {expanded === i && (
                  <ul className="mt-3 flex flex-col gap-3 pl-3 text-[13px]">
                    {item.children.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/collections/${c.slug}`} onClick={() => setOpen(false)}>
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}