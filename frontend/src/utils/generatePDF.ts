import jsPDF from 'jspdf'
import { AuditReport } from '../types'

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'CRITICAL',
  high:     'HIGH',
  medium:   'MEDIUM',
  low:      'LOW',
  info:     'INFO',
}

export function generatePDF(report: AuditReport): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 18
  const contentW = W - margin * 2
  let y = 0

  // ── helpers ──────────────────────────────────────────────────────────────

  const wrap = (text: string, x: number, maxW: number, lineH: number): number => {
    const lines = doc.splitTextToSize(text, maxW) as string[]
    doc.text(lines, x, y)
    y += lines.length * lineH
    return lines.length
  }

  const checkPage = (needed = 12) => {
    if (y + needed > 280) {
      doc.addPage()
      y = 18
    }
  }

  // ── cover header ─────────────────────────────────────────────────────────

  // dark background bar
  doc.setFillColor(10, 10, 15)
  doc.rect(0, 0, W, 42, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(212, 160, 82)   // argus gold
  doc.text('ARGUS', margin, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(160, 160, 170)
  doc.text('Multi-Agent Smart Contract Security Audit', margin, 25)

  const riskLabel = SEVERITY_LABEL[report.overall_risk] ?? report.overall_risk.toUpperCase()
  const riskColors: Record<string, [number, number, number]> = {
    critical: [220, 38,  38],
    high:     [249, 115, 22],
    medium:   [234, 179, 8],
    low:      [59,  130, 246],
    info:     [107, 114, 128],
  }
  const [r, g, b] = riskColors[report.overall_risk] ?? [107, 114, 128]
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(r, g, b)
  doc.text(`${riskLabel} RISK`, W - margin, 18, { align: 'right' })

  y = 50

  // ── metadata ─────────────────────────────────────────────────────────────

  doc.setFontSize(7.5)
  doc.setFont('courier', 'normal')
  doc.setTextColor(130, 130, 145)
  doc.text(`Audit ID : ${report.audit_id}`, margin, y); y += 5
  doc.text(`Timestamp: ${new Date(report.timestamp).toUTCString()}`, margin, y); y += 5
  doc.text(`SHA-256  : ${report.code_hash}`, margin, y); y += 5
  doc.text(`Signature: ${report.signature.slice(0, 80)}…`, margin, y); y += 10

  // ── divider ───────────────────────────────────────────────────────────────

  doc.setDrawColor(50, 50, 60)
  doc.setLineWidth(0.3)
  doc.line(margin, y, W - margin, y); y += 7

  // ── executive summary ────────────────────────────────────────────────────

  if (report.summary) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(220, 220, 230)
    doc.text('Executive Summary', margin, y); y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(190, 190, 205)
    wrap(report.summary, margin, contentW, 5); y += 6
  }

  // ── findings count ───────────────────────────────────────────────────────

  checkPage(14)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(220, 220, 230)
  doc.text(`Findings  (${report.findings.length})`, margin, y); y += 7

  if (report.findings.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(74, 222, 128)
    doc.text('✓  No vulnerabilities detected. Code appears secure.', margin, y); y += 10
  }

  // ── each finding ─────────────────────────────────────────────────────────

  report.findings.forEach((finding, idx) => {
    checkPage(30)

    const [fr, fg, fb] = riskColors[finding.severity] ?? [107, 114, 128]

    // severity badge + title
    doc.setFillColor(fr, fg, fb)
    doc.roundedRect(margin, y - 4, 22, 5.5, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(255, 255, 255)
    doc.text(SEVERITY_LABEL[finding.severity] ?? finding.severity.toUpperCase(), margin + 11, y, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(230, 230, 240)
    doc.text(`${idx + 1}. ${finding.vulnerability}`, margin + 26, y); y += 7

    // confidence
    const pct = Math.round(finding.confidence * 100)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(130, 130, 145)
    doc.text(`Confidence: ${pct}%`, margin, y); y += 5

    // description
    checkPage(15)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(180, 180, 195)
    doc.text('Description', margin, y); y += 4.5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(200, 200, 215)
    wrap(finding.description, margin, contentW, 4.8); y += 3

    // remediation
    checkPage(15)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(74, 222, 128)
    doc.text('Remediation', margin, y); y += 4.5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(190, 210, 195)
    wrap(finding.remediation, margin, contentW, 4.8); y += 3

    // PoC code (truncated to avoid huge pages)
    if (finding.poc_code) {
      checkPage(15)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(100, 160, 255)
      doc.text('Proof of Concept', margin, y); y += 4.5

      const pocLines = finding.poc_code.split('\n').slice(0, 20)
      doc.setFont('courier', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(100, 220, 130)
      pocLines.forEach(line => {
        checkPage(5)
        doc.text(line.slice(0, 100), margin, y)
        y += 4
      })
      if (finding.poc_code.split('\n').length > 20) {
        doc.setTextColor(130, 130, 145)
        doc.text('… (truncated — full PoC available in the web report)', margin, y); y += 4
      }
      y += 2
    }

    // separator
    doc.setDrawColor(40, 40, 50)
    doc.setLineWidth(0.2)
    doc.line(margin, y, W - margin, y); y += 6
  })

  // ── footer on every page ─────────────────────────────────────────────────

  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(80, 80, 95)
    doc.text(
      `Argus Security Audit  •  HMAC-SHA256 signed  •  argus-auditor`,
      margin, 292
    )
    doc.text(`${p} / ${totalPages}`, W - margin, 292, { align: 'right' })
  }

  doc.save(`argus-report-${report.audit_id.slice(0, 8)}.pdf`)
}
