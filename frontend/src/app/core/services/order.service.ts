import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalesOrder, OrderItem, BomRequirement, PurchaseOrder, Invoice, OrderRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api';

  getOrders(): Observable<SalesOrder[]> {
    return this.http.get<SalesOrder[]>(`${this.baseUrl}/orders`);
  }

  createOrder(order: OrderRequest): Observable<SalesOrder> {
    return this.http.post<SalesOrder>(`${this.baseUrl}/orders`, order);
  }

  getOrderItems(orderId: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.baseUrl}/orders/${orderId}/items`);
  }

  getOrderBom(orderId: number): Observable<BomRequirement[]> {
    return this.http.get<BomRequirement[]>(`${this.baseUrl}/orders/${orderId}/bom`);
  }

  createPurchaseOrders(orderId: number): Observable<PurchaseOrder[]> {
    return this.http.post<PurchaseOrder[]>(`${this.baseUrl}/orders/${orderId}/purchase-orders`, {});
  }

  confirmOrder(orderId: number): Observable<SalesOrder> {
    return this.http.post<SalesOrder>(`${this.baseUrl}/orders/${orderId}/confirm`, {});
  }

  advanceOrder(orderId: number): Observable<SalesOrder> {
    return this.http.post<SalesOrder>(`${this.baseUrl}/orders/${orderId}/advance`, {});
  }

  cancelOrder(orderId: number): Observable<SalesOrder> {
    return this.http.post<SalesOrder>(`${this.baseUrl}/orders/${orderId}/cancel`, {});
  }

  createInvoice(orderId: number): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.baseUrl}/orders/${orderId}/invoice`, {});
  }
}
