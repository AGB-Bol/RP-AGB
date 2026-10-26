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
import { UsersIcon, PackageIcon, ClipboardIcon, PlusIcon } from "@/components/icons/Icons";

interface ClienteRow {
  nombre:    string;
  email:     string;
  servicio:  string;
  estado:    string;
  registrado: string;
}

const STATS = [
  { label: "Clientes asignados",  value: "24", Icon: UsersIcon     },
  { label: "Servicios activos",   value: "18", Icon: PackageIcon   },
  { label: "Solicitudes abiertas",value: "3",  Icon: ClipboardIcon },
] as const;

const CLIENTES: ClienteRow[] = [
  { nombre: "Ana Gómez",    email: "ana@mail.com",    servicio: "Servicio básico", estado: "Activo",   registrado: "10/10/2026" },
  { nombre: "Luis Torres",  email: "luis@mail.com",   servicio: "Soporte técnico", estado: "Activo",   registrado: "09/10/2026" },
  { nombre: "Rosa Méndez",  email: "rosa@mail.com",   servicio: "Consultoría",     estado: "Pendiente",registrado: "05/10/2026" },
  { nombre: "Carlos Ruiz",  email: "carlos@mail.com", servicio: "Servicio básico", estado: "Inactivo", registrado: "28/09/2026" },
];

const COLUMNS: Column<ClienteRow>[] = [
  { key: "nombre",     header: "Nombre",    render: (r) => <strong>{r.nombre}</strong>                                                       },
  { key: "email",      header: "Correo",    render: (r) => <span style={{ color: "var(--color-text-secondary)" }}>{r.email}</span>            },
  { key: "servicio",   header: "Servicio",  render: (r) => <span>{r.servicio}</span>                                                          },
  {
    key: "estado",
    header: "Estado",
    render: (r) => (
      <Badge variant={r.estado === "Activo" ? "green" : r.estado === "Pendiente" ? "yellow" : "gray"}>
        {r.estado}
      </Badge>
    ),
  },
  { key: "registrado", header: "Registro",  render: (r) => <span style={{ color: "var(--color-text-secondary)" }}>{r.registrado}</span>       },
];

export default function AsociadoDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated)           { router.push("/login");                         return; }
    if (user?.role !== "asociado")  { router.push(`/dashboard/${user?.role}`);       return; }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "asociado") return null;

  return (
    <DashboardShell pageTitle="Panel asociado">
      <div className="page-header">
        <h1 className="page-title">Hola, {user.name}</h1>
        <p className="page-subtitle">Gestión de clientes y servicios asignados.</p>
      </div>

      <div className="stats-grid">
        {STATS.map(({ label, value, Icon }) => (
          <StatCard key={label} label={label} value={value} icon={<Icon size={22} />} />
        ))}
      </div>

      <Card noPadding>
        <div style={{ padding: "var(--space-5)" }}>
          <CardHeader
            title="Mis clientes"
            subtitle="Clientes asignados — puede registrar y modificar"
            action={
              <a href="/dashboard/asociado/clientes/nuevo" className="btn btn-primary btn-sm" id="btn-asociado-nuevo-cliente">
                <PlusIcon size={14} /> Nuevo cliente
              </a>
            }
          />
        </div>
        <DataTable<ClienteRow>
          columns={COLUMNS}
          rows={CLIENTES}
          emptyText="Sin clientes asignados"
        />
      </Card>

      <div className="action-row">
        <a href="/dashboard/asociado/servicios" className="btn btn-outline btn-md" id="btn-asociado-ver-servicios">
          Ver servicios
        </a>
        <a href="/dashboard/asociado/solicitudes" className="btn btn-ghost btn-md" id="btn-asociado-ver-solicitudes">
          Ver solicitudes
        </a>
      </div>
    </DashboardShell>
  );
}
