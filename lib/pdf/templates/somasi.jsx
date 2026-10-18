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
    marginBottom: 4,
    color: '#111827',
    textDecoration: 'underline',
  },
  subHeaderNumber: {
    textAlign: 'center',
    fontSize: 9,
    color: '#4b5563',
    marginBottom: 16,
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
    width: '28%',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  fieldValue: {
    width: '72%',
    fontSize: 10,
    color: '#111827',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 10,
  },
  listNum: {
    width: 18,
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  listText: {
    flex: 1,
    fontSize: 10,
    textAlign: 'justify',
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 26,
    paddingRight: 20,
  },
  signatureBox: {
    width: '50%',
    alignItems: 'center',
    textAlign: 'center',
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

export function SomasiPdf({ data }) {
  const {
    code = 'LBH-STHM',
    title = 'Perkara Hukum',
    description = '',
    clientName = 'Klien Pemohon',
    consultantName = 'Advokat / Konsultan LKBH STHM',
    sprinNumber = 'Sprin/LKBH-STHM/2026',
    notes = '',
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
        <Text style={styles.title}>SURAT PERINGATAN / SOMASI I</Text>
        <Text style={styles.subHeaderNumber}>
          Nomor: {code}/SOMASI-I/{new Date().getFullYear()}/LKBH-STHM
        </Text>

        <View style={styles.box}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Perihal</Text>
            <Text style={styles.fieldValue}>: Teguran Hukum Terkait {title}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Dasar Kuasa</Text>
            <Text style={styles.fieldValue}>: Surat Kuasa Khusus an. {clientName}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Kuasa Hukum</Text>
            <Text style={styles.fieldValue}>: {consultantName} (LKBH STHM)</Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          Dengan hormat,
        </Text>

        <Text style={styles.paragraph}>
          Bertindak untuk dan atas nama serta kepentingan hukum Klien kami: <Text style={styles.bold}>{clientName}</Text>, berdasarkan Surat Kuasa Khusus dan Surat Perintah Tugas No. {sprinNumber}, dengan ini kami menyampaikan Surat Peringatan Hukum (Somasi) sehubungan dengan permasalahan sebagai berikut:
        </Text>

        <View style={styles.listItem}>
          <Text style={styles.listNum}>1.</Text>
          <Text style={styles.listText}>
            Bahwa Klien kami dan Pihak Terkait telah terikat dalam hubungan hukum/kewajiban yang timbul sehubungan dengan: {title}.
          </Text>
        </View>

        <View style={styles.listItem}>
          <Text style={styles.listNum}>2.</Text>
          <Text style={styles.listText}>
            Uraian Pokok Permasalahan: {description || 'Pihak Terkait belum memenuhi kewajiban hukum yang disepakati sehingga menimbulkan kerugian hukum bagi Klien kami.'}
          </Text>
        </View>

        {notes ? (
          <View style={styles.listItem}>
            <Text style={styles.listNum}>3.</Text>
            <Text style={styles.listText}>
              Petunjuk & Peringatan Khusus Kuasa Hukum: {notes}
            </Text>
          </View>
        ) : null}

        <View style={styles.listItem}>
          <Text style={styles.listNum}>{notes ? '4.' : '3.'}</Text>
          <Text style={styles.listText}>
            Bahwa Klien kami telah berulang kali mengupayakan penyelesaian secara kekeluargaan dan musyawarah namun belum memperoleh tanggapan yang beriktikad baik.
          </Text>
        </View>

        <Text style={styles.paragraph}>
          Oleh karena itu, melalui Surat Somasi ini, kami memberikan kesempatan dan batas waktu selambat-lambatnya <Text style={styles.bold}>7 (tujuh) hari kalender</Text> sejak diterimanya surat ini untuk segera menyelesaikan kewajiban hukum atau hadir bermusyawarah di Kantor LKBH STHM.
        </Text>

        <Text style={styles.paragraph}>
          Apabila dalam tenggang waktu tersebut Pihak Terkait tidak menanggapi atau beriktikad baik, maka kami akan mengambil langkah hukum tegas baik secara Perdata (Gugatan ke Pengadilan) maupun Pidana serta tindakan hukum lainnya sesuai ketentuan perundang-undangan yang berlaku.
        </Text>

        {/* Tanda Tangan */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signTitle}>Jakarta, {dateStr}</Text>
            <Text style={styles.signTitle}>Kuasa Hukum Klien,</Text>
            <View style={styles.signSpace} />
            <Text style={styles.signName}>{consultantName}</Text>
            <Text style={styles.signTitle}>Tim Advokat & Konsultan LKBH STHM</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function renderSomasi(data) {
  return await renderToBuffer(<SomasiPdf data={data} />);
}

