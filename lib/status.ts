// lib/status.ts

type TrashStatus = {
  isFull: boolean;
  distance: number | null;
};

let latestStatus: TrashStatus = { isFull: false, distance: null };

export function getLatestStatus(): TrashStatus {
  return latestStatus;
}

export function setLatestStatus(status: TrashStatus): void {
  latestStatus = status;
  console.log('Trash status updated:', latestStatus);
}
