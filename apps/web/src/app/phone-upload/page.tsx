'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function PhoneUploadPage() {
  const token = useSearchParams().get('token');
  const [done, setDone] = useState(false);

  async function upload() {
    if (!token) return;
    const presign = await fetch(`/api/phone-upload/presign?token=${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: 'deck.pdf', mime: 'application/pdf' }) });
    const p = await presign.json();
    await fetch(`/api/phone-upload/commit?token=${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files: [{ originalName: 'deck.pdf', storedKey: p.storageKey, size: 1200, mime: 'application/pdf', ext: 'pdf' }] }) });
    setDone(true);
  }

  return <main style={{ padding: 24 }}><h1>Phone upload</h1><button className="btn btn-primary" onClick={upload}>Upload</button>{done && <p>Готово</p>}</main>;
}
