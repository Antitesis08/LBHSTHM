import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.6,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1a365d',
    paddingBottom: 15,
  },
  orgName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1a365d',
    marginBottom: 2,
  },
  orgSubtitle: {
    fontSize: 9,
    color: '#4a5568',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    color: '#1a365d',
    textDecoration: 'underline',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1a365d',
    marginBottom: 6,
    marginTop: 8,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#2d3748',
    marginBottom: 3,
  },
  value: {
    fontSize: 11,
    color: '#1a202c',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  rowLabel: {
    width: '35%',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#2d3748',
  },
  rowValue: {
    width: '65%',
    fontSize: 11,
    color: '#1a202c',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginVertical: 12,
  },
  body: {
    fontSize: 11,
    color: '#1a202c',
    textAlign: 'justify',
    marginBottom: 8,
  },
  numberedItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  number: {
    width: 20,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#2d3748',
  },
  itemContent: {
    flex: 1,
    fontSize: 11,
    color: '#1a202c',
    textAlign: 'justify',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#718096',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  signatureBlock: {
    marginTop: 40,
    alignItems: 'flex-end',
  },
  signatureLabel: {
    fontSize: 10,
    color: '#4a5568',
    marginBottom: 40,
  },
  signatureName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1a202c',
    borderTopWidth: 1,
    borderTopColor: '#2d3748',
    paddingTop: 4,
  },
  signatureRole: {
    fontSize: 9,
    color: '#4a5568',
    marginTop: 2,
  },
  disclaimer: {
    fontSize: 8,
    color: '#a0aec0',
    marginTop: 20,
    fontStyle: 'italic',
    textAlign: 'justify',
  },
});

function formatDate(date) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(date));
}

function formatServiceType(type) {
  const map = {
    KONSULTASI_HUKUM: 'Konsultasi Hukum',
    PENDAMPINGAN_HUKUM: 'Pendampingan Hukum',
    LEGAL_OPINION: 'Legal Opinion',
    MEDIASI: 'Mediasi',
    PENDAFTARAN_HKI: 'Pendaftaran HKI',
    PRO_BONO: 'Pro Bono',
  };
  return map[type] || type;
}

function LegalOpinionDoc({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.orgName}>LEMBAGA KONSULTASI DAN BANTUAN HUKUM (LKBH)</Text>
          <Text style={styles.orgName}>SEKOLAH TINGGI HUKUM MILITER &quot;AHM-PTHM&quot;</Text>
          <Text style={styles.orgSubtitle}>Jl. Matraman Raya No. 126, Jakarta Timur | Telp: (021) 8500-STHM | Portal: lbh.sthm.ac.id</Text>
        </View>

        <Text style={styles.title}>PENDAPAT HUKUM (LEGAL OPINION)</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Nomor</Text>
          <Text style={styles.rowValue}>: {data.code}/LO/{new Date().getFullYear()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Perihal</Text>
          <Text style={styles.rowValue}>: {data.title}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Tanggal</Text>
          <Text style={styles.rowValue}>: {formatDate(new Date())}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Klien</Text>
          <Text style={styles.rowValue}>: {data.clientName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Jenis Layanan</Text>
          <Text style={styles.rowValue}>: {formatServiceType(data.serviceType)}</Text>
        </View>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>I. LATAR BELAKANG</Text>
        <Text style={styles.body}>
          Klien {data.clientName} telah mengajukan permohonan bantuan hukum kepada Lembaga Bantuan
          Hukum Sekolah Tinggi Hukum Militer (LBH STHM) terkait permasalahan hukum sebagaimana
          diuraikan berikut ini. Pengajuan tercatat dengan nomor perkara {data.code} pada tanggal{' '}
          {formatDate(data.createdAt)}.
        </Text>

        <Text style={styles.sectionTitle}>II. DUDUK PERKARA</Text>
        <Text style={styles.body}>{data.description}</Text>

        <Text style={styles.sectionTitle}>III. DASAR HUKUM</Text>
        <Text style={styles.body}>
          Analisis hukum atas permasalahan ini didasarkan pada ketentuan peraturan
          perundang-undangan yang berlaku di Negara Kesatuan Republik Indonesia, termasuk namun
          tidak terbatas pada peraturan yang relevan dengan jenis layanan{' '}
          {formatServiceType(data.serviceType).toLowerCase()} yang dimohonkan oleh klien.
        </Text>

        <Text style={styles.sectionTitle}>IV. ANALISIS HUKUM</Text>
        <Text style={styles.body}>
          Berdasarkan fakta-fakta yang disampaikan klien dan kajian terhadap peraturan
          perundang-undangan yang berlaku, konsultan hukum LBH STHM berpendapat bahwa permasalahan
          ini memerlukan penanganan lebih lanjut sesuai dengan mekanisme hukum yang berlaku.
          Analisis terperinci akan disusun dalam dokumen terpisah apabila diperlukan.
        </Text>

        <Text style={styles.sectionTitle}>V. KESIMPULAN DAN REKOMENDASI</Text>
        <View style={styles.numberedItem}>
          <Text style={styles.number}>1.</Text>
          <Text style={styles.itemContent}>
            Permasalahan hukum yang diajukan klien telah dikaji dan dicatat oleh LBH STHM.
          </Text>
        </View>
        <View style={styles.numberedItem}>
          <Text style={styles.number}>2.</Text>
          <Text style={styles.itemContent}>
            Klien disarankan untuk menyiapkan dokumen pendukung yang diperlukan guna memperkuat
            posisi hukumnya.
          </Text>
        </View>
        <View style={styles.numberedItem}>
          <Text style={styles.number}>3.</Text>
          <Text style={styles.itemContent}>
            LBH STHM akan mendampingi klien dalam proses hukum selanjutnya sesuai dengan lingkup
            layanan {formatServiceType(data.serviceType).toLowerCase()} yang telah disepakati.
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          Dokumen ini merupakan pendapat hukum awal yang disusun berdasarkan informasi yang
          diberikan oleh klien. Pendapat ini tidak mengikat secara hukum dan dapat berubah seiring
          dengan perkembangan fakta dan bukti yang ditemukan kemudian.
        </Text>

        <View style={styles.signatureBlock}>
          <Text style={styles.signatureLabel}>Konsultan Hukum LBH STHM,</Text>
          <Text style={styles.signatureName}>{data.consultantName}</Text>
          <Text style={styles.signatureRole}>Lembaga Bantuan Hukum STHM</Text>
        </View>

        <View style={styles.footer}>
          <Text>LBH STHM — Legal Opinion — Rahasia</Text>
          <Text>Dibuat secara otomatis pada {formatDate(new Date())}</Text>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Render PDF Legal Opinion ke buffer
 * @param {object} data - Data case (code, title, description, clientName, consultantName, dll)
 * @returns {Promise<Buffer>}
 */
export async function renderLegalOpinion(data) {
  return renderToBuffer(<LegalOpinionDoc data={data} />);
}
