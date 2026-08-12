import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Font, renderToBuffer,
} from '@react-pdf/renderer'
import path from 'node:path'

// Marka fontları (Google Fonts'tan indirildi)
const FONT_DIR = path.join(process.cwd(), 'lib', 'pdf-assets')
Font.register({
  family: 'PlayfairDisplay',
  fonts: [
    { src: path.join(FONT_DIR, 'PlayfairDisplay-Bold.ttf'), fontWeight: 700 },
  ],
})
Font.register({
  family: 'DMSans',
  fonts: [
    { src: path.join(FONT_DIR, 'DMSans-Regular.ttf'), fontWeight: 400 },
    { src: path.join(FONT_DIR, 'DMSans-Bold.ttf'), fontWeight: 700 },
  ],
})

// Marka renkleri
const ESPRESSO = '#2B1B17'
const ESPRESSO_DARK = '#3D251E'
const GOLD = '#D4A373'

// Rapor verisi şeması
export interface PdfReportData {
  restaurantName: string
  term: string                // Rezervasyon / Seans / Ders / Randevu
  dateFrom: string
  dateTo: string
  total: number
  statusBreakdown: { label: string; count: number }[]
  revenue: number
  dailyTrend: { label: string; count: number }[]
  peakHour: string | null
  peakDay: string | null
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'DMSans',
    fontSize: 10,
    color: '#3D251E',
  },
  header: {
    backgroundColor: ESPRESSO,
    padding: 24,
    borderRadius: 8,
    marginBottom: 24,
  },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandName: { fontFamily: 'PlayfairDisplay', fontWeight: 700, fontSize: 20, color: GOLD },
  reportTitle: { fontFamily: 'PlayfairDisplay', fontWeight: 700, fontSize: 16, color: '#FFFFFF', marginTop: 12 },
  period: { fontSize: 10, color: '#D4A373', marginTop: 4 },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay', fontWeight: 700, fontSize: 13, color: ESPRESSO,
    marginTop: 18, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: GOLD, paddingBottom: 4,
  },
  kpiRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  kpiCard: { flex: 1, backgroundColor: '#F5EFE8', borderRadius: 6, padding: 12 },
  kpiValue: { fontFamily: 'DMSans', fontWeight: 700, fontSize: 18, color: ESPRESSO },
  kpiLabel: { fontSize: 9, color: '#6B5749', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  rowLabel: { color: '#6B5749' },
  rowValue: { fontFamily: 'DMSans', fontWeight: 700, color: ESPRESSO },
  table: { marginTop: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: ESPRESSO, paddingVertical: 5, paddingHorizontal: 6, borderRadius: 4 },
  tableHeaderCell: { flex: 1, fontSize: 9, color: GOLD, fontFamily: 'DMSans', fontWeight: 700 },
  tableRow: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: '#E5DCD2' },
  tableCell: { flex: 1, fontSize: 9, color: '#3D251E' },
  footer: { position: 'absolute', bottom: 24, left: 40, right: 40, fontSize: 8, color: '#A99C90', textAlign: 'center', borderTopWidth: 0.5, borderTopColor: GOLD, paddingTop: 8 },
  empty: { textAlign: 'center', color: '#6B5749', fontSize: 11, marginTop: 30, fontFamily: 'PlayfairDisplay' },
})

export async function generateReportPdf(data: PdfReportData): Promise<Buffer> {
  const hasData = data.total > 0

  const pdf = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={styles.brandName}>CheckRezerve</Text>
            <Text style={styles.period}>{data.dateFrom} — {data.dateTo}</Text>
          </View>
          <Text style={styles.reportTitle}>{data.restaurantName} · Dönem Raporu</Text>
        </View>

        {!hasData ? (
          <Text style={styles.empty}>Bu dönemde kayıt yok</Text>
        ) : (
          <>
            {/* KPI */}
            <Text style={styles.sectionTitle}>Genel Bakış</Text>
            <View style={styles.kpiRow}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>{data.total}</Text>
                <Text style={styles.kpiLabel}>Toplam {data.term}</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiValue}>{data.revenue.toLocaleString('tr-TR')} ₺</Text>
                <Text style={styles.kpiLabel}>Toplam Ciro</Text>
              </View>
            </View>

            {/* Durum kırılımı */}
            <Text style={styles.sectionTitle}>Durum Kırılımı</Text>
            {data.statusBreakdown.map((s, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.rowLabel}>{s.label}</Text>
                <Text style={styles.rowValue}>{s.count}</Text>
              </View>
            ))}

            {/* Günlük trend */}
            <Text style={styles.sectionTitle}>Günlük Trend</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Gün</Text>
                <Text style={[styles.tableHeaderCell, { flex: 0.5, textAlign: 'right' }]}>{data.term} Sayısı</Text>
              </View>
              {data.dailyTrend.map((d, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{d.label}</Text>
                  <Text style={[styles.tableCell, { flex: 0.5, textAlign: 'right' }]}>{d.count}</Text>
                </View>
              ))}
            </View>

            {/* Yoğunluk */}
            <Text style={styles.sectionTitle}>Yoğunluk Analizi</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>En yoğun saat</Text>
              <Text style={styles.rowValue}>{data.peakHour ?? '—'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>En yoğun gün</Text>
              <Text style={styles.rowValue}>{data.peakDay ?? '—'}</Text>
            </View>
          </>
        )}

        <Text style={styles.footer}>
          CheckRezerve · Bu rapor {new Date().toLocaleDateString('tr-TR')} tarihinde oluşturuldu
        </Text>
      </Page>
    </Document>
  )

  return renderToBuffer(pdf)
}
