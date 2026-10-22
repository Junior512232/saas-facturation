import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "iziFlow - Suite de Gestion Commerciale, Stocks, Factures & RH Conforme OHADA";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#020617",
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.25) 0%, rgba(2, 6, 23, 1) 75%)",
          padding: "50px 60px",
          fontFamily: "system-ui, sans-serif",
          color: "white",
        }}
      >
        {/* Top Header Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(129, 140, 248, 0.4)",
            borderRadius: "9999px",
            padding: "8px 24px",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#a5b4fc",
          }}
        >
          <span>🌍 La solution de gestion commerciale pensée pour l'Afrique de l'Ouest</span>
        </div>

        {/* Center Main Brand & Tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                fontWeight: "900",
                color: "#ffffff",
                boxShadow: "0 20px 40px rgba(79, 70, 229, 0.4)",
              }}
            >
              iF
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "64px",
                fontWeight: "900",
                letterSpacing: "-0.03em",
                color: "#ffffff",
              }}
            >
              <span>izi</span>
              <span style={{ color: "#818cf8" }}>Flow</span>
            </div>
          </div>

          <div
            style={{
              fontSize: "32px",
              fontWeight: "800",
              color: "#f8fafc",
              letterSpacing: "-0.02em",
              maxWidth: "960px",
              lineHeight: 1.25,
            }}
          >
            Facturation Conforme OHADA, Caisse POS, Stocks & RH
          </div>

          <div
            style={{
              fontSize: "20px",
              color: "#94a3b8",
              maxWidth: "850px",
              lineHeight: 1.4,
            }}
          >
            Encaissez vos clients instantanément par Wave & Orange Money avec cachet d'entreprise et signature électronique certifiée.
          </div>
        </div>

        {/* Feature Badges Grid */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            width: "100%",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(51, 65, 85, 0.8)",
              borderRadius: "14px",
              padding: "10px 18px",
              fontSize: "15px",
              fontWeight: "bold",
              color: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🇸🇳 Conforme NINEA & TVA 18%</span>
          </div>

          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(51, 65, 85, 0.8)",
              borderRadius: "14px",
              padding: "10px 18px",
              fontSize: "15px",
              fontWeight: "bold",
              color: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚡ Paiements Wave & OM en 1 Clic</span>
          </div>

          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(51, 65, 85, 0.8)",
              borderRadius: "14px",
              padding: "10px 18px",
              fontSize: "15px",
              fontWeight: "bold",
              color: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🔏 Cachet & Signature Numérique</span>
          </div>

          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(51, 65, 85, 0.8)",
              borderRadius: "14px",
              padding: "10px 18px",
              fontSize: "15px",
              fontWeight: "bold",
              color: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🧾 Caisse POS & Reçus Thermiques</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(51, 65, 85, 0.5)",
            paddingTop: "16px",
            fontSize: "14px",
            color: "#64748b",
          }}
        >
          <span>© 2026 iziFlow Technologies • Fait avec fierté à Dakar 🇸🇳</span>
          <span style={{ color: "#a5b4fc", fontWeight: "bold" }}>iziflow.sn</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
