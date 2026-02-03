interface TrackingBrandingProps {
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  welcomeMessage: string | null;
}

export function TrackingBranding({ storeName, logoUrl, primaryColor, welcomeMessage }: TrackingBrandingProps) {
  return (
    <div className="text-center space-y-3">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={storeName}
          className="h-16 mx-auto object-contain"
        />
      ) : (
        <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>
          {storeName}
        </h1>
      )}
      <p className="text-sm text-neutral-600">{storeName}</p>
    </div>
  );
}
