// lib/arduino.ts

type TrashStatus = {
  isFull: boolean;
  distance: number | null;
};

let latestStatus: TrashStatus = { isFull: false, distance: null };
let serialAvailable = false;

// Initialize serial connection at module load time (server-side only)
if (typeof window === 'undefined') {
  (async () => {
    try {
      const { SerialPort } = await import('serialport');
      const { ReadlineParser } = await import('@serialport/parser-readline');

      const port = new SerialPort({
        path: 'COM3',
        baudRate: 9600,
      });

      const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

      parser.on('data', (line: string) => {
        console.log('Arduino data received:', line);
        const [status, distStr] = line.trim().split(',');
        const distance = parseInt(distStr, 10);

        latestStatus = {
          isFull: status === 'FULL',
          distance: Number.isNaN(distance) ? null : distance,
        };
        console.log('Trash status updated:', latestStatus);
      });

      port.on('error', (err: Error) => {
        console.error('Serial port error:', err.message);
      });

      port.on('open', () => {
        console.log('✓ Serial port connected on COM3');
        serialAvailable = true;
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('⚠ Arduino not available:', errMsg);
      console.warn('Trash status will remain at default state. Check if Arduino is connected to COM3.');
    }
  })();
}

export function getLatestStatus(): TrashStatus {
  return latestStatus;
}
