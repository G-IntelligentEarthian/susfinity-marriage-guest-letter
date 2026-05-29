export type Step = 'envelope' | 'letter' | 'camera' | 'preview' | 'thanks';

export interface LetterDraft {
  guestName: string;
  guestMessage: string;
  isHandwritten: boolean;
  handwritingDataUrl: string | null; // stores Base64 drawing
  photoBlob: Blob | null;             // captured selfie raw blob
  photoDataUrl: string | null;        // preview URL of selfie
  timestamp: string;
}

export interface GuestNote {
  id?: string;
  guest_name: string | null;
  message: string;
  is_handwritten: boolean;
  photo_url: string;
  created_at?: string;
  device_info?: string;
}
