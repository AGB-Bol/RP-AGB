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
import { UsersIcon, PackageIcon, ClipboardIcon } from "@/components/icons/Icons";

interface SolicitudRow {
  id:       string;
  cliente:  string;
  tipo:     string;
  fecha:    string;
  estado:   string;
}

const STATS = [
  { label: "Clientes activos",    value: "42", Icon: UsersIcon     },
  { label: "Servicios en curso",  value: "29", Icon: PackageIcon   },
  { label: "Solicitudes abiertas",value: "7",  Icon: ClipboardIcon },
] as const;

const SOLICITUDES: SolicitudRow[] = [
  { id: "#001", cliente: "Ana Gómez",   tipo: "Alta de servicio",   fecha: "25/10/2026", estado: "Pendiente" },
  { id: "#002", cliente: "Luis Torres", tipo: "Modificación datos",  fecha: "24/10/2026", estado: "En proceso"},
  { id: "#003", cliente: "Rosa Méndez", tipo: "Baja de servicio",    fecha: "23/10/2026", estado: "Pendiente" },
  { id: "#004", cliente: "Pedro Sosa",  tipo: "Alta de servicio",   fecha: "22/10/2026", estado: "Resuelto"  },
];

const COLUMNS: Column<SolicitudRow>[] = [
  { key: "id",      header: "ID",       render: (r) => <code style={{ fontSize: "0.8rem" }}>{r.id}</code>                               },
  { key: "cliente", header: "Cliente",  render: (r) => <strong>{r.cliente}</strong>                                                     },
  { key: "tipo",    header: "Tipo",     render: (r) => <span style={{ color: "var(--color-text-secondary)" }}>{r.tipo}</span>            },
  { key: "fecha",   header: "Fecha",    render: (r) => <span style={{ color: "var(--color-text-secondary)" }}>{r.fecha}</span>           },
  {
    key: "estado",
    header: "Estado",
    render: (r) => (
      <Badge variant={
        r.estado === "Resuelto"   ? "green"  :
        r.estado === "En proceso" ? "blue"   : "yellow"
      }>
        {r.estado}
      </Badge>
    ),
  },
];

export default function OperadorDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated)           { router.push("/login");                         return; }
    if (user?.role !== "operador")  { router.push(`/dashboard/${user?.role}`);       return; }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "operador") return null;

  return (
    <DashboardShell pageTitle="Panel operador">
      <div className="page-header">
        <h1 className="page-title">Hola, {user.name}</h1>
        <p className="page-subtitle">Gestión operativa de clientes y solicitudes.</p>
      </div>

      <div className="stats-grid">
        {STATS.map(({ label, value, Icon }) => (
          <StatCard key={label} label={label} value={value} icon={<Icon size={22} />} />
        ))}
      </div>

      <Card noPadding>
        <div style={{ padding: "var(--space-5)" }}>
          <CardHeader
            title="Solicitudes recientes"
            subtitle="Solicitudes en gestión — administración de bajo nivel"
            action={
              <a href="/dashboard/operador/solicitudes" className="btn btn-outline btn-sm" id="btn-operador-ver-solicitudes">
                Ver todas
              </a>
            }
          />
        </div>
        <DataTable<SolicitudRow>
          columns={COLUMNS}
          rows={SOLICITUDES}
          emptyText="Sin solicitudes pendientes"
        />
      </Card>
    </DashboardShell>
  );
}
