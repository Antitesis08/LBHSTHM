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
  description: {
    fontSize: 11,
    color: '#1a202c',
    textAlign: 'justify',
    marginTop: 6,
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

function RingkasanKonsultasiDoc({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.orgName}>LEMBAGA BANTUAN HUKUM</Text>
          <Text style={styles.orgName}>SEKOLAH TINGGI HUKUM MILITER</Text>
          <Text style={styles.orgSubtitle}>Jl. Raya Bogor KM 24, Cijantung, Jakarta Timur 13770</Text>
          <Text style={styles.orgSubtitle}>Telp: (021) 8400123 | Email: lbh@sthm.ac.id</Text>
        </View>

        <Text style={styles.title}>RINGKASAN KONSULTASI HUKUM</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Nomor Perkara</Text>
          <Text style={styles.rowValue}>: {data.code}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Tanggal Pengajuan</Text>
          <Text style={styles.rowValue}>: {formatDate(data.createdAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Tanggal Dokumen</Text>
          <Text style={styles.rowValue}>: {formatDate(new Date())}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Nama Klien</Text>
          <Text style={styles.rowValue}>: {data.clientName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Jenis Layanan</Text>
          <Text style={styles.rowValue}>: {formatServiceType(data.serviceType)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Konsultan Hukum</Text>
          <Text style={styles.rowValue}>: {data.consultantName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Status</Text>
          <Text style={styles.rowValue}>: {data.status.replace(/_/g, ' ')}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.section}>
          <Text style={styles.label}>JUDUL PERKARA</Text>
          <Text style={styles.value}>{data.title}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>URAIAN MASALAH</Text>
          <Text style={styles.description}>{data.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>CATATAN KONSULTASI</Text>
          <Text style={styles.description}>
            Berdasarkan konsultasi yang telah dilaksanakan, klien telah menyampaikan permasalahan
            hukum sebagaimana diuraikan di atas. Konsultan hukum LBH STHM telah memberikan
            pandangan hukum awal dan arahan tindak lanjut yang diperlukan. Ringkasan ini dibuat
            sebagai dokumentasi resmi atas konsultasi yang telah berlangsung.
          </Text>
        </View>

        <View style={styles.signatureBlock}>
          <Text style={styles.signatureLabel}>Konsultan Hukum,</Text>
          <Text style={styles.signatureName}>{data.consultantName}</Text>
        </View>

        <View style={styles.footer}>
          <Text>LBH STHM — Dokumen Resmi</Text>
          <Text>Dibuat secara otomatis pada {formatDate(new Date())}</Text>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Render PDF Ringkasan Konsultasi ke buffer
 * @param {object} data - Data case (code, title, description, clientName, consultantName, dll)
 * @returns {Promise<Buffer>}
 */
export async function renderRingkasanKonsultasi(data) {
  return renderToBuffer(<RingkasanKonsultasiDoc data={data} />);
}
