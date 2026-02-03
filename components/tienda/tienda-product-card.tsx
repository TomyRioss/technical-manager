import { formatPrice } from "@/lib/utils";
import { LuMessageCircle } from "react-icons/lu";

interface TiendaProductCardProps {
  name: string;
  salePrice: number;
  stock: number;
  imageUrl: string | null;
  category: string | null;
  whatsappNumber: string | null;
  storeName: string;
  primaryColor: string;
}

export function TiendaProductCard({
  name,
  salePrice,
  stock,
  imageUrl,
  category,
  whatsappNumber,
  storeName,
}: TiendaProductCardProps) {
  const message = encodeURIComponent(
    `Hola! Me interesa el producto: ${name}. Vi tu catalogo en ${storeName}.`
  );
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${message}`
    : null;

  const isOutOfStock = stock === 0;

  return (
    <div className="flex flex-col rounded-lg border border-neutral-200 bg-white overflow-hidden">
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className={`h-48 w-full object-cover ${isOutOfStock ? "opacity-60" : ""}`}
          />
        ) : (
          <div className={`h-48 w-full bg-neutral-100 flex items-center justify-center ${isOutOfStock ? "opacity-60" : ""}`}>
            <span className="text-4xl text-neutral-300">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {category && (
          <span className="absolute top-2 right-2 rounded bg-neutral-800 px-2 py-1 text-xs font-medium text-white">
            {category}
          </span>
        )}

        {isOutOfStock && (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-neutral-800/90 px-3 py-1.5 text-xs font-semibold text-white">
            AGOTADO
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-medium text-neutral-900 line-clamp-2">
          {name}
        </h3>
        <p className="mt-1 text-lg font-bold text-neutral-900">
          ${formatPrice(salePrice)}
        </p>

        <div className="mt-1 flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-xs text-neutral-500">
            STOCK: {stock}
          </span>
        </div>

        {whatsappUrl && (
          <a
            href={isOutOfStock ? undefined : whatsappUrl}
            target={isOutOfStock ? undefined : "_blank"}
            rel={isOutOfStock ? undefined : "noopener noreferrer"}
            className={`mt-3 flex items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors ${
              isOutOfStock ? "cursor-not-allowed opacity-50" : "hover:bg-neutral-800"
            }`}
            onClick={(e) => isOutOfStock && e.preventDefault()}
          >
            <LuMessageCircle className="h-4 w-4" />
            CONSULTAR
          </a>
        )}
      </div>
    </div>
  );
}
