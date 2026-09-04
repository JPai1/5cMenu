import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "5cMenu — Claremont Colleges dining halls in one place";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#3f6b4a",
          color: "#f6f1e8",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, textTransform: "uppercase" }}>
          Claremont Colleges
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 600, lineHeight: 1 }}>5cMenu</div>
          <div style={{ marginTop: 20, fontSize: 34, maxWidth: 820 }}>
            McConnell, Malott, Collins, Hoch-Shanahan, Frary, and Frank — live, by station.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 22 }}>
          <span>Pitzer</span>
          <span>·</span>
          <span>Scripps</span>
          <span>·</span>
          <span>CMC</span>
          <span>·</span>
          <span>Harvey Mudd</span>
          <span>·</span>
          <span>Pomona</span>
        </div>
      </div>
    ),
    size,
  );
}
