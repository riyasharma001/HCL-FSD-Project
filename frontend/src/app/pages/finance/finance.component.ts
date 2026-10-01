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
import { MatDialogModule } from '@angular/material/dialog';
import { FinanceService } from '../../core/services/finance.service';
import { NotificationService } from '../../core/services/notification.service';
import { Invoice, Payment } from '../../core/models/models';

@Component({
  selector: 'app-finance',
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
    MatDialogModule
  ],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.scss'
})
export class FinanceComponent implements OnInit {
  private financeService = inject(FinanceService);
  private notify = inject(NotificationService);

  loading = signal(false);
  invoices = signal<Invoice[]>([]);

  // Selected Invoice for Payment
  paymentModalOpen = signal(false);
  activeInvoice = signal<Invoice | null>(null);
  paymentAmount: number | null = null;
  paymentMethod = 'UPI';

  // Selected Invoice for History
  historyModalOpen = signal(false);
  historyLoading = signal(false);
  paymentsList = signal<Payment[]>([]);

  // Financial KPIs
  totalInvoiced = computed(() =>
    this.invoices().reduce((sum, inv) => sum + (inv.total || 0), 0)
  );
  totalPaid = computed(() =>
    this.invoices().reduce((sum, inv) => sum + (inv.paid || 0), 0)
  );
  totalOutstanding = computed(() =>
    this.totalInvoiced() - this.totalPaid()
  );
  paidCount = computed(() =>
    this.invoices().filter(inv => inv.status === 'PAID').length
  );

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading.set(true);
    this.financeService.getInvoices().subscribe({
      next: (data) => {
        this.invoices.set(data);
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.notify.error('Failed to load invoices: ' + (e.error?.error || e.message));
      }
    });
  }

  openPaymentModal(invoice: Invoice) {
    this.activeInvoice.set(invoice);
    const balance = invoice.total - invoice.paid;
    this.paymentAmount = Number(balance.toFixed(2));
    this.paymentMethod = 'UPI';
    this.paymentModalOpen.set(true);
  }

  closePaymentModal() {
    this.paymentModalOpen.set(false);
    this.activeInvoice.set(null);
  }

  recordPayment() {
    const inv = this.activeInvoice();
    if (!inv || !this.paymentAmount || this.paymentAmount <= 0) {
      this.notify.error('Please enter a valid positive payment amount');
      return;
    }

    const balance = inv.total - inv.paid;
    if (this.paymentAmount > balance) {
      this.notify.error(`Amount cannot exceed outstanding balance of ₹${balance.toFixed(2)}`);
      return;
    }

    this.loading.set(true);
    this.financeService.payInvoice(inv.id, {
      amount: this.paymentAmount,
      method: this.paymentMethod
    }).subscribe({
      next: (updated) => {
        this.loading.set(false);
        this.notify.success(`Payment of ₹${this.paymentAmount} recorded for ${updated.invoiceNo}`);
        this.closePaymentModal();
        this.loadInvoices();
      },
      error: (e) => {
        this.loading.set(false);
        this.notify.error(e.error?.error || 'Failed to record payment');
      }
    });
  }

  viewPaymentHistory(invoice: Invoice) {
    this.activeInvoice.set(invoice);
    this.historyModalOpen.set(true);
    this.historyLoading.set(true);

    this.financeService.getPayments(invoice.id).subscribe({
      next: (payments) => {
        this.paymentsList.set(payments);
        this.historyLoading.set(false);
      },
      error: (e) => {
        this.historyLoading.set(false);
        this.notify.error(e.error?.error || 'Failed to fetch payment history');
      }
    });
  }

  closeHistoryModal() {
    this.historyModalOpen.set(false);
    this.activeInvoice.set(null);
  }
}
