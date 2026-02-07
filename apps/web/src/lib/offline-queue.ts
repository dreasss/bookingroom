export type OfflinePacket = {
  id: string;
  uploadId: string;
  files: Array<{ name: string; size: number; type: string }>;
  createdAt: number;
};

const KEY = 'kiosk-offline-packets';

export function listOfflinePackets(): OfflinePacket[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function addOfflinePacket(packet: OfflinePacket) {
  const list = listOfflinePackets();
  list.push(packet);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function removeOfflinePacket(id: string) {
  const next = listOfflinePackets().filter((i) => i.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
}
