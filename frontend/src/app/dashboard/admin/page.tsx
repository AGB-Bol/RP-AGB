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
import { UsersIcon, PackageIcon, ClipboardIcon, DollarIcon } from "@/components/icons/Icons";

/* ── Tipos ── */
interface UserRow {
  name:    string;
  email:   string;
  role:    string;
  status:  string;
  joined:  string;
}

/* ── Datos de demostración ── */
const STATS = [
  { label: "Usuarios registrados", value: "128", Icon: UsersIcon    },
  { label: "Servicios activos",    value: "47",  Icon: PackageIcon  },
  { label: "Solicitudes hoy",      value: "12",  Icon: ClipboardIcon },
  { label: "Ingresos del mes",     value: "$0",  Icon: DollarIcon   },
] as const;

const RECENT_USERS: UserRow[] = [
  { name: "Ana Gómez",   email: "ana@mail.com",    role: "Cliente", status: "Activo",   joined: "10/10/2026" },
  { name: "Luis Torres", email: "luis@mail.com",   role: "Cliente", status: "Activo",   joined: "09/10/2026" },
  { name: "María López", email: "maria@mail.com",  role: "Admin",   status: "Activo",   joined: "01/10/2026" },
  { name: "Carlos Ruiz", email: "carlos@mail.com", role: "Cliente", status: "Inactivo", joined: "28/09/2026" },
];

const COLUMNS: Column<UserRow>[] = [
  {
    key: "name",
    header: "Nombre",
    render: (r) => <strong>{r.name}</strong>,
  },
  {
    key: "email",
    header: "Correo",
    render: (r) => <span style={{ color: "var(--color-text-secondary)" }}>{r.email}</span>,
  },
  {
    key: "role",
    header: "Rol",
    render: (r) => (
      <Badge variant={r.role === "Admin" ? "blue" : "gray"}>{r.role}</Badge>
    ),
  },
  {
    key: "status",
    header: "Estado",
    render: (r) => (
      <Badge variant={r.status === "Activo" ? "green" : "yellow"}>{r.status}</Badge>
    ),
  },
  {
    key: "joined",
    header: "Registro",
    render: (r) => <span style={{ color: "var(--color-text-secondary)" }}>{r.joined}</span>,
  },
];

/* ── Página ── */
export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated)        { router.push("/login");                           return; }
    if (user?.role !== "admin")  { router.push(`/dashboard/${user?.role}`);         return; }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "admin") return null;

  const dateStr = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  });

  return (
    <DashboardShell pageTitle="Panel de administración">
      {/* Encabezado */}
      <div className="page-header">
        <h1 className="page-title">Bienvenido, {user.name}</h1>
        <p className="page-subtitle">
          Resumen general del sistema — {dateStr}
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

      {/* Tabla de usuarios recientes */}
      <Card noPadding>
        <div style={{ padding: "var(--space-5)" }}>
          <CardHeader
            title="Usuarios recientes"
            subtitle="Últimos usuarios registrados en el sistema"
            action={
              <a href="/dashboard/admin/usuarios" className="btn btn-outline btn-sm" id="btn-ver-todos-usuarios">
                Ver todos
              </a>
            }
          />
        </div>
        <DataTable<UserRow>
          columns={COLUMNS}
          rows={RECENT_USERS}
          emptyText="Sin usuarios registrados"
        />
      </Card>
    </DashboardShell>
  );
}
