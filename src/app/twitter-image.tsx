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
          background: "#0d0d0d",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: -0.5 }}>
          5C.
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 600, lineHeight: 1, letterSpacing: -2 }}>
            5cMenu
          </div>
        </div>
      </div>
    ),
    size,
  );
}
