'use client';

import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { addOfflinePacket, listOfflinePackets, removeOfflinePacket } from '../../lib/offline-queue';

export default function KioskPage() {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<'RU' | 'EN'>('RU');
  const [uploadId, setUploadId] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [online, setOnline] = useState(true);
  const [hiddenTap, setHiddenTap] = useState(0);
  const [showVolunteer, setShowVolunteer] = useState(false);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    setOnline(navigator.onLine);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const phoneLink = useMemo(() => `${window.location.origin}/phone-upload?token=${token}`, [token]);

  async function initUpload() {
    const res = await fetch('/api/uploads/init', { method: 'POST', body: JSON.stringify({ mode: 'CODE', sessionCode: 'AI7421', terminalId: 'demo-terminal', conferenceId: 'demo-conference' }), headers: { 'Content-Type': 'application/json' } });
    const data = await res.json();
    setUploadId(data.uploadId);
    setToken(data.oneTimeToken.token);
    setStep(3);
  }

  function acceptOffline() {
    const id = crypto.randomUUID();
    addOfflinePacket({ id, uploadId: uploadId || 'offline', files: [{ name: 'local.pptx', size: 1000, type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }], createdAt: Date.now() });
    alert(`Локально принято. localReceiptId: ${id}`);
  }

  return (
    <main style={{ padding: 24 }}>
      <div className="card" onClick={() => { const n = hiddenTap + 1; setHiddenTap(n); if (n >= 5) setShowVolunteer(true); }}>
        <h1>Conference Talk Upload Terminal</h1>
        <button className="btn" onClick={() => setLang(lang === 'RU' ? 'EN' : 'RU')}>{lang}</button>
      </div>
      {step === 0 && <div className="card"><button className="btn btn-primary" onClick={() => setStep(1)}>Сдать доклад</button></div>}
      {step === 1 && <div className="card"><button className="btn btn-primary" onClick={initUpload}>Ввести код</button></div>}
      {step === 3 && (
        <div className="card">
          <h3>Загрузка с телефона</h3>
          {token && <QRCodeSVG value={phoneLink} />}
          <p>{phoneLink}</p>
          {!online && <button className="btn" onClick={acceptOffline}>Принять локально (offline)</button>}
          <button className="btn btn-primary" onClick={() => setStep(5)}>Проверка завершена</button>
        </div>
      )}
      {step === 5 && <div className="card"><h3>Успех</h3><p>Номер заявки: {uploadId}</p><QRCodeSVG value={`receipt:${uploadId}`} /></div>}
      {showVolunteer && (
        <div className="card">
          <h3>Offline Queue</h3>
          {listOfflinePackets().map((p) => <div key={p.id}><span>{p.id}</span> <button className="btn" onClick={() => removeOfflinePacket(p.id)}>remove</button></div>)}
        </div>
      )}
    </main>
  );
}
