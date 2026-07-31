export type UploadContactLeadPayload = {
  name: string;
  email?: string;
  phone: string;
  location: string;
  city?: string | number;
  otp: number;
  source?: string;
  referrer?: string;
  srp?: boolean;
  propertyName?: string;
  utm_source?: string;
  utm_url?: string;
};
