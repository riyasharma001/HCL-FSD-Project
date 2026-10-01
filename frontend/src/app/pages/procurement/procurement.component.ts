import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProcurementService } from '../../core/services/procurement.service';
import { NotificationService } from '../../core/services/notification.service';
import { PurchaseOrder } from '../../core/models/models';

@Component({
  selector: 'app-procurement',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './procurement.component.html',
  styleUrl: './procurement.component.scss'
})
export class ProcurementComponent implements OnInit {
  private procurementService = inject(ProcurementService);
  private notify = inject(NotificationService);

  loading = signal(false);
  purchaseOrders = signal<PurchaseOrder[]>([]);

  // Statistics
  totalOrders = computed(() => this.purchaseOrders().length);
  pendingOrders = computed(() => this.purchaseOrders().filter(p => p.status === 'ORDERED').length);
  receivedOrders = computed(() => this.purchaseOrders().filter(p => p.status === 'RECEIVED').length);
  totalProcurementCost = computed(() =>
    this.purchaseOrders().reduce((acc, p) => acc + (p.total || 0), 0)
  );

  ngOnInit() {
    this.loadPOs();
  }

  loadPOs() {
    this.loading.set(true);
    this.procurementService.getPurchaseOrders().subscribe({
      next: (data) => {
        this.purchaseOrders.set(data);
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.notify.error('Failed to load purchase orders: ' + (e.error?.error || e.message));
      }
    });
  }

  receivePo(po: PurchaseOrder) {
    this.loading.set(true);
    this.procurementService.receivePurchaseOrder(po.id).subscribe({
      next: (updated) => {
        this.loading.set(false);
        this.notify.success(`PO #${updated.poNo} received! ${updated.quantity} units of ${updated.material.name} added to stock.`);
        this.loadPOs();
      },
      error: (e) => {
        this.loading.set(false);
        this.notify.error(e.error?.error || 'Failed to receive purchase order');
      }
    });
  }
}
