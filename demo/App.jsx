import React, { useRef } from "react";
import { createRoot } from "react-dom/client";
import HorizontalScrollWrapper from "../src/HorizontalScrollWrapper";
import "../src/HorizontalScrollWrapper.css";

const columns = Array.from({ length: 30 }, (_, i) => `Column ${i + 1}`);
const rows = Array.from({ length: 12 }, (_, i) => i + 1);

const cellStyle = {
  padding: "8px 16px",
  whiteSpace: "nowrap",
  borderBottom: "1px solid #e5e7eb",
  borderRight: "1px solid #e5e7eb",
  fontSize: 13,
};

const headerStyle = {
  ...cellStyle,
  fontWeight: 600,
  background: "#f9fafb",
  position: "sticky",
  top: 0,
};

// ── Demo 1: Self-managed scroll ─────────────────────────
function SelfManagedDemo() {
  return (
    <section style={{ marginBottom: 64 }}>
      <h2 style={{ marginBottom: 12 }}>Mode 1 — Self-managed scroll</h2>
      <p style={{ marginBottom: 16, color: "#666", fontSize: 14 }}>
        Wrap a wide table directly. The component manages its own scrollable container.
      </p>

      <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #d1d5db", overflow: "hidden" }}>
        <HorizontalScrollWrapper>
          <table style={{ borderCollapse: "collapse", minWidth: 3000 }}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col} style={headerStyle}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row}>
                  {columns.map((col) => (
                    <td key={col} style={cellStyle}>
                      Row {row} — {col}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </HorizontalScrollWrapper>
      </div>
    </section>
  );
}

// ── Demo 2: External scroll ref ─────────────────────────
function ExternalScrollDemo() {
  const bodyRef = useRef(null);

  return (
    <section style={{ marginBottom: 64 }}>
      <h2 style={{ marginBottom: 12 }}>Mode 2 — External scroll ref</h2>
      <p style={{ marginBottom: 16, color: "#666", fontSize: 14 }}>
        Pass a <code>scrollRef</code> to observe an external scrollable element.
        This preserves sticky columns and split-scroll layouts.
      </p>

      <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #d1d5db", overflow: "hidden" }}>
        <HorizontalScrollWrapper scrollRef={bodyRef}>
          <div
            ref={bodyRef}
            style={{ overflowX: "auto", maxHeight: 320, scrollbarWidth: "none" }}
          >
            <table style={{ borderCollapse: "collapse", minWidth: 3000 }}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col} style={headerStyle}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row}>
                    {columns.map((col) => (
                      <td key={col} style={cellStyle}>
                        Row {row} — {col}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </HorizontalScrollWrapper>
      </div>
    </section>
  );
}

// ── Demo 3: Non-draggable track ─────────────────────────
function NonDraggableDemo() {
  return (
    <section style={{ marginBottom: 64 }}>
      <h2 style={{ marginBottom: 12 }}>Mode 3 — Non-draggable track</h2>
      <p style={{ marginBottom: 16, color: "#666", fontSize: 14 }}>
        Set <code>draggable=false</code> to disable track repositioning.
        The thumb still works — only the track stays fixed.
      </p>

      <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #d1d5db", overflow: "hidden" }}>
        <HorizontalScrollWrapper draggable={false}>
          <table style={{ borderCollapse: "collapse", minWidth: 3000 }}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col} style={headerStyle}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row}>
                  {columns.map((col) => (
                    <td key={col} style={cellStyle}>
                      Row {row} — {col}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </HorizontalScrollWrapper>
      </div>
    </section>
  );
}

// ── App ─────────────────────────────────────────────────
function App() {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 32, fontSize: 28 }}>
        react-horizontal-scroll-indicator
      </h1>
      <SelfManagedDemo />
      <ExternalScrollDemo />
      <NonDraggableDemo />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
