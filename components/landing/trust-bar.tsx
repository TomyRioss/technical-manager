import { Smartphone, Monitor, Laptop, Tablet } from "lucide-react";

const devices = [
  { icon: Smartphone, label: "Celular" },
  { icon: Monitor, label: "Computadora" },
  { icon: Laptop, label: "Laptop" },
  { icon: Tablet, label: "Tablet" },
];

export function TrustBar() {
  return (
    <section className="py-12 px-4 bg-neutral-100">
      <div className="max-w-7xl mx-auto text-center space-y-6">
        <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
          Podés usarlo en cualquier dispositivo
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {devices.map((device) => (
            <div
              key={device.label}
              className="flex items-center gap-2 text-neutral-600"
            >
              <device.icon className="h-6 w-6" />
              <span className="font-medium">{device.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
