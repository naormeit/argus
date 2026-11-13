import jsPDF from 'jspdf'
import { AuditReport } from '../types'

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'CRITICAL',
  high:     'HIGH',
  medium:   'MEDIUM',
  low:      'LOW',
  info:     'INFO',
}

const RISK_COLORS: Record<string, [number, number, number]> = {
  critical: [220, 38,  38],
  high:     [249, 115, 22],
  medium:   [234, 179,  8],
  low:      [59,  130, 246],
  info:     [107, 114, 128],
}

const BG:    [number, number, number] = [10,  10,  15]
const BG2:   [number, number, number] = [18,  18,  26]
const GOLD:  [number, number, number] = [212, 160, 82]
const DIM:   [number, number, number] = [110, 110, 130]
const TEXT:  [number, number, number] = [210, 210, 225]
const WHITE: [number, number, number] = [240, 240, 248]
const GREEN: [number, number, number] = [74,  200, 110]

export function generatePDF(report: AuditReport): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const H = 297
  const margin = 18
  const contentW = W - margin * 2
  let y = 0

  // ── helpers ──────────────────────────────────────────────────────────────

  const fillPage = () => {
    doc.setFillColor(...BG)
    doc.rect(0, 0, W, H, 'F')
  }

  const wrap = (text: string, x: number, maxW: number, lineH: number): number => {
    const lines = doc.splitTextToSize(text, maxW) as string[]
    lines.forEach(line => {
      doc.text(line, x, y)
      y += lineH
    })
    return lines.length
  }

  const checkPage = (needed = 12) => {
    if (y + needed > 282) {
      doc.addPage()
      fillPage()
      y = 18
    }
  }

  // ── page 1 background ────────────────────────────────────────────────────

  fillPage()

  // ── cover header bar ─────────────────────────────────────────────────────

  doc.setFillColor(...BG2)
  doc.rect(0, 0, W, 44, 'F')

  // left accent stripe
  doc.setFillColor(...GOLD)
  doc.rect(0, 0, 3, 44, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(...GOLD)
  doc.text('ARGUS', margin + 2, 20)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...DIM)
  doc.text('Multi-Agent Smart Contract Security Audit', margin + 2, 28)

  const riskLabel = SEVERITY_LABEL[report.overall_risk] ?? report.overall_risk.toUpperCase()
  const [rr, rg, rb] = RISK_COLORS[report.overall_risk] ?? [107, 114, 128]
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(rr, rg, rb)
  doc.text(`${riskLabel} RISK`, W - margin, 20, { align: 'right' })

  const findingsCount = report.findings.length
  const countLabel = findingsCount === 0
    ? 'No findings'
    : `${findingsCount} finding${findingsCount !== 1 ? 's' : ''}`
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DIM)
  doc.text(countLabel, W - margin, 28, { align: 'right' })

  y = 54

  // ── metadata block ───────────────────────────────────────────────────────

  doc.setFontSize(7.5)
  doc.setFont('courier', 'normal')
  doc.setTextColor(...DIM)
  doc.text(`Audit ID : ${report.audit_id}`, margin, y); y += 5
  doc.text(`Timestamp: ${new Date(report.timestamp).toUTCString()}`, margin, y); y += 5
  doc.text(`SHA-256  : ${report.code_hash}`, margin, y); y += 5
  const sigPreview = report.signature.length > 72
    ? report.signature.slice(0, 72) + '...'
    : report.signature
  doc.text(`Signature: ${sigPreview}`, margin, y); y += 10

  // ── divider ───────────────────────────────────────────────────────────────

  doc.setDrawColor(50, 50, 65)
  doc.setLineWidth(0.3)
  doc.line(margin, y, W - margin, y); y += 8

  // ── executive summary ────────────────────────────────────────────────────

  if (report.summary) {
    checkPage(20)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...WHITE)
    doc.text('Executive Summary', margin, y); y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...TEXT)
    wrap(report.summary, margin, contentW, 5); y += 7
  }

  // ── findings header ───────────────────────────────────────────────────────

  checkPage(14)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...WHITE)
  doc.text(`Findings  (${report.findings.length})`, margin, y); y += 7

  if (report.findings.length === 0) {
    // green "clean" pill
    doc.setFillColor(20, 60, 30)
    doc.roundedRect(margin, y - 4, contentW, 10, 2, 2, 'F')
    doc.setDrawColor(60, 160, 80)
    doc.setLineWidth(0.3)
    doc.roundedRect(margin, y - 4, contentW, 10, 2, 2, 'S')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...GREEN)
    doc.text('[OK]  No vulnerabilities detected. Code appears secure.', margin + 4, y + 1.5)
    y += 14
  }

  // ── each finding ─────────────────────────────────────────────────────────

  report.findings.forEach((finding, idx) => {
    checkPage(35)

    const [fr, fg, fb] = RISK_COLORS[finding.severity] ?? [107, 114, 128]

    // finding header background
    doc.setFillColor(fr * 0.15, fg * 0.15, fb * 0.15)
    doc.roundedRect(margin, y - 5, contentW, 9, 1.5, 1.5, 'F')

    // severity badge
    doc.setFillColor(fr, fg, fb)
    doc.roundedRect(margin + 1, y - 4, 20, 5.5, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(255, 255, 255)
    doc.text(SEVERITY_LABEL[finding.severity] ?? finding.severity.toUpperCase(), margin + 11, y, { align: 'center' })

    // vulnerability name
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...WHITE)
    doc.text(`${idx + 1}. ${finding.vulnerability}`, margin + 24, y); y += 8

    // confidence bar (drawn manually)
    const pct = Math.round(finding.confidence * 100)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...DIM)
    doc.text(`Confidence: ${pct}%`, margin, y)
    // bar track
    doc.setFillColor(40, 40, 55)
    doc.roundedRect(margin + 28, y - 3, 50, 2.5, 0.8, 0.8, 'F')
    // bar fill
    doc.setFillColor(fr, fg, fb)
    doc.roundedRect(margin + 28, y - 3, 50 * (pct / 100), 2.5, 0.8, 0.8, 'F')
    y += 6

    // description
    checkPage(15)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...DIM)
    doc.text('Description', margin, y); y += 4.5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...TEXT)
    wrap(finding.description, margin, contentW, 5); y += 3

    // remediation
    checkPage(15)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...GREEN)
    doc.text('Remediation', margin, y); y += 4.5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(170, 215, 180)
    wrap(finding.remediation, margin, contentW, 5); y += 3

    // PoC code
    if (finding.poc_code) {
      checkPage(18)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(100, 160, 255)
      doc.text('Proof of Concept', margin, y); y += 5

      const pocLines = finding.poc_code.split('\n').slice(0, 20)
      // code background
      const codeH = Math.min(pocLines.length, 20) * 4 + 4
      doc.setFillColor(20, 20, 30)
      doc.roundedRect(margin, y - 2, contentW, codeH, 1.5, 1.5, 'F')
      doc.setDrawColor(50, 80, 50)
      doc.setLineWidth(0.2)
      doc.roundedRect(margin, y - 2, contentW, codeH, 1.5, 1.5, 'S')

      doc.setFont('courier', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(100, 220, 130)
      pocLines.forEach(line => {
        checkPage(5)
        doc.text(line.slice(0, 95), margin + 2, y)
        y += 4
      })
      if (finding.poc_code.split('\n').length > 20) {
        doc.setTextColor(...DIM)
        doc.text('... (truncated - full PoC in web report)', margin + 2, y); y += 4
      }
      y += 4
    }

    // separator
    checkPage(8)
    doc.setDrawColor(40, 40, 55)
    doc.setLineWidth(0.15)
    doc.line(margin, y, W - margin, y); y += 7
  })

  // ── footer on every page ─────────────────────────────────────────────────

  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...DIM)
    // footer divider
    doc.setDrawColor(40, 40, 55)
    doc.setLineWidth(0.15)
    doc.line(margin, 287, W - margin, 287)
    doc.text(
      `Argus Security Audit  |  HMAC-SHA256 signed  |  argus-auditor`,
      margin, 292
    )
    doc.text(`${p} / ${totalPages}`, W - margin, 292, { align: 'right' })
  }

  doc.save(`argus-report-${report.audit_id.slice(0, 8)}.pdf`)
}
