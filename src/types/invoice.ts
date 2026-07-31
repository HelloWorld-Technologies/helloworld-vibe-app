export type TenantInvoice = {
  invoice_id: string;
  invoice_number?: string;
  title?: string;
  description?: string;
  total?: number;
  balance?: number;
  status?: string;
  due_date?: string;
  paid_date?: string;
  customer_id?: string;
  invoice_url?: string;
  [key: string]: unknown;
};

export type InvoiceLineItemTax = {
  tax_id?: string;
  tax_name?: string;
  tax_amount?: number;
  tax_percentage?: number;
  [key: string]: unknown;
};

export type InvoiceLineItem = {
  line_item_id?: string;
  item_id?: string;
  name?: string;
  description?: string;
  quantity?: number;
  rate?: number;
  item_total?: number;
  tax_name?: string;
  tax_percentage?: number;
  tax_amount?: number;
  line_item_taxes?: InvoiceLineItemTax[];
  [key: string]: unknown;
};

export type InvoiceDetails = {
  invoice_id: string;
  invoice_number?: string | null;
  invoice_url?: string | null;
  status?: string | null;
  date?: string | null;
  due_date?: string | null;
  created_time?: string | null;
  last_modified_time?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  reference_number?: string | null;
  payment_terms?: number | null;
  payment_terms_label?: string | null;
  currency_code?: string | null;
  sub_total?: number | null;
  tax_total?: number | null;
  total?: number | null;
  payment_made?: number | null;
  credits_applied?: number | null;
  balance?: number | null;
  notes?: string | null;
  terms?: string | null;
  line_items: InvoiceLineItem[];
  /** Invoice-level tax breakdown (Zoho `taxes`). */
  taxes?: InvoiceLineItemTax[];
  /** Alternate root-level tax breakdown some APIs return. */
  line_item_taxes?: InvoiceLineItemTax[];
};

export type InvoiceDetailsResponse = {
  success: boolean;
  data?: InvoiceDetails;
  message?: string;
  status?: number;
};

export type InvoiceCreditsInfo = {
  referral?: number;
  rewards?: number;
};

export type InvoiceCreditsResponse = {
  success: boolean;
  data?: InvoiceCreditsInfo;
  message?: string;
  error?: string;
  info?: string;
};

export type AvailCreditsPayload = {
  invoiceId: string;
  bookingId: string;
  type: 'referral' | 'rewards';
  amount: number;
};

export type AvailCreditsResponse = {
  success: boolean;
  message?: string;
  error?: string;
  info?: string;
  data?: {
    balance?: number;
    invoice?: InvoiceDetails;
  };
};
