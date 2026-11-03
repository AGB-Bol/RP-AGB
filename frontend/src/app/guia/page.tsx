"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Servicio {
  id: string;
  nombre: string;
  categoria: "Hoteles" | "Tours" | "Gastronomía" | "Transporte";
  ubicacion: string;
  descripcion: string;
  precio: number;
  unidad: string;
  calificacion: number;
  opiniones: number;
  etiquetas: string[];
  telefono: string;
}

const SERVICIOS: Servicio[] = [
  {
    id: "1",
    nombre: "Hotel Rosario Lago Titicaca",
    categoria: "Hoteles",
    ubicacion: "Copacabana, La Paz",
    descripcion: "Alojamiento boutique a orillas del mítico Lago Titicaca con jardines andinos nativos y trucha fresca.",
    precio: 480,
    unidad: "noche",
    calificacion: 4.9,
    opiniones: 142,
    etiquetas: ["Vista al Lago", "Desayuno incluido", "Wi-Fi rápido"],
    telefono: "+591 2 8622141",
  },
  {
    id: "2",
    nombre: "Palacio de Sal Hotel & Spa",
    categoria: "Hoteles",
    ubicacion: "Colchani, Salar de Uyuni",
    descripcion: "El primer hotel del mundo construido 100% con bloques de sal, spa termal y mirador de estrellas.",
    precio: 850,
    unidad: "noche",
    calificacion: 5.0,
    opiniones: 215,
    etiquetas: ["100% Sal", "Spa Termal", "Lujo Andino"],
    telefono: "+591 2 2442441",
  },
  {
    id: "3",
    nombre: "Expedición Salar & Lagunas",
    categoria: "Tours",
    ubicacion: "Uyuni, Potosí",
    descripcion: "Aventura guiada de 3 días en 4x4. Visita Isla Incahuasi, Laguna Colorada y géiseres.",
    precio: 650,
    unidad: "persona / 3 días",
    calificacion: 4.9,
    opiniones: 189,
    etiquetas: ["4x4 con oxígeno", "Guía bilingüe", "Aventura"],
    telefono: "+591 2 6932020",
  },
  {
    id: "4",
    nombre: "Ruta del Vino y Singani",
    categoria: "Tours",
    ubicacion: "Valle de la Concepción, Tarija",
    descripcion: "Recorrido por viñedos de altura con cata guiada de vinos artesanales y tabla de quesos.",
    precio: 180,
    unidad: "persona",
    calificacion: 4.8,
    opiniones: 96,
    etiquetas: ["Cata Guiada", "Bodegas", "Enoturismo"],
    telefono: "+591 4 6645050",
  },
  {
    id: "5",
    nombre: "Restaurante Gustu",
    categoria: "Gastronomía",
    ubicacion: "Calacoto, La Paz",
    descripcion: "Propuesta culinaria contemporánea elaborada exclusivamente con ingredientes nativos de Bolivia.",
    precio: 220,
    unidad: "menú",
    calificacion: 4.9,
    opiniones: 310,
    etiquetas: ["Alta Cocina", "100% Boliviano", "Vinos de Altura"],
    telefono: "+591 2 2793649",
  },
  {
    id: "6",
    nombre: "Cabaña Campestre Valluna",
    categoria: "Gastronomía",
    ubicacion: "Tiquipaya, Cochabamba",
    descripcion: "Auténtico sabor de la capital gastronómica: pique macho, chicharrón a la leña y silpancho.",
    precio: 65,
    unidad: "plato típico",
    calificacion: 4.7,
    opiniones: 124,
    etiquetas: ["Cocina a leña", "Jardines", "Familiar"],
    telefono: "+591 4 4310020",
  },
];

export default function GuiaPage() {
  const [buscar, setBuscar] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [modal, setModal] = useState<Servicio | null>(null);

  const categorias = ["Todas", "Hoteles", "Tours", "Gastronomía", "Transporte"];

  const filtrados = useMemo(() => {
    return SERVICIOS.filter((s) => {
      const q = buscar.toLowerCase().trim();
      const coincideTxt = !q || s.nombre.toLowerCase().includes(q) || s.ubicacion.toLowerCase().includes(q);
      const coincideCat = categoria === "Todas" || s.categoria === categoria;
      return coincideTxt && coincideCat;
    });
  }, [buscar, categoria]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0B1120", fontFamily: "Arial, sans-serif", color: "#94a3b8", paddingBottom: "60px" }}>
      
      {/* Navbar superior idéntico a la imagen */}
      <nav style={{ backgroundColor: "rgba(11, 17, 32, 0.9)", borderBottom: "1px solid #1e293b", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", backgroundColor: "#6366F1", color: "#fff", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px" }}>
              RP
            </div>
            <span style={{ color: "#fff", fontWeight: "bold", fontSize: "16px" }}>RP-AGB</span>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "14px", fontWeight: 500 }}>
          <span style={{ cursor: "pointer" }}>☀️</span>
          <Link href="/guia" style={{ color: "#818CF8", border: "1px solid rgba(129, 140, 248, 0.3)", backgroundColor: "rgba(129, 140, 248, 0.1)", padding: "6px 12px", borderRadius: "6px", textDecoration: "none" }}>
            Guía Turística
          </Link>
          <Link href="/register" style={{ color: "#cbd5e1", textDecoration: "none" }}>Registrarse</Link>
          <Link href="/login" style={{ backgroundColor: "#6366F1", color: "#fff", padding: "6px 16px", borderRadius: "6px", textDecoration: "none" }}>
            Iniciar sesión
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        
        {/* Encabezado Hero */}
        <div style={{ textAlign: "center", marginBottom: "50px", marginTop: "20px" }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "20px", border: "1px solid #1e293b", backgroundColor: "rgba(30, 41, 59, 0.5)", fontSize: "11px", fontWeight: "bold", color: "#cbd5e1", textTransform: "uppercase", marginBottom: "16px" }}>
            Sistema de Gestión Integral
          </div>
          <h1 style={{ fontSize: "42px", fontWeight: 800, color: "#fff", margin: "0 0 16px 0", lineHeight: 1.2 }}>
            Administrá tus servicios <br />
            <span style={{ color: "#3b82f6" }}>con total claridad</span>
          </h1>
          <p style={{ fontSize: "16px", color: "#94a3b8", maxWidth: "600px", margin: "0 auto" }}>
            Plataforma centralizada para la gestión de clientes, servicios y reportes de RP-AGB. Accedé a tu panel personalizado y tomá el control.
          </p>
        </div>

        {/* Buscador y Filtros */}
        <div style={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "16px", padding: "24px", marginBottom: "40px" }}>
          <div style={{ position: "relative", marginBottom: "24px" }}>
            <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: "16px" }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por servicio o ciudad (ej. Copacabana, Uyuni, Hotel)..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              style={{ width: "100%", backgroundColor: "#0B1120", border: "1px solid #334155", color: "#fff", borderRadius: "10px", padding: "12px 16px 12px 42px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: categoria === cat ? "1px solid #6366F1" : "1px solid #334155",
                  backgroundColor: categoria === cat ? "#6366F1" : "#0B1120",
                  color: categoria === cat ? "#fff" : "#94a3b8",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Tarjetas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
          {filtrados.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: "#111827",
                border: "1px solid #1e293b",
                borderRadius: "16px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", backgroundColor: "#1e293b", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                      {item.categoria === "Hoteles" ? "🏨" : item.categoria === "Tours" ? "🧭" : item.categoria === "Gastronomía" ? "🍽️" : "🚍"}
                    </div>
                    <div>
                      <span style={{ fontSize: "10px", fontWeight: "bold", color: "#818CF8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>
                        {item.categoria}
                      </span>
                      <h3 style={{ margin: "2px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#fff", lineHeight: 1.2 }}>
                        {item.nombre}
                      </h3>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "rgba(30, 41, 59, 0.5)", padding: "4px 8px", borderRadius: "6px", color: "#fbbf24", fontSize: "13px", fontWeight: "bold", border: "1px solid #334155" }}>
                    ★ {item.calificacion}
                  </div>
                </div>

                <p style={{ fontSize: "13px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 12px 0" }}>
                  <span style={{ color: "#818CF8" }}>📍</span> {item.ubicacion}
                </p>
                
                <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.5, margin: "0 0 20px 0" }}>
                  {item.descripcion}
                </p>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
                  {item.etiquetas.map((t) => (
                    <span key={t} style={{ fontSize: "11px", backgroundColor: "rgba(30, 41, 59, 0.8)", color: "#cbd5e1", padding: "4px 10px", borderRadius: "6px", border: "1px solid #334155" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1e293b", paddingTop: "16px", marginTop: "auto" }}>
                <div>
                  <span style={{ fontSize: "10px", color: "#64748b", display: "block", textTransform: "uppercase", fontWeight: "bold", marginBottom: "2px" }}>Tarifa</span>
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#fff" }}>
                    Bs. {item.precio} <span style={{ fontSize: "12px", fontWeight: "normal", color: "#94a3b8" }}>/ {item.unidad}</span>
                  </span>
                </div>
                <button
                  onClick={() => setModal(item)}
                  style={{ backgroundColor: "#6366F1", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  Contactar →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Contacto */}
        {modal && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(11, 17, 32, 0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 50 }}>
            <div style={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "16px", width: "100%", maxWidth: "400px", padding: "24px", position: "relative", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
              <button onClick={() => setModal(null)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer" }}>✕</button>
              
              <div style={{ marginBottom: "24px" }}>
                <span style={{ fontSize: "11px", fontWeight: "bold", color: "#818CF8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "4px" }}>
                  {modal.categoria}
                </span>
                <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "bold", color: "#fff" }}>{modal.nombre}</h3>
              </div>
              
              <div style={{ backgroundColor: "#0B1120", border: "1px solid #1e293b", borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
                <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#94a3b8" }}>Teléfono directo:</p>
                <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#fff" }}>{modal.telefono}</p>
              </div>

              <button
                onClick={() => setModal(null)}
                style={{ width: "100%", padding: "12px", backgroundColor: "#6366F1", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "bold", cursor: "pointer" }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}