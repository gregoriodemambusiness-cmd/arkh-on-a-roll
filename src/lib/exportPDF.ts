import type { Project } from "./projectStore";
import type { MockUser } from "./mockAuth";
import { computeHealth, formatEuro, analyzeBudget } from "./projectStore";

export async function exportProjectPDF(project: Project, user?: MockUser | null): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const W = 210;
  const H = 297;
  const M = 20;
  const CW = W - M * 2;
  const BRAND: [number, number, number] = [123, 47, 255];

  function footer(page: number) {
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Generato con Pilot — pilotai.co", M, H - 10);
    doc.text(`Pagina ${page}`, W - M, H - 10, { align: "right" });
  }

  function heading(text: string, y: number) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND);
    doc.text(text, M, y);
  }

  function body(text: string, y: number, color: [number, number, number] = [40, 40, 40]): number {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text || "—", CW);
    doc.text(lines, M, y);
    return y + lines.length * 5;
  }

  // ── PAGE 1: Cover ──────────────────────────────────────────────────
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, W, H, "F");

  // Triangle logo
  doc.setFillColor(255, 255, 255);
  const cx = W / 2;
  doc.triangle(cx, 72, cx - 14, 96, cx + 14, 96, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("PILOT", W / 2, 112, { align: "center" });

  doc.setFontSize(18);
  doc.setFont("helvetica", "normal");
  doc.text(project.name, W / 2, 130, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(160, 160, 160);
  doc.text(`Piano: ${user?.plan ?? "free"}`, W / 2, 144, { align: "center" });
  doc.text(`Generato il ${new Date().toLocaleDateString("it-IT")}`, W / 2, 151, { align: "center" });

  footer(1);

  // ── PAGE 2: Blueprint ──────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Blueprint", M, 28);

  let y = 42;
  const bp = project.blueprint;

  const sections: [string, string][] = [
    ["Problema", bp?.problem],
    ["Soluzione", bp?.solution],
    ["Target", bp?.target],
    ["Value Proposition", bp?.valueProp],
    ["Business Model", bp?.businessModel],
  ];

  for (const [title, content] of sections) {
    if (y > H - 30) { doc.addPage(); y = 28; }
    heading(title, y);
    y += 6;
    y = body(content || "—", y) + 8;
  }

  footer(2);

  // ── PAGE 3: Roadmap ────────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Roadmap", M, 28);

  y = 42;
  for (const phase of project.roadmap) {
    if (y > H - 40) { doc.addPage(); y = 28; }
    heading(`${phase.label} (${phase.key} giorni)`, y);
    y += 7;
    for (const item of phase.items) {
      const mark = item.done ? "[x]" : "[ ]";
      const lines = doc.splitTextToSize(`${mark} ${item.t}`, CW - 4);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.text(lines, M + 2, y);
      y += lines.length * 5 + 2;
    }
    y += 8;
  }

  footer(3);

  // ── PAGE 4: Tasks & Metrics ────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Task e Metriche", M, 28);

  y = 42;
  heading("Task aperti", y);
  y += 7;

  const PRIORITY_COLOR: Record<string, [number, number, number]> = {
    Alta: [220, 38, 38],
    Media: [234, 179, 8],
    Bassa: [34, 197, 94],
  };

  for (const t of project.tasks.filter((t) => t.status !== "Completato").slice(0, 10)) {
    if (y > H - 30) break;
    const [r, g, b] = PRIORITY_COLOR[t.priority] ?? [100, 100, 100];
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.text(`[${t.priority}]`, M, y);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(t.title, CW - 22);
    doc.text(lines, M + 20, y);
    y += lines.length * 5 + 3;
  }

  y += 8;
  if (y < H - 50) {
    const health = computeHealth(project);
    heading("Health Score", y);
    y += 7;
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`${health.score}/100`, M, y);
    y += 14;
  }

  if (y < H - 40) {
    const budget = analyzeBudget(project);
    heading("Budget", y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(`Disponibile: ${formatEuro(budget.available)}`, M, y); y += 5;
    doc.text(`MVP stimato: ${formatEuro(budget.estimated)}`, M, y); y += 5;
    const delta = budget.delta >= 0
      ? `+${formatEuro(budget.delta)} surplus`
      : `${formatEuro(Math.abs(budget.delta))} deficit`;
    doc.text(`Delta: ${delta}`, M, y);
  }

  footer(4);

  doc.save(`pilot-${project.name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
