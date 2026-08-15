export type RoomMateType = 'ROOMMATE' | 'VISITOR';

export type RoomMate = {
  id?: string;
  name: string;
  mobile: string;
  email?: string;
  kyc_done?: boolean;
  createdAt?: string;
  created_at?: string;
  bedNo?: string;
  flatNo?: string;
  roomNo?: string;
  propertyName?: string;
  property_name?: string;
};
