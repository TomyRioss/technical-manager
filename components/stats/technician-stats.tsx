"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TechStat {
  name: string;
  total: number;
  delivered: number;
  revenue: number;
}

interface TechnicianStatsProps {
  data: TechStat[];
}

export function TechnicianStats({ data }: TechnicianStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rendimiento por Técnico</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin datos.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Técnico</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Entregados</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((t) => (
                <TableRow key={t.name}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-right">{t.total}</TableCell>
                  <TableCell className="text-right">{t.delivered}</TableCell>
                  <TableCell className="text-right">
                    ${t.revenue.toLocaleString("es-AR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
