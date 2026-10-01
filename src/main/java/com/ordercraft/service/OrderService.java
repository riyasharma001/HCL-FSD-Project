package com.ordercraft.service;

import com.ordercraft.model.*;
import com.ordercraft.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {

    public static class ItemReq {
        public Long productId;
        public int quantity;
    }

    public static class Requirement {
        public Long materialId;
        public String code;
        public String name;
        public int required;
        public int inStock;
        public int shortage;

        public Requirement(Long materialId, String code, String name,
                           int required, int inStock, int shortage) {
            this.materialId = materialId;
            this.code = code;
            this.name = name;
            this.required = required;
            this.inStock = inStock;
            this.shortage = shortage;
        }
    }

    private static final BigDecimal TAX_RATE = new BigDecimal("0.18");
    private static final Map<String, String> NEXT = new HashMap<>();
    static {
        NEXT.put("CONFIRMED", "SHIPPED");
        NEXT.put("SHIPPED", "COMPLETED");
    }

    private final CustomerRepository customers;
    private final ProductRepository products;
    private final MaterialRepository materials;
    private final BomItemRepository boms;
    private final SalesOrderRepository orders;
    private final OrderItemRepository items;
    private final PurchaseOrderRepository pos;
    private final InvoiceRepository invoices;
    private final PaymentRepository payments;

    public OrderService(CustomerRepository customers, ProductRepository products,
                        MaterialRepository materials, BomItemRepository boms,
                        SalesOrderRepository orders, OrderItemRepository items,
                        PurchaseOrderRepository pos, InvoiceRepository invoices,
                        PaymentRepository payments) {
        this.customers = customers;
        this.products = products;
        this.materials = materials;
        this.boms = boms;
        this.orders = orders;
        this.items = items;
        this.pos = pos;
        this.invoices = invoices;
        this.payments = payments;
    }

    private IllegalArgumentException bad(String m) {
        return new IllegalArgumentException(m);
    }

    public SalesOrder getOrder(Long id) {
        return orders.findById(id).orElseThrow(() -> bad("Order not found: " + id));
    }

    // ---------- 1. Order processing ----------
    @Transactional
    public SalesOrder createOrder(Long customerId, List<ItemReq> reqs) {
        if (reqs == null || reqs.isEmpty()) throw bad("Order needs at least one item");
        if (customerId == null) throw bad("Select a customer");
        Customer c = customers.findById(customerId)
                .orElseThrow(() -> bad("Customer not found"));

        SalesOrder o = new SalesOrder();
        o.customer = c;
        o.orderDate = LocalDate.now();
        o.status = "NEW";
        o.total = BigDecimal.ZERO;
        o = orders.save(o);
        o.orderNo = String.format("SO-%05d", o.id);

        BigDecimal total = BigDecimal.ZERO;
        for (ItemReq r : reqs) {
            if (r.quantity <= 0) throw bad("Quantity must be greater than zero");
            Product p = products.findById(r.productId)
                    .orElseThrow(() -> bad("Product not found"));
            OrderItem it = new OrderItem();
            it.salesOrder = o;
            it.product = p;
            it.quantity = r.quantity;
            it.unitPrice = p.price;
            items.save(it);
            total = total.add(p.price.multiply(BigDecimal.valueOf(r.quantity)));
        }
        o.total = total;
        return orders.save(o);
    }

    // ---------- 2. Bill of Materials generation ----------
    public List<Requirement> bom(Long orderId) {
        getOrder(orderId);
        Map<Long, Integer> need = new LinkedHashMap<>();
        for (OrderItem it : items.findBySalesOrderId(orderId)) {
            for (BomItem b : boms.findByProductId(it.product.id)) {
                need.merge(b.material.id, it.quantity * b.qtyPerUnit, Integer::sum);
            }
        }
        List<Requirement> out = new ArrayList<>();
        for (Map.Entry<Long, Integer> e : need.entrySet()) {
            Material m = materials.findById(e.getKey())
                    .orElseThrow(() -> bad("Material not found"));
            int required = e.getValue();
            out.add(new Requirement(m.id, m.code, m.name, required, m.stock,
                    Math.max(0, required - m.stock)));
        }
        return out;
    }

    // ---------- 3. Purchase orders ----------
    @Transactional
    public List<PurchaseOrder> createPurchaseOrders(Long orderId) {
        SalesOrder o = getOrder(orderId);
        if (!"NEW".equals(o.status))
            throw bad("Purchase orders can only be created for NEW orders");

        List<PurchaseOrder> created = new ArrayList<>();
        for (Requirement r : bom(orderId)) {
            if (r.shortage <= 0) continue;
            Material m = materials.findById(r.materialId)
                    .orElseThrow(() -> bad("Material not found"));
            PurchaseOrder po = new PurchaseOrder();
            po.material = m;
            po.quantity = r.shortage;
            po.total = m.unitCost.multiply(BigDecimal.valueOf(r.shortage));
            po.status = "ORDERED";
            po.createdDate = LocalDate.now();
            po.salesOrderId = orderId;
            po = pos.save(po);
            po.poNo = String.format("PO-%05d", po.id);
            created.add(pos.save(po));
        }
        if (created.isEmpty()) throw bad("No shortage - all materials are in stock");
        return created;
    }

    @Transactional
    public PurchaseOrder receivePo(Long id) {
        PurchaseOrder po = pos.findById(id).orElseThrow(() -> bad("PO not found"));
        if ("RECEIVED".equals(po.status)) throw bad("PO already received");
        po.material.stock += po.quantity;
        materials.save(po.material);
        po.status = "RECEIVED";
        return pos.save(po);
    }

    // ---------- 4. Order lifecycle ----------
    @Transactional
    public SalesOrder confirm(Long id) {
        SalesOrder o = getOrder(id);
        if (!"NEW".equals(o.status)) throw bad("Only NEW orders can be confirmed");
        List<Requirement> reqs = bom(id);
        for (Requirement r : reqs) {
            if (r.shortage > 0)
                throw bad("Insufficient stock of " + r.name + " (short by "
                        + r.shortage + "). Create and receive purchase orders first.");
        }
        for (Requirement r : reqs) {
            Material m = materials.findById(r.materialId)
                    .orElseThrow(() -> bad("Material not found"));
            m.stock -= r.required;
            materials.save(m);
        }
        o.status = "CONFIRMED";
        return orders.save(o);
    }

    @Transactional
    public SalesOrder advance(Long id) {
        SalesOrder o = getOrder(id);
        String next = NEXT.get(o.status);
        if (next == null) throw bad("Cannot advance an order in status " + o.status);
        o.status = next;
        return orders.save(o);
    }

    @Transactional
    public SalesOrder cancel(Long id) {
        SalesOrder o = getOrder(id);
        if (!"NEW".equals(o.status)) throw bad("Only NEW orders can be cancelled");
        o.status = "CANCELLED";
        return orders.save(o);
    }

    // ---------- 5. Invoicing ----------
    @Transactional
    public Invoice createInvoice(Long orderId) {
        SalesOrder o = getOrder(orderId);
        if (!Arrays.asList("CONFIRMED", "SHIPPED", "COMPLETED").contains(o.status))
            throw bad("Confirm the order before invoicing");
        if (invoices.findBySalesOrderId(orderId).isPresent())
            throw bad("Invoice already exists for this order");

        Invoice inv = new Invoice();
        inv.salesOrder = o;
        inv.subtotal = o.total;
        inv.tax = o.total.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        inv.total = inv.subtotal.add(inv.tax);
        inv.paid = BigDecimal.ZERO;
        inv.status = "UNPAID";
        inv.invoiceDate = LocalDate.now();
        inv = invoices.save(inv);
        inv.invoiceNo = String.format("INV-%05d", inv.id);
        return invoices.save(inv);
    }

    // ---------- 6. Payment tracking ----------
    @Transactional
    public Invoice pay(Long invoiceId, BigDecimal amount, String method) {
        Invoice inv = invoices.findById(invoiceId)
                .orElseThrow(() -> bad("Invoice not found"));
        if (amount == null || amount.signum() <= 0)
            throw bad("Amount must be greater than zero");
        BigDecimal due = inv.total.subtract(inv.paid);
        if (amount.compareTo(due) > 0) throw bad("Amount exceeds balance due: " + due);

        Payment p = new Payment();
        p.invoice = inv;
        p.amount = amount;
        p.method = (method == null || method.trim().isEmpty()) ? "CASH" : method;
        p.paidOn = LocalDateTime.now();
        payments.save(p);

        inv.paid = inv.paid.add(amount);
        inv.status = inv.paid.compareTo(inv.total) == 0 ? "PAID" : "PARTIAL";
        return invoices.save(inv);
    }
}