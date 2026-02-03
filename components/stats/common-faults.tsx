"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FaultData {
  fault: string;
  count: number;
}

interface CommonFaultsProps {
  data: FaultData[];
}

export function CommonFaults({ data }: CommonFaultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Fallas Más Comunes</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin datos.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.map((d) => (
              <Badge key={d.fault} variant="outline" className="text-sm">
                {d.fault}
                <span className="ml-1 text-neutral-500">({d.count})</span>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
