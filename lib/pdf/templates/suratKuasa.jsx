/**
 * Template Surat Kuasa — PLACEHOLDER
 *
 * Template ini BELUM AKTIF dan menunggu review serta validasi dari
 * advokat STHM sebelum dapat digunakan dalam sistem.
 *
 * Alasan: Surat Kuasa memiliki konsekuensi hukum langsung karena
 * digunakan sebagai dasar perwakilan di pengadilan. Format dan
 * isi wajib divalidasi oleh advokat sungguhan sebelum di-hardcode
 * ke sistem.
 *
 * Endpoint generate-doc akan menolak request dengan templateType
 * SURAT_KUASA dengan status 501 (Not Implemented).
 *
 * TODO: Implementasi penuh setelah format disetujui advokat STHM.
 * Struktur yang diperlukan:
 * - Kop surat LBH STHM
 * - Identitas pemberi kuasa (klien)
 * - Identitas penerima kuasa (konsultan/advokat)
 * - Hal yang dikuasakan (spesifik per kasus)
 * - Klausul substitusi
 * - Tanda tangan pemberi & penerima kuasa + materai
 */

// export async function renderSuratKuasa(data) {
//   // Akan diimplementasikan setelah review advokat
//   throw new Error('Template Surat Kuasa belum aktif.');
// }
