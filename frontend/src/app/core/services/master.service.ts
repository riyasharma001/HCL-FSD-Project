import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, Product, Material, BomItem, BomRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class MasterService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api';

  // Customers
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}/customers`);
  }

  addCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}/customers`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/customers/${id}`);
  }

  // Products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, product);
  }

  // Materials
  getMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.baseUrl}/materials`);
  }

  addMaterial(material: Material): Observable<Material> {
    return this.http.post<Material>(`${this.baseUrl}/materials`, material);
  }

  // BOM
  getBoms(): Observable<BomItem[]> {
    return this.http.get<BomItem[]>(`${this.baseUrl}/bom`);
  }

  addBom(bom: BomRequest): Observable<BomItem> {
    return this.http.post<BomItem>(`${this.baseUrl}/bom`, bom);
  }
}
