import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 45,
    fontSize: 10.5,
    fontFamily: 'Helvetica',
    lineHeight: 1.55,
    color: '#1a1f1b',
  },
  header: {
    textAlign: 'center',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#2b3a1e',
    paddingBottom: 10,
  },
  orgTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#2b3a1e',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subTitle: {
    fontSize: 8.5,
    color: '#4b5563',
    marginTop: 2,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 16,
    color: '#111827',
    textDecoration: 'underline',
  },
  paragraph: {
    marginBottom: 8,
    textAlign: 'justify',
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  box: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  fieldLabel: {
    width: '32%',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  fieldValue: {
    width: '68%',
    fontSize: 10,
    color: '#111827',
  },
  divider: {
    textAlign: 'center',
    marginVertical: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26,
    paddingHorizontal: 20,
  },
  signatureBox: {
    width: '45%',
    alignItems: 'center',
    textAlign: 'center',
  },
  meteraiBox: {
    borderWidth: 1,
    borderColor: '#9ca3af',
    borderStyle: 'dashed',
    padding: 6,
    marginVertical: 10,
    fontSize: 8,
    color: '#6b7280',
    borderRadius: 3,
  },
  signSpace: {
    height: 48,
  },
  signName: {
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    fontSize: 10,
  },
  signTitle: {
    fontSize: 9,
    color: '#4b5563',
    marginTop: 2,
  },
});

export function SuratKuasaPdf({ data }) {
  const {
    code = 'LBH-STHM',
    title = 'Perkara Hukum',
    description = '',
    clientName = 'Pemberi Kuasa',
    clientEmail = '',
    consultantName = 'Advokat / Konsultan LKBH STHM',
    sprinNumber = 'Sprin/LKBH-STHM/2026',
    dateStr = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date()),
  } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Kop Surat Resmi */}
        <View style={styles.header}>
          <Text style={styles.orgTitle}>LEMBAGA KONSULTASI DAN BANTUAN HUKUM (LKBH)</Text>
          <Text style={styles.orgTitle}>SEKOLAH TINGGI HUKUM MILITER &quot;AHM-PTHM&quot;</Text>
          <Text style={styles.subTitle}>
            Jl. Matraman Raya No. 126, Jakarta Timur | Telp: (021) 8500-STHM | Portal: lbh.sthm.ac.id
          </Text>
        </View>

        {/* Judul Surat */}
        <Text style={styles.title}>SURAT KUASA KHUSUS</Text>
        <Text style={{ textAlign: 'center', fontSize: 9, color: '#4b5563', marginTop: -12, marginBottom: 14 }}>
          Nomor Dokumen: SKK/{code}/{new Date().getFullYear()}
        </Text>

        <Text style={styles.paragraph}>
          Yang bertanda tangan di bawah ini:
        </Text>

        {/* Identitas Pemberi Kuasa */}
        <View style={styles.box}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nama Lengkap</Text>
            <Text style={styles.fieldValue}>: {clientName}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Kontak / Email</Text>
            <Text style={styles.fieldValue}>: {clientEmail || '-'}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Kedudukan</Text>
            <Text style={styles.fieldValue}>: Selaku PEMBERI KUASA</Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          Dalam hal ini memilih domisili hukum di kantor kuasanya tersebut di bawah ini, dengan ini memberikan kuasa penuh kepada:
        </Text>

        {/* Identitas Penerima Kuasa */}
        <View style={styles.box}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nama Kuasa Hukum</Text>
            <Text style={styles.fieldValue}>: {consultantName}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Dasar Penugasan</Text>
            <Text style={styles.fieldValue}>: Surat Perintah/Tugas No. {sprinNumber}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Kantor / Kedudukan</Text>
            <Text style={styles.fieldValue}>: LKBH STHM Ditkumad, Jakarta Timur</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Kedudukan</Text>
            <Text style={styles.fieldValue}>: Selaku PENERIMA KUASA</Text>
          </View>
        </View>

        <Text style={styles.divider}>------------------- KHUSUS -------------------</Text>

        <Text style={styles.paragraph}>
          Untuk dan atas nama Pemberi Kuasa mewakili, mendampingi, dan membela hak-hak serta kepentingan hukum Pemberi Kuasa sehubungan dengan perkara: <Text style={styles.bold}>{title}</Text> ({code}).
        </Text>

        <Text style={styles.paragraph}>
          Uraian Singkat Perkara: {description ? description.slice(0, 320) + (description.length > 320 ? '...' : '') : '-'}
        </Text>

        <Text style={styles.paragraph}>
          Untuk itu Penerima Kuasa berhak menghadap di muka seluruh badan peradilan (Pengadilan Negeri, Pengadilan Militer, Pengadilan Agama, PTUN), instansi kepolisian, kejaksaan, serta instansi pemerintah maupun swasta lainnya; membuat, menandatangani, dan mengajukan gugatan, jawaban, replik, duplik, eksepsi, nota pembelaan (pledoi), daftar bukti, kesimpulan, memori banding, kontra memori banding, memori kasasi, serta permohonan peninjauan kembali (PK); mengajukan permohonan perdamaian atau penolakan, serta melakukan segala tindakan hukum yang dianggap perlu, sah, dan berguna demi kepentingan Pemberi Kuasa sebagaimana diatur dalam peraturan perundang-undangan.
        </Text>

        <Text style={styles.paragraph}>
          Surat Kuasa ini diberikan dengan hak substitusi (baik sebagian maupun seluruhnya) serta hak retensi menurut hukum.
        </Text>

        {/* Tanda Tangan */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signTitle}>Penerima Kuasa,</Text>
            <View style={styles.signSpace} />
            <Text style={styles.signName}>{consultantName}</Text>
            <Text style={styles.signTitle}>Advokat / Konsultan LKBH STHM</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signTitle}>Jakarta, {dateStr}</Text>
            <Text style={styles.signTitle}>Pemberi Kuasa,</Text>
            <View style={styles.meteraiBox}>
              <Text>Materai Rp 10.000,-</Text>
            </View>
            <Text style={styles.signName}>{clientName}</Text>
            <Text style={styles.signTitle}>Klien Pemohon Bantuan Hukum</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function renderSuratKuasa(data) {
  return await renderToBuffer(<SuratKuasaPdf data={data} />);
}

