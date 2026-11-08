import { downloadBlob, downloadText } from './download.js';
import { mpsToKmh } from './units.js';

export function exportSessionToCSV(session) {
  const headers = [
    'ball',
    'time_s',
    'speed_kmh',
    'speed_sd',
    'release_kmh',
    'bounce_kmh',
    'loss_pct',
    'length_m',
    'zone',
    'bounce_height_m',
    'swing_cm',
    'grade',
  ];

  const rows = (session.deliveries || []).map((del, idx) => {
    const m = del.metrics || {};
    const spd = m.speed ? mpsToKmh(m.speed.mps).toFixed(1) : '';
    const sd = m.speed?.sd ? mpsToKmh(m.speed.sd).toFixed(1) : '';
    const rel = m.speed?.mps ? mpsToKmh(m.speed.mps).toFixed(1) : '';
    const bnc = m.bounceSpeed?.mps ? mpsToKmh(m.bounceSpeed.mps).toFixed(1) : '';
    const loss = m.lossPct != null ? m.lossPct.toFixed(1) : '';
    const len = m.lengthDist != null ? m.lengthDist.toFixed(2) : '';
    const zone = m.lengthZone?.name || '';
    const bncH = m.bounceHeight != null ? m.bounceHeight.toFixed(2) : '';
    const swg = m.swing != null ? (m.swing * 100).toFixed(1) : '';
    const grade = del.grade?.grade || 'D';

    return [
      `Ball ${idx + 1}`,
      (del.tStart || 0).toFixed(2),
      spd,
      sd,
      rel,
      bnc,
      loss,
      len,
      `"${zone}"`,
      bncH,
      swg,
      grade,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadText(csvContent, `${session.name || 'session'}-${session.id || 'export'}.csv`, 'text/csv');
}

export function exportSessionToJSON(session) {
  const jsonContent = JSON.stringify(session, null, 2);
  downloadText(jsonContent, `${session.name || 'session'}-${session.id || 'export'}.json`, 'application/json');
}

/**
 * Generate 1080x1350 Instagram/Share card PNG
 */
export async function exportShareImage(session, delivery) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
  gradient.addColorStop(0, '#0b0f14');
  gradient.addColorStop(0.5, '#121923');
  gradient.addColorStop(1, '#090d12');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1350);

  // Decorative grid / lines
  ctx.strokeStyle = 'rgba(198, 255, 61, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 60; x < 1080; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1350);
    ctx.stroke();
  }
  for (let y = 60; y < 1350; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1080, y);
    ctx.stroke();
  }

  // Header Title
  ctx.fillStyle = '#c6ff3d';
  ctx.font = 'bold 36px "Barlow Condensed", sans-serif';
  ctx.fillText('SEAM & SPEED', 80, 110);

  ctx.fillStyle = '#8a9ab0';
  ctx.font = '500 24px Inter, sans-serif';
  ctx.fillText('CRICKET BALL TRACKER & SPEED GUN', 80, 150);

  // Bowler & Date
  const bowlerText = session.bowler || 'Practice Session';
  ctx.fillStyle = '#e8eef5';
  ctx.font = 'bold 44px Inter, sans-serif';
  ctx.fillText(bowlerText, 80, 230);

  ctx.fillStyle = '#8a9ab0';
  ctx.font = '400 24px Inter, sans-serif';
  ctx.fillText(new Date(session.date || Date.now()).toLocaleDateString('en-GB', { dateStyle: 'full' }), 80, 275);

  // Big Speed Display Card
  ctx.fillStyle = '#182231';
  ctx.strokeStyle = '#243146';
  ctx.lineWidth = 2;
  ctx.roundRect ? ctx.roundRect(80, 330, 920, 360, 24) : ctx.rect(80, 330, 920, 360);
  ctx.fill();
  ctx.stroke();

  const m = delivery?.metrics || {};
  const spd = m.speed?.mps ? mpsToKmh(m.speed.mps).toFixed(1) : '—';
  const sd = m.speed?.sd ? mpsToKmh(m.speed.sd).toFixed(1) : '—';
  const grade = delivery?.grade?.grade || 'A';

  ctx.fillStyle = '#8a9ab0';
  ctx.font = '600 26px "Barlow Condensed", sans-serif';
  ctx.fillText('PEAK RELEASE SPEED', 130, 395);

  // Grade badge inside card
  ctx.fillStyle = grade === 'A' ? '#2fd27e' : grade === 'B' ? '#c6ff3d' : '#ffb020';
  ctx.fillRect(860, 365, 90, 42);
  ctx.fillStyle = '#0b0f14';
  ctx.font = 'bold 24px Inter, sans-serif';
  ctx.fillText(`GRADE ${grade}`, 868, 395);

  // Speed Number
  ctx.fillStyle = '#c6ff3d';
  ctx.font = 'bold 150px "Barlow Condensed", sans-serif';
  ctx.fillText(spd, 125, 545);

  ctx.fillStyle = '#e8eef5';
  ctx.font = 'bold 48px "Barlow Condensed", sans-serif';
  ctx.fillText('KM/H', 530, 500);

  ctx.fillStyle = '#8a9ab0';
  ctx.font = '400 28px Inter, sans-serif';
  ctx.fillText(`Uncertainty: ±${sd} km/h`, 130, 620);

  // Metrics Row Cards
  const stats = [
    { label: 'LENGTH ZONE', value: m.lengthZone?.name || 'Good length' },
    { label: 'BOUNCE DISTANCE', value: m.lengthDist != null ? `${m.lengthDist.toFixed(2)} m` : '—' },
    { label: 'BOUNCE HEIGHT', value: m.bounceHeight != null ? `${m.bounceHeight.toFixed(2)} m` : '—' },
    { label: 'SPEED LOSS', value: m.lossPct != null ? `${m.lossPct.toFixed(1)}%` : '—' },
  ];

  stats.forEach((st, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 80 + col * 480;
    const y = 730 + row * 170;

    ctx.fillStyle = '#182231';
    ctx.strokeStyle = '#243146';
    ctx.lineWidth = 1.5;
    ctx.roundRect ? ctx.roundRect(x, y, 440, 140, 16) : ctx.rect(x, y, 440, 140);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#8a9ab0';
    ctx.font = '600 22px "Barlow Condensed", sans-serif';
    ctx.fillText(st.label, x + 30, y + 50);

    ctx.fillStyle = '#e8eef5';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText(st.value, x + 30, y + 105);
  });

  // Footer branding
  ctx.fillStyle = '#8a9ab0';
  ctx.font = '400 22px Inter, sans-serif';
  ctx.fillText('Pure browser computer vision • Side-on calibrated homography', 80, 1260);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      downloadBlob(blob, `seam-speed-${session.bowler || 'delivery'}-card.png`);
      resolve(blob);
    }, 'image/png');
  });
}
