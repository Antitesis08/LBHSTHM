import { prisma } from '../../../../../lib/prisma';
import { requireRole } from '../../../../../lib/auth';

/**
 * GET /api/consultants/:id/available-slots?date=YYYY-MM-DD
 * Returns available time slots for a consultant on a specific date.
 * Uses Availability model if data exists, otherwise defaults to 09:00-17:00.
 * Excludes slots already booked by active cases (status != DITOLAK).
 */
export async function GET(request, { params }) {
  const { user, error } = await requireRole(['CUSTOMER', 'ADMIN']);
  if (error) return error;

  const { id: consultantId } = await params;
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');

  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return Response.json({ error: 'Parameter date (YYYY-MM-DD) wajib diisi.' }, { status: 400 });
  }

  const requestedDate = new Date(dateStr + 'T00:00:00');
  if (isNaN(requestedDate.getTime())) {
    return Response.json({ error: 'Format tanggal tidak valid.' }, { status: 400 });
  }

  // Validate date range: not in the past, not more than 30 days ahead
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);

  if (requestedDate < today) {
    return Response.json({ error: 'Tanggal sudah lewat.' }, { status: 400 });
  }
  if (requestedDate > maxDate) {
    return Response.json({ error: 'Tanggal tidak boleh lebih dari 30 hari ke depan.' }, { status: 400 });
  }

  // Check consultant exists
  const consultant = await prisma.consultantProfile.findUnique({
    where: { id: consultantId },
    select: { id: true, isAvailable: true },
  });
  if (!consultant) {
    return Response.json({ error: 'Konsultan tidak ditemukan.' }, { status: 404 });
  }

  // Get day of week (0=Sunday, 1=Monday, ...)
  const dayOfWeek = requestedDate.getDay();

  // Check Availability entries for this consultant + day
  const availabilities = await prisma.availability.findMany({
    where: { consultantId, dayOfWeek },
    orderBy: { startTime: 'asc' },
  });

  // Generate hourly slots from availability (or default 09:00-17:00)
  let allSlots = [];
  if (availabilities.length > 0) {
    for (const avail of availabilities) {
      const startHour = parseInt(avail.startTime.split(':')[0], 10);
      const endHour = parseInt(avail.endTime.split(':')[0], 10);
      for (let h = startHour; h < endHour; h++) {
        const slot = `${h.toString().padStart(2, '0')}:00`;
        if (!allSlots.includes(slot)) allSlots.push(slot);
      }
    }
  } else {
    // Default: 09:00-17:00 (TODO: admin bisa atur nanti)
    for (let h = 9; h < 17; h++) {
      allSlots.push(`${h.toString().padStart(2, '0')}:00`);
    }
  }

  // Find existing schedules for this consultant on this date (active cases only)
  const dayStart = new Date(dateStr + 'T00:00:00.000Z');
  const dayEnd = new Date(dateStr + 'T23:59:59.999Z');

  const existingSchedules = await prisma.schedule.findMany({
    where: {
      consultantId,
      scheduledAt: { gte: dayStart, lte: dayEnd },
      case: { status: { not: 'DITOLAK' } },
    },
    select: { scheduledAt: true },
  });

  // Build set of booked hours
  const bookedSlots = new Set(
    existingSchedules.map((s) => {
      const hour = new Date(s.scheduledAt).getUTCHours();
      return `${hour.toString().padStart(2, '0')}:00`;
    })
  );

  // If today, also exclude slots that have already passed
  const nowHour = new Date().getHours();
  const isToday = requestedDate.getTime() === today.getTime();

  const slots = allSlots.map((slot) => {
    const slotHour = parseInt(slot.split(':')[0], 10);
    const isBooked = bookedSlots.has(slot);
    const isPast = isToday && slotHour <= nowHour;
    return {
      time: slot,
      available: !isBooked && !isPast,
    };
  });

  return Response.json({ date: dateStr, slots });
}
