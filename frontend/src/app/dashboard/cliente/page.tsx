"use client";

import { useEffect }           from "react";
import { useRouter }           from "next/navigation";
import { useAuth }             from "@/context/AuthContext";
import { DashboardShell }      from "@/components/layout/DashboardShell";
import { StatCard }            from "@/components/ui/StatCard";
import { Card, CardHeader }    from "@/components/ui/Card";
import { Badge }               from "@/components/ui/Badge";
import { DataTable }           from "@/components/ui/DataTable";
import type { Column }         from "@/components/ui/DataTable";
import { PackageIcon, ClockIcon, CheckIcon, PlusIcon, MessageIcon } from "@/components/icons/Icons";

/* ── Tipos ── */
interface ServiceRow {
  name:   string;
  status: string;
  start:  string;
  next:   string;
}

/* ── Datos de demostración ── */
const STATS = [
  { label: "Servicios activos",    value: "2",         Icon: PackageIcon },
  { label: "Próx. vencimiento",    value: "01/11/26",  Icon: ClockIcon   },
  { label: "Solicitudes abiertas", value: "0",         Icon: CheckIcon   },
] as const;

const MY_SERVICES: ServiceRow[] = [
  { name: "Servicio básico", status: "Activo",  start: "01/09/2026", next: "01/11/2026" },
  { name: "Soporte técnico", status: "Activo",  start: "15/08/2026", next: "15/11/2026" },
  { name: "Consultoría",     status: "Vencido", start: "01/06/2026", next: "—"          },
];

const COLUMNS: Column<ServiceRow>[] = [
  {
    key: "name",
    header: "Servicio",
    render: (r) => <strong>{r.name}</strong>,
  },
  {
    key: "status",
    header: "Estado",
    render: (r) => (
      <Badge variant={r.status === "Activo" ? "green" : "yellow"}>{r.status}</Badge>
    ),
  },
  {
    key: "start",
    header: "Inicio",
    render: (r) => <span style={{ color: "var(--color-text-secondary)" }}>{r.start}</span>,
  },
  {
    key: "next",
    header: "Próximo cobro",
    render: (r) => <span style={{ color: "var(--color-text-secondary)" }}>{r.next}</span>,
  },
];

/* ── Página ── */
export default function ClienteDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated)          { router.push("/login");                       return; }
    if (user?.role !== "cliente")  { router.push(`/dashboard/${user?.role}`);     return; }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "cliente") return null;

  return (
    <DashboardShell pageTitle="Mi panel">
      {/* Encabezado */}
      <div className="page-header">
        <h1 className="page-title">Hola, {user.name}</h1>
        <p className="page-subtitle">
          Resumen de tu cuenta y servicios activos.
        </p>
      </div>

      {/* Métricas */}
      <div className="stats-grid">
        {STATS.map(({ label, value, Icon }) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            icon={<Icon size={22} />}
          />
        ))}
      </div>

      {/* Tabla de servicios */}
      <Card noPadding>
        <div style={{ padding: "var(--space-5)" }}>
          <CardHeader
            title="Mis servicios"
            subtitle="Servicios contratados en tu cuenta"
          />
        </div>
        <DataTable<ServiceRow>
          columns={COLUMNS}
          rows={MY_SERVICES}
          emptyText="No tenés servicios activos"
        />
      </Card>

      {/* Acciones rápidas */}
      <div className="action-row">
        <a
          href="/dashboard/cliente/servicios"
          className="btn btn-primary btn-md"
          id="btn-nueva-solicitud"
        >
          <PlusIcon size={16} />
          Nueva solicitud
        </a>
        <a
          href="mailto:soporte@rp-agb.com"
          className="btn btn-ghost btn-md"
          id="btn-contactar-soporte"
        >
          <MessageIcon size={16} />
          Contactar soporte
        </a>
      </div>
    </DashboardShell>
  );
}
