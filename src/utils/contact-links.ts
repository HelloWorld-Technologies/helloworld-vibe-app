import { Linking, Platform } from 'react-native';

export function openPhoneCall(mobile: string) {
  const digits = mobile.replace(/\D/g, '');
  if (!digits) return;
  const url = Platform.OS === 'android' ? `tel:${digits}` : `telprompt:${digits}`;
  void Linking.openURL(url);
}

export function toWhatsAppPhone(mobile?: string | null) {
  const digits = (mobile ?? '').replace(/\D/g, '');
  if (!digits) return '';

  let phone = digits;
  if (phone.startsWith('0') && phone.length === 11) {
    phone = phone.slice(1);
  }
  if (phone.length === 10) {
    return `91${phone}`;
  }
  if (phone.startsWith('91') && phone.length === 12) {
    return phone;
  }
  if (phone.length >= 10) {
    return phone.slice(-12);
  }
  return '';
}

export function openWhatsApp(mobile: string, message?: string) {
  const phone = toWhatsAppPhone(mobile);
  if (!phone) return;
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  void Linking.openURL(`https://wa.me/${phone}${text}`);
}
