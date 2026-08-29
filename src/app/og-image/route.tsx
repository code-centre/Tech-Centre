import { ImageResponse } from "next/og";

/**
 * Imagen Open Graph del sitio (1200x630), generada con código para que el
 * texto salga nítido. Se referencia como /og-image en la metadata.
 */
export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #07100D 0%, #0B1B2B 100%)",
          position: "relative",
        }}
      >
        {/* Glow decorativo */}
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -120,
            width: 420,
            height: 420,
            borderRadius: 420,
            background: "rgba(63, 224, 160, 0.18)",
            filter: "blur(90px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -100,
            bottom: -140,
            width: 380,
            height: 380,
            borderRadius: 380,
            background: "rgba(116, 186, 255, 0.14)",
            filter: "blur(90px)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              background: "#3FE0A0",
              transform: "rotate(45deg)",
              borderRadius: 4,
              display: "flex",
            }}
          />
          <span
            style={{
              color: "#3FE0A0",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 8,
            }}
          >
            TECH CENTRE
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <span
            style={{
              color: "#F4F9F6",
              fontSize: 66,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 940,
            }}
          >
            Aprende tecnología e IA construyendo de verdad
          </span>
          <span
            style={{
              color: "#9FB6C4",
              fontSize: 28,
              lineHeight: 1.4,
              maxWidth: 880,
            }}
          >
            Rutas de Producto y Datos · módulos de 8 semanas · presencial en
            Casa Tech, Barranquilla
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            <span
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                border: "1px solid rgba(63, 224, 160, 0.45)",
                background: "rgba(63, 224, 160, 0.10)",
                color: "#3FE0A0",
                fontSize: 21,
                fontWeight: 600,
              }}
            >
              JavaScript · Agentes de IA
            </span>
            <span
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                border: "1px solid rgba(116, 186, 255, 0.45)",
                background: "rgba(116, 186, 255, 0.10)",
                color: "#74BAFF",
                fontSize: 21,
                fontWeight: 600,
              }}
            >
              Python · Machine Learning
            </span>
          </div>
          <span style={{ color: "#9FB6C4", fontSize: 23, fontWeight: 600 }}>
            techcentre.co
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
