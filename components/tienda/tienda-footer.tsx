"use client";

import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

interface TiendaFooterProps {
  storeName: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  twitterUrl: string | null;
}

export function TiendaFooter({
  storeName,
  facebookUrl,
  instagramUrl,
  tiktokUrl,
  twitterUrl,
}: TiendaFooterProps) {
  const year = new Date().getFullYear();

  const socialLinks = [
    { url: instagramUrl, icon: FaInstagram, label: "Instagram" },
    { url: tiktokUrl, icon: FaTiktok, label: "TikTok" },
    { url: facebookUrl, icon: FaFacebook, label: "Facebook" },
    { url: twitterUrl, icon: FaXTwitter, label: "X" },
  ].filter((link) => link.url);

  return (
    <footer className="mt-12 border-t border-neutral-200 bg-white py-6">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-4">
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-neutral-900 transition-colors"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          )}
          <p className="text-sm text-neutral-400">
            © {year} {storeName}
          </p>
        </div>
      </div>
    </footer>
  );
}
