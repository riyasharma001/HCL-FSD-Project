import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MasterService } from '../../core/services/master.service';
import { NotificationService } from '../../core/services/notification.service';
import { Customer, Product, Material, BomItem } from '../../core/models/models';

@Component({
  selector: 'app-masters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './masters.component.html',
  styleUrl: './masters.component.scss'
})
export class MastersComponent implements OnInit {
  private masterService = inject(MasterService);
  private notify = inject(NotificationService);

  loading = signal(false);

  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);
  materials = signal<Material[]>([]);
  boms = signal<BomItem[]>([]);

  // Form Models
  newCustomer: Partial<Customer> = { name: '', email: '', phone: '', address: '' };
  newProduct: Partial<Product> = { code: '', name: '', price: undefined };
  newMaterial: Partial<Material> = { code: '', name: '', unitCost: undefined, stock: 0, supplier: '' };
  newBom = { productId: null as number | null, materialId: null as number | null, qtyPerUnit: 1 };

  // Filter Search
  searchQuery = signal('');

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    Promise.all([
      this.masterService.getCustomers().toPromise(),
      this.masterService.getProducts().toPromise(),
      this.masterService.getMaterials().toPromise(),
      this.masterService.getBoms().toPromise()
    ]).then(([custs, prods, mats, boms]) => {
      this.customers.set(custs || []);
      this.products.set(prods || []);
      this.materials.set(mats || []);
      this.boms.set(boms || []);
      this.loading.set(false);
    }).catch(err => {
      this.loading.set(false);
      this.notify.error('Failed to load master data: ' + (err.error?.error || err.message));
    });
  }

  addCustomer() {
    if (!this.newCustomer.name?.trim()) {
      this.notify.error('Customer name is required');
      return;
    }
    this.masterService.addCustomer(this.newCustomer as Customer).subscribe({
      next: (c) => {
        this.notify.success(`Customer "${c.name}" added successfully`);
        this.newCustomer = { name: '', email: '', phone: '', address: '' };
        this.loadAll();
      },
      error: (e) => this.notify.error(e.error?.error || 'Failed to add customer')
    });
  }

  deleteCustomer(customer: Customer) {
    if (!customer.id) return;
    const confirmed = confirm(`Are you sure you want to delete customer "${customer.name}"?`);
    if (!confirmed) return;

    this.masterService.deleteCustomer(customer.id).subscribe({
      next: () => {
        this.notify.success(`Customer "${customer.name}" deleted successfully`);
        this.loadAll();
      },
      error: (e) => this.notify.error(e.error?.error || 'Failed to delete customer')
    });
  }

  addProduct() {
    if (!this.newProduct.code?.trim() || !this.newProduct.name?.trim() || !this.newProduct.price) {
      this.notify.error('Product code, name, and valid price are required');
      return;
    }
    this.masterService.addProduct(this.newProduct as Product).subscribe({
      next: (p) => {
        this.notify.success(`Product "${p.name}" added`);
        this.newProduct = { code: '', name: '', price: undefined };
        this.loadAll();
      },
      error: (e) => this.notify.error(e.error?.error || 'Failed to add product')
    });
  }

  addMaterial() {
    if (!this.newMaterial.code?.trim() || !this.newMaterial.name?.trim() || this.newMaterial.unitCost === undefined) {
      this.notify.error('Material code, name, and unit cost are required');
      return;
    }
    this.masterService.addMaterial(this.newMaterial as Material).subscribe({
      next: (m) => {
        this.notify.success(`Raw material "${m.name}" added`);
        this.newMaterial = { code: '', name: '', unitCost: undefined, stock: 0, supplier: '' };
        this.loadAll();
      },
      error: (e) => this.notify.error(e.error?.error || 'Failed to add material')
    });
  }

  addBom() {
    if (!this.newBom.productId || !this.newBom.materialId || !this.newBom.qtyPerUnit || this.newBom.qtyPerUnit <= 0) {
      this.notify.error('Select product, material, and enter valid quantity per unit');
      return;
    }
    this.masterService.addBom({
      productId: this.newBom.productId,
      materialId: this.newBom.materialId,
      qtyPerUnit: this.newBom.qtyPerUnit
    }).subscribe({
      next: () => {
        this.notify.success('BOM entry created successfully');
        this.newBom = { productId: null, materialId: null, qtyPerUnit: 1 };
        this.loadAll();
      },
      error: (e) => this.notify.error(e.error?.error || 'Failed to add BOM entry')
    });
  }
}
