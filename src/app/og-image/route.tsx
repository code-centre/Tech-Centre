import { ImageResponse } from "next/og";
import { RUTAS_COHORTE } from "@/components/landing/rutas/data";

/**
 * Miniatura Open Graph del sitio (1200x630). Texto nítido, sin logo
 * recortado. Se referencia como /og-image en la metadata raíz.
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
          padding: "56px 64px",
          background: "linear-gradient(135deg, #07100D 0%, #0B1B2B 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -140,
            width: 480,
            height: 480,
            borderRadius: 480,
            background: "rgba(63, 224, 160, 0.16)",
            filter: "blur(80px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -120,
            bottom: -160,
            width: 420,
            height: 420,
            borderRadius: 420,
            background: "rgba(116, 186, 255, 0.14)",
            filter: "blur(80px)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 18,
                height: 18,
                background: "#3FE0A0",
                transform: "rotate(45deg)",
                borderRadius: 3,
                display: "flex",
              }}
            />
            <span
              style={{
                color: "#3FE0A0",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 6,
              }}
            >
              TECH CENTRE
            </span>
          </div>
          <span
            style={{
              color: "#9FB6C4",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            Centro de Tecnología del Caribe
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              maxWidth: 720,
            }}
          >
            <span
              style={{
                color: "#F4F9F6",
                fontSize: 58,
                fontWeight: 800,
                lineHeight: 1.08,
              }}
            >
              Aprende tecnología e IA construyendo de verdad
            </span>
            <span
              style={{
                color: "#9FB6C4",
                fontSize: 24,
                lineHeight: 1.4,
              }}
            >
              Dos rutas · módulos de 8 semanas · presencial en Casa Tech,
              Barranquilla
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              minWidth: 280,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "18px 22px",
                borderRadius: 16,
                border: "1px solid rgba(63, 224, 160, 0.4)",
                background: "rgba(63, 224, 160, 0.10)",
              }}
            >
              <span
                style={{
                  color: "#3FE0A0",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 3,
                }}
              >
                RUTA
              </span>
              <span
                style={{
                  color: "#F4F9F6",
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                AI Developer
              </span>
              <span style={{ color: "#9FB6C4", fontSize: 18 }}>
                JavaScript · Agentes de IA
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "18px 22px",
                borderRadius: 16,
                border: "1px solid rgba(116, 186, 255, 0.4)",
                background: "rgba(116, 186, 255, 0.10)",
              }}
            >
              <span
                style={{
                  color: "#74BAFF",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 3,
                }}
              >
                RUTA
              </span>
              <span
                style={{
                  color: "#F4F9F6",
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                Datos
              </span>
              <span style={{ color: "#9FB6C4", fontSize: 18 }}>
                Python · Machine Learning
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              color: "#9FB6C4",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            Próxima cohorte · {RUTAS_COHORTE.startDate}
          </span>
          <span
            style={{
              color: "#F4F9F6",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            techcentre.co
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
