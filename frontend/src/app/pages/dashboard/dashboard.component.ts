import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { OrderService } from '../../core/services/order.service';
import { MasterService } from '../../core/services/master.service';
import { ProcurementService } from '../../core/services/procurement.service';
import { FinanceService } from '../../core/services/finance.service';
import { SalesOrder, Material, Invoice, PurchaseOrder } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private orderService = inject(OrderService);
  private masterService = inject(MasterService);
  private procurementService = inject(ProcurementService);
  private financeService = inject(FinanceService);

  loading = signal(false);

  orders = signal<SalesOrder[]>([]);
  materials = signal<Material[]>([]);
  invoices = signal<Invoice[]>([]);
  purchaseOrders = signal<PurchaseOrder[]>([]);

  // Computed Metrics
  totalRevenue = computed(() =>
    this.invoices().reduce((acc, inv) => acc + (inv.paid || 0), 0)
  );
  totalOrdersCount = computed(() => this.orders().length);
  pendingOrdersCount = computed(() =>
    this.orders().filter(o => o.status === 'NEW').length
  );
  activeFulfillmentCount = computed(() =>
    this.orders().filter(o => o.status === 'CONFIRMED' || o.status === 'SHIPPED').length
  );
  completedOrdersCount = computed(() =>
    this.orders().filter(o => o.status === 'COMPLETED').length
  );
  pendingProcurementCount = computed(() =>
    this.purchaseOrders().filter(p => p.status === 'ORDERED').length
  );
  unpaidInvoicesTotal = computed(() =>
    this.invoices().reduce((acc, inv) => acc + (inv.total - inv.paid), 0)
  );
  lowStockMaterials = computed(() =>
    this.materials().filter(m => m.stock < 25)
  );

  // Recent 5 orders
  recentOrders = computed(() =>
    this.orders().slice(0, 5)
  );

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading.set(true);
    Promise.all([
      this.orderService.getOrders().toPromise(),
      this.masterService.getMaterials().toPromise(),
      this.financeService.getInvoices().toPromise(),
      this.procurementService.getPurchaseOrders().toPromise()
    ]).then(([ords, mats, invs, pos]) => {
      this.orders.set(ords || []);
      this.materials.set(mats || []);
      this.invoices.set(invs || []);
      this.purchaseOrders.set(pos || []);
      this.loading.set(false);
    }).catch(() => {
      this.loading.set(false);
    });
  }
}
