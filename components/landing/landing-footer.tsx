import Link from "next/link";

const links = [
  { label: "Características", href: "/marketing" },
  { label: "Precios", href: "/pricing" },
  { label: "Contacto", href: "/contact" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Logo y descripción */}
          <div className="space-y-2">
            <Link href="/" className="text-xl font-bold">
              Koldesk
            </Link>
            <p className="text-sm text-neutral-500">
              Software integral para locales técnicos
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-6">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-200 text-center">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Koldesk. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
