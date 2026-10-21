"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Mail } from "lucide-react";
import {
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaPinterest,
  FaTiktok,
} from "react-icons/fa6";
import { footerLinks, contact } from "@/data/menu";

// Mobile par accordion, md aur us se upar hamesha khula
function Col({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-line md:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="relative flex w-full items-center justify-center py-5 md:cursor-default md:py-0 md:pb-6"
      >
        <span className="text-[13px] uppercase tracking-[0.25em] md:text-left">
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`absolute right-0 transition-transform md:hidden ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div className={`${open ? "block" : "hidden"} pb-6 md:block md:pb-0`}>
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white pt-4 pb-8 md:pt-14">
      <div className="site-container grid md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:grid-cols-4">
        <Col title="About Us">
          <div className="space-y-4 text-center text-[14px] leading-relaxed md:text-left">
            <Image
              src="/logo.avif"
              alt="Silhouette"
              width={200}
              height={80}
              className="mx-auto h-auto w-[200px] md:mx-0"
              style={{ height: "auto" }}
            />
            <p>
              Sillhouete is a Pakistan-based designer brand offering luxury
              bridal, formal, and ready-to-wear outfits to customers worldwide.
            </p>
          </div>
        </Col>

        <Col title="Help & Info">
          <ul className="flex flex-col gap-3 text-center text-[13px] uppercase md:text-left">
            {footerLinks.map((l) => (
              <li key={l.slug}>
                <Link href={`/pages/${l.slug}`} className="hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </Col>

        <Col title="Contact Info">
          <div className="space-y-4 text-center text-[14px] leading-relaxed md:text-left">
            <p>
              <strong>Pakistan (Office & Studio):</strong>
              <br />
              Office: {contact.pakistan.office}
              <br />
              Studio: {contact.pakistan.studio}
              <br />
              Phone: {contact.pakistan.phone}
            </p>
            <p>
              <strong>USA Office:</strong>
              <br />
              {contact.usa.company}
              <br />
              {contact.usa.address}
              <br />
              Phone: {contact.usa.phone}
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${contact.email}`} className="underline">
                {contact.email}
              </a>
            </p>
          </div>
        </Col>

        <Col title="Sign Up and Save">
          <div className="text-center md:text-left">
            <p className="mb-4 text-[14px]">
              Subscribe to get special offers, free giveaways, and
              once-in-a-lifetime deals.
            </p>
            <form className="mx-auto mb-6 flex max-w-[360px] items-center border-b border-black pb-2 md:mx-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
              />
              <Mail size={18} className="shrink-0" />
            </form>
            <div className="flex justify-center gap-5 md:justify-start">
              <a href="#" aria-label="Instagram"><FaInstagram size={20} /></a>
              <a href="#" aria-label="Facebook"><FaFacebook size={20} /></a>
              <a href="#" aria-label="YouTube"><FaYoutube size={20} /></a>
              <a href="#" aria-label="Pinterest"><FaPinterest size={20} /></a>
              <a href="#" aria-label="TikTok"><FaTiktok size={20} /></a>
            </div>
          </div>
        </Col>
      </div>

      <div className="site-container mt-8 flex flex-col items-center gap-4 md:mt-12">
        <div className="flex gap-2 text-[11px] uppercase">
          {/* payment icons baad mein */}
          <span className="border px-2 py-1">Amex</span>
          <span className="border px-2 py-1">Visa</span>
          <span className="border px-2 py-1">Mastercard</span>
        </div>
        <p className="text-[13px]">Powered by Sillhouete</p>
      </div>
    </footer>
  );
}
