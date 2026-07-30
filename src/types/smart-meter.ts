export type SmartMeterRoom = {
  id: string;
  name: string;
  physical_id?: string;
  cpu: number;
  cpdu: number;
  mnb: number;
  meb: number;
  balance: number;
  blocked: boolean;
  devices: unknown[];
  minRecharge: number;
  devicesStatus: unknown[];
  currentBalance: number;
};

export type SmartMeterRechargeRecord = {
  id: number;
  amount: string;
  balance_before: string;
  balance_after: string | null;
  status: string;
  recharge_source: string | null;
};

export type SmartMeterConsumptionDeduction = {
  roomName: string;
  startTime: string;
  endTime: string;
  amount: number;
  units: number;
  type: string;
  source: string;
  deductionTime: string;
  note?: string;
  userMessage?: string;
  aliste_room_id?: string;
};
