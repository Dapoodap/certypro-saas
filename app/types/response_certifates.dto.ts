// types/certificate.ts

export interface Certificate {
  id: string;
  name: string;
  fileUrl: string;
  participant : number;
  userId: string;
  createdAt: string; // ISO 8601 string, bisa dikonversi ke Date jika perlu
}
