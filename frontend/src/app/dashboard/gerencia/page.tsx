"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DashboardShell }   from "@/components/layout/DashboardShell";
import { StatCard }          from "@/components/ui/StatCard";
import { Card, CardHeader }  from "@/components/ui/Card";
import { Badge }             from "@/components/ui/Badge";
import { DataTable }         from "@/components/ui/DataTable";
import type { Column }       from "@/components/ui/DataTable";
import { UsersIcon, PackageIcon, BarChartIcon, DollarIcon } from "@/components/icons/Icons";

interface ReporteRow {
  mes:      string;
  ingresos: string;
  clientes: number;
  activos:  number;
  estado:   string;
}

const STATS = [
  { label: "Usuarios totales",   value: "128", Icon: UsersIcon    },
  { label: "Servicios activos",  value: "47",  Icon: PackageIcon  },
  { label: "Ingresos del mes",   value: "$0",  Icon: DollarIcon   },
  { label: "Reportes generados", value: "15",  Icon: BarChartIcon },
] as const;

const REPORTES: ReporteRow[] = [
  { mes: "Octubre 2026",    ingresos: "$12.450", clientes: 34, activos: 28, estado: "Cierre"    },
  { mes: "Septiembre 2026", ingresos: "$11.200", clientes: 31, activos: 25, estado: "Cerrado"   },
  { mes: "Agosto 2026",     ingresos: "$9.800",  clientes: 28, activos: 22, estado: "Cerrado"   },
  { mes: "Julio 2026",      ingresos: "$8.350",  clientes: 25, activos: 20, estado: "Cerrado"   },
];

const COLUMNS: Column<ReporteRow>[] = [
  { key: "mes",      header: "Mes",      render: (r) => <strong>{r.mes}</strong>                                                 },
  { key: "ingresos", header: "Ingresos", render: (r) => <span style={{ color: "var(--color-text-secondary)" }}>{r.ingresos}</span> },
  { key: "clientes", header: "Clientes", render: (r) => <span>{r.clientes}</span>                                                },
  { key: "activos",  header: "Activos",  render: (r) => <span>{r.activos}</span>                                                 },
  {
    key: "estado",
    header: "Estado",
    render: (r) => (
      <Badge variant={r.estado === "Cierre" ? "yellow" : "green"}>{r.estado}</Badge>
    ),
  },
];

export default function GerenciaDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated)           { router.push("/login");                         return; }
    if (user?.role !== "gerencia")  { router.push(`/dashboard/${user?.role}`);       return; }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "gerencia") return null;

  const dateStr = new Date().toLocaleDateString("es-AR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <DashboardShell pageTitle="Panel de gerencia">
      <div className="page-header">
        <h1 className="page-title">Bienvenido, {user.name}</h1>
        <p className="page-subtitle">Vista gerencial — {dateStr}</p>
      </div>

      <div className="stats-grid">
        {STATS.map(({ label, value, Icon }) => (
          <StatCard key={label} label={label} value={value} icon={<Icon size={22} />} />
        ))}
      </div>

      <Card noPadding>
        <div style={{ padding: "var(--space-5)" }}>
          <CardHeader
            title="Resumen mensual"
            subtitle="Rendimiento por período — solo lectura de configuración"
            action={
              <a href="/dashboard/gerencia/reportes" className="btn btn-outline btn-sm" id="btn-gerencia-ver-reportes">
                Ver reportes
              </a>
            }
          />
        </div>
        <DataTable<ReporteRow>
          columns={COLUMNS}
          rows={REPORTES}
          emptyText="Sin datos de reportes"
        />
      </Card>
    </DashboardShell>
  );
}
