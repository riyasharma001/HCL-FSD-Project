export interface Customer {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Product {
  id?: number;
  code: string;
  name: string;
  price: number;
}

export interface Material {
  id?: number;
  code: string;
  name: string;
  unitCost: number;
  stock: number;
  supplier?: string;
}

export interface BomItem {
  id?: number;
  product: Product;
  material: Material;
  qtyPerUnit: number;
}

export interface BomRequest {
  productId: number;
  materialId: number;
  qtyPerUnit: number;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderRequest {
  customerId: number;
  items: OrderItemRequest[];
}

export interface SalesOrder {
  id: number;
  orderNo: string;
  customer: Customer;
  orderDate: string;
  status: 'NEW' | 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | string;
  total: number;
}

export interface OrderItem {
  id: number;
  salesOrder?: SalesOrder;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface BomRequirement {
  materialId: number;
  code: string;
  name: string;
  required: number;
  inStock: number;
  shortage: number;
}

export interface PurchaseOrder {
  id: number;
  poNo: string;
  material: Material;
  quantity: number;
  total: number;
  status: 'ORDERED' | 'RECEIVED' | string;
  createdDate: string;
  salesOrderId?: number;
}

export interface Invoice {
  id: number;
  invoiceNo: string;
  salesOrder: SalesOrder;
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | string;
  invoiceDate: string;
}

export interface Payment {
  id: number;
  invoice?: Invoice;
  amount: number;
  method: string;
  paidOn: string;
}

export interface PaymentRequest {
  amount: number;
  method: string;
}

export interface LoginResponse {
  token?: string;
  username?: string;
  fullName?: string;
  role?: string;
  message?: string;
  error?: string;
}
