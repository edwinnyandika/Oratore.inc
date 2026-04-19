export enum InvoiceStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  PAID = 'Paid',
  OVERDUE = 'Overdue'
}

export enum ProposalStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  ACCEPTED = 'Accepted',
  DECLINED = 'Declined'
}

export interface TrackingData {
  views: number;
  lastViewedAt?: string;
  emailOpens: number;
  lastOpenedAt?: string;
}

export interface Installment {
  id: string;
  dueDate: string;
  amount: number;
  status: 'Pending' | 'Paid';
}

export interface Testimonial {
  id: string;
  clientName: string;
  content: string;
  rating: number;
  date: string;
}

export interface KRAConfig {
  userPin: string;
  clientPin: string;
  vatCategory: '16%' | '8%' | '0%' | 'Exempt';
}

export type PaperSize = 'a4' | 'letter';
export type InvoiceFont = 'inter' | 'serif' | 'mono' | 'outfit' | 'playfair';
export type RecurringFrequency = 'None' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';

export interface Attachment {
  id: string;
  name: string;
  url: string; 
  type: string;
  size: number;
}

export interface InvoiceDesign {
  id?: string;
  template: 'modern' | 'classic' | 'minimal' | 'community';
  themeColor: string;
  font: InvoiceFont;
  paperSize: PaperSize;
  logoSize: 'sm' | 'md' | 'lg';
  customFooter?: string;
  logo?: string; 
  signature?: string; 
}

export interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  price: number;
  sellerName: string;
  sellerId: string;
  downloads: number;
  rating: number;
  design: InvoiceDesign;
  tags: string[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  defaultRate: number;
  category?: string;
}

export interface InvoiceHistoryEntry {
  id: string;
  date: string;
  action: string;
  user: string;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', label: 'English', native: 'English' },
  { code: 'es-ES', label: 'Spanish', native: 'Español' },
  { code: 'fr-FR', label: 'French', native: 'Français' },
  { code: 'de-DE', label: 'German', native: 'Deutsch' },
  { code: 'sw-KE', label: 'Swahili', native: 'Kiswahili' },
  { code: 'zh-CN', label: 'Chinese', native: '中文' },
  { code: 'ar-SA', label: 'Arabic', native: 'العربية' },
  { code: 'pt-BR', label: 'Portuguese', native: 'Português' }
];

export interface Proposal {
  id: string;
  proposalNumber: string;
  clientId: string;
  clientName: string;
  date: string;
  expiryDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: ProposalStatus;
  notes?: string;
  currency: string;
}

export interface DisputeMessage {
  id: string;
  sender: 'Client' | 'Freelancer';
  message: string;
  timestamp: string;
}

export interface DisputeInfo {
  isDisputed: boolean;
  disputedItemIds: string[];
  reason: string;
  status: 'Open' | 'Resolved';
  thread: DisputeMessage[];
}

export interface RevenueSplit {
  memberId: string;
  memberName: string;
  percentage: number;
  distributedAmount?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientAddress: string;
  projectId?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  status: InvoiceStatus;
  notes?: string;
  currency: string;
  language: string; 
  design?: InvoiceDesign;
  recurring: RecurringFrequency;
  attachments: Attachment[];
  isTaxInvoice?: boolean;
  kraConfig?: KRAConfig;
  createdBy?: string;
  history?: InvoiceHistoryEntry[];
  tracking?: TrackingData;
  password?: string;
  isPasswordProtected?: boolean;
  senderTimezone?: string;
  clientTimezone?: string;
  allowNegotiation?: boolean;
  proposedAmount?: number;
  negotiationStatus?: 'None' | 'Proposed' | 'Accepted' | 'Declined';
  negotiationNote?: string;
  dispute?: DisputeInfo;
  revenueSplits?: RevenueSplit[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
}

export interface AppSettings {
  userName: string;
  email: string;
  avatar?: string;
  theme: 'light' | 'dark';
  defaultCurrency: string;
  defaultLanguage: string;
  companyName?: string;
  companyPin?: string;
  companyAddress?: string;
  numberingFormat: 'SIMPLE' | 'YEAR_SEQ' | 'CLIENT_YEAR_SEQ';
  defaultDesign?: InvoiceDesign;
  testimonials: Testimonial[];
  teamMembers?: TeamMember[];
  balance?: number;
  purchasedTemplateIds?: string[];
  timezone?: string;
}

export type ViewState = 'DASHBOARD' | 'INVOICES' | 'PROPOSALS' | 'SERVICES' | 'CREATE_INVOICE' | 'PAYMENTS' | 'CLIENTS' | 'PROJECTS' | 'EXPENSES' | 'REPORTS' | 'SETTINGS' | 'TAX_CALCULATOR' | 'BUSINESS_CARD' | 'MARKETPLACE' | 'CLIENT_VIEW' | 'CLIENT_PORTAL' | 'HELP_CENTER' | 'LANDING' | 'AUTH' | 'PROFILE';

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR - Euro' },
  { code: 'KES', symbol: 'KSh', label: 'KES - Kenyan Shilling' },
  { code: 'GBP', symbol: '£', label: 'GBP - British Pound' },
  { code: 'NGN', symbol: '₦', label: 'NGN - Nigerian Naira' },
  { code: 'ZAR', symbol: 'R', label: 'ZAR - South African Rand' }
];

export interface DashboardStats {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  totalInvoices: number;
}

export interface ClientActivity {
  id: string;
  type: 'INVOICE_SENT' | 'PAYMENT_RECEIVED' | 'NOTE';
  date: string;
  description: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  tags: string[];
  activity: ClientActivity[];
  status: 'Active' | 'Inactive';
  paymentTerms?: string;
  notes?: string;
  pin?: string;
  defaultLanguage?: string;
  timezone?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'Software' | 'Travel' | 'Office' | 'Subcontractor' | 'Other';
  date: string;
  projectId?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  status: 'Active' | 'Completed' | 'On Hold';
  budget: number;
  deadline: string;
  tasks: any[];
  tags?: string[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  clientName: string;
  amount: number;
  date: string;
  method: 'Bank Transfer' | 'M-Pesa' | 'PayPal' | 'Credit Card' | 'Cash';
  reference?: string;
  status: 'Completed' | 'Pending';
  distribution?: { memberName: string, amount: number }[];
}

export interface PaymentSettings {
  mpesaConsumerKey?: string;
  mpesaConsumerSecret?: string;
  mpesaShortCode?: string;
  mpesaPasskey?: string;
  paypalClientId?: string;
  paystackPublicKey?: string;
}