export type OrderIntentStatus = 'WHATSAPP_HANDOFF_READY' | 'WHATSAPP_OPENED';
export type DeliveryFeeStatus = 'KNOWN' | 'TO_BE_CONFIRMED';

export interface OwnerOrderItem {
  name: string;
  variant: string | null;
  quantity: number;
  unitPrice: number | string;
  lineTotal: number | string;
}

export interface OwnerOrderIntent {
  id: string;
  reference: string;
  status: OrderIntentStatus;
  customerName: string;
  customerPhone: string;
  deliveryArea: string;
  landmark: string;
  directions: string | null;
  mapLat?: number | null;
  mapLng?: number | null;
  subtotal: number | string;
  deliveryFee: number | string | null;
  deliveryFeeStatus: DeliveryFeeStatus;
  items: OwnerOrderItem[];
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
  whatsappOpenedAt: string | null;
  notConfirmed: boolean;
}

export interface OrderIntentsPaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface OrderIntentsResponse {
  data: OwnerOrderIntent[];
  meta: OrderIntentsPaginationMeta;
}

export interface TopRequestedItem {
  name: string;
  requestedQuantity: number;
}

export interface OwnerStats {
  range: '7d' | '30d';
  requestsCreated: number;
  whatsappOpened: number;
  whatsappOpenRate: number;
  topItems: TopRequestedItem[];
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  q?: string;
  status?: OrderIntentStatus | 'ALL';
}
