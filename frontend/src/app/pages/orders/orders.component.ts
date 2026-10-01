import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { OrderService } from '../../core/services/order.service';
import { MasterService } from '../../core/services/master.service';
import { NotificationService } from '../../core/services/notification.service';
import { SalesOrder, Customer, Product, OrderItem, BomRequirement } from '../../core/models/models';

interface CartItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private masterService = inject(MasterService);
  private notify = inject(NotificationService);

  loading = signal(false);
  detailLoading = signal(false);

  orders = signal<SalesOrder[]>([]);
  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);

  // Create Order State
  selectedCustomerId: number | null = null;
  selectedProductId: number | null = null;
  itemQuantity = 1;
  cart = signal<CartItem[]>([]);

  // Details State
  activeOrderId = signal<number | null>(null);
  activeOrder = signal<SalesOrder | null>(null);
  activeOrderItems = signal<OrderItem[]>([]);
  activeOrderBom = signal<BomRequirement[]>([]);
  activeDetailType = signal<'items' | 'bom' | null>(null);

  // Cart total
  cartTotal = computed(() =>
    this.cart().reduce((sum, item) => sum + item.lineTotal, 0)
  );

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.loading.set(true);
    Promise.all([
      this.orderService.getOrders().toPromise(),
      this.masterService.getCustomers().toPromise(),
      this.masterService.getProducts().toPromise()
    ]).then(([ords, custs, prods]) => {
      this.orders.set(ords || []);
      this.customers.set(custs || []);
      this.products.set(prods || []);
      this.loading.set(false);
    }).catch(err => {
      this.loading.set(false);
      this.notify.error('Failed to load orders: ' + (err.error?.error || err.message));
    });
  }

  refreshOrders() {
    this.loading.set(true);
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.notify.error(e.error?.error || 'Failed to refresh orders');
      }
    });
  }

  // Cart Management
  addToCart() {
    if (!this.selectedProductId || this.itemQuantity <= 0) {
      this.notify.error('Please select a product and valid quantity');
      return;
    }

    const prod = this.products().find(p => p.id === this.selectedProductId);
    if (!prod) return;

    const existingIndex = this.cart().findIndex(i => i.productId === prod.id);
    if (existingIndex > -1) {
      const updated = [...this.cart()];
      updated[existingIndex].quantity += this.itemQuantity;
      updated[existingIndex].lineTotal = updated[existingIndex].quantity * prod.price;
      this.cart.set(updated);
    } else {
      const item: CartItem = {
        productId: prod.id!,
        productName: prod.name,
        unitPrice: prod.price,
        quantity: this.itemQuantity,
        lineTotal: prod.price * this.itemQuantity
      };
      this.cart.set([...this.cart(), item]);
    }

    this.selectedProductId = null;
    this.itemQuantity = 1;
  }

  removeFromCart(index: number) {
    const updated = [...this.cart()];
    updated.splice(index, 1);
    this.cart.set(updated);
  }

  placeOrder() {
    if (!this.selectedCustomerId) {
      this.notify.error('Please select a customer for this order');
      return;
    }
    if (this.cart().length === 0) {
      this.notify.error('Cart is empty. Add at least one item.');
      return;
    }

    const req = {
      customerId: this.selectedCustomerId,
      items: this.cart().map(i => ({ productId: i.productId, quantity: i.quantity }))
    };

    this.loading.set(true);
    this.orderService.createOrder(req).subscribe({
      next: (order) => {
        this.loading.set(false);
        this.notify.success(`Order #${order.orderNo} created successfully!`);
        this.cart.set([]);
        this.selectedCustomerId = null;
        this.refreshOrders();
      },
      error: (e) => {
        this.loading.set(false);
        this.notify.error(e.error?.error || 'Failed to place order');
      }
    });
  }

  // Order Details: Items & BOM
  showOrderItems(order: SalesOrder) {
    this.activeOrderId.set(order.id);
    this.activeOrder.set(order);
    this.activeDetailType.set('items');
    this.detailLoading.set(true);

    this.orderService.getOrderItems(order.id).subscribe({
      next: (items) => {
        this.activeOrderItems.set(items);
        this.detailLoading.set(false);
      },
      error: (e) => {
        this.detailLoading.set(false);
        this.notify.error(e.error?.error || 'Failed to load order items');
      }
    });
  }

  showOrderBom(order: SalesOrder) {
    this.activeOrderId.set(order.id);
    this.activeOrder.set(order);
    this.activeDetailType.set('bom');
    this.detailLoading.set(true);

    this.orderService.getOrderBom(order.id).subscribe({
      next: (bom) => {
        this.activeOrderBom.set(bom);
        this.detailLoading.set(false);
      },
      error: (e) => {
        this.detailLoading.set(false);
        this.notify.error(e.error?.error || 'Failed to calculate BOM');
      }
    });
  }

  closeDetails() {
    this.activeDetailType.set(null);
    this.activeOrderId.set(null);
    this.activeOrder.set(null);
  }

  // Lifecycle Actions
  createPurchaseOrders(orderId: number) {
    this.loading.set(true);
    this.orderService.createPurchaseOrders(orderId).subscribe({
      next: (pos) => {
        this.loading.set(false);
        this.notify.success(`Generated ${pos.length} purchase order(s) for raw material shortages!`);
        if (this.activeDetailType() === 'bom') {
          this.showOrderBom(this.activeOrder()!);
        }
        this.refreshOrders();
      },
      error: (e) => {
        this.loading.set(false);
        this.notify.error(e.error?.error || 'Failed to generate purchase orders');
      }
    });
  }

  confirmOrder(orderId: number) {
    this.loading.set(true);
    this.orderService.confirmOrder(orderId).subscribe({
      next: (o) => {
        this.loading.set(false);
        this.notify.success(`Order #${o.orderNo} confirmed! Materials deducted from stock.`);
        this.refreshOrders();
        if (this.activeOrderId() === orderId) {
          this.activeOrder.set(o);
        }
      },
      error: (e) => {
        this.loading.set(false);
        this.notify.error(e.error?.error || 'Cannot confirm order');
      }
    });
  }

  advanceOrder(orderId: number) {
    this.loading.set(true);
    this.orderService.advanceOrder(orderId).subscribe({
      next: (o) => {
        this.loading.set(false);
        this.notify.success(`Order #${o.orderNo} advanced to ${o.status}`);
        this.refreshOrders();
        if (this.activeOrderId() === orderId) {
          this.activeOrder.set(o);
        }
      },
      error: (e) => {
        this.loading.set(false);
        this.notify.error(e.error?.error || 'Cannot advance order');
      }
    });
  }

  cancelOrder(orderId: number) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    this.loading.set(true);
    this.orderService.cancelOrder(orderId).subscribe({
      next: (o) => {
        this.loading.set(false);
        this.notify.success(`Order #${o.orderNo} cancelled.`);
        this.refreshOrders();
        if (this.activeOrderId() === orderId) {
          this.activeOrder.set(o);
        }
      },
      error: (e) => {
        this.loading.set(false);
        this.notify.error(e.error?.error || 'Cannot cancel order');
      }
    });
  }

  createInvoice(orderId: number) {
    this.loading.set(true);
    this.orderService.createInvoice(orderId).subscribe({
      next: (inv) => {
        this.loading.set(false);
        this.notify.success(`Invoice #${inv.invoiceNo} generated for order!`);
        this.refreshOrders();
      },
      error: (e) => {
        this.loading.set(false);
        this.notify.error(e.error?.error || 'Failed to create invoice');
      }
    });
  }
}
