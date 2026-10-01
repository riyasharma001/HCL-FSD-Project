package com.ordercraft.controller;

import com.ordercraft.model.*;
import com.ordercraft.repository.*;
import com.ordercraft.service.OrderService;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {

    public static class OrderReq {
        public Long customerId;
        public List<OrderService.ItemReq> items;
    }

    public static class PayReq {
        public BigDecimal amount;
        public String method;
    }

    private final OrderService service;
    private final SalesOrderRepository orders;
    private final OrderItemRepository items;
    private final PurchaseOrderRepository pos;
    private final InvoiceRepository invoices;
    private final PaymentRepository payments;

    public OrderController(OrderService service, SalesOrderRepository orders,
                           OrderItemRepository items, PurchaseOrderRepository pos,
                           InvoiceRepository invoices, PaymentRepository payments) {
        this.service = service;
        this.orders = orders;
        this.items = items;
        this.pos = pos;
        this.invoices = invoices;
        this.payments = payments;
    }

    // ----- Orders -----
    @GetMapping("/orders")
    public List<SalesOrder> orders() {
        return orders.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @PostMapping("/orders")
    public SalesOrder create(@RequestBody OrderReq r) {
        return service.createOrder(r.customerId, r.items);
    }

    @GetMapping("/orders/{id}/items")
    public List<OrderItem> orderItems(@PathVariable Long id) {
        return items.findBySalesOrderId(id);
    }

    @GetMapping("/orders/{id}/bom")
    public List<OrderService.Requirement> bom(@PathVariable Long id) {
        return service.bom(id);
    }

    @PostMapping("/orders/{id}/purchase-orders")
    public List<PurchaseOrder> createPos(@PathVariable Long id) {
        return service.createPurchaseOrders(id);
    }

    @PostMapping("/orders/{id}/confirm")
    public SalesOrder confirm(@PathVariable Long id) { return service.confirm(id); }

    @PostMapping("/orders/{id}/advance")
    public SalesOrder advance(@PathVariable Long id) { return service.advance(id); }

    @PostMapping("/orders/{id}/cancel")
    public SalesOrder cancel(@PathVariable Long id) { return service.cancel(id); }

    @PostMapping("/orders/{id}/invoice")
    public Invoice invoice(@PathVariable Long id) { return service.createInvoice(id); }

    // ----- Purchase orders -----
    @GetMapping("/purchase-orders")
    public List<PurchaseOrder> purchaseOrders() {
        return pos.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @PostMapping("/purchase-orders/{id}/receive")
    public PurchaseOrder receive(@PathVariable Long id) { return service.receivePo(id); }

    // ----- Invoices & payments -----
    @GetMapping("/invoices")
    public List<Invoice> invoices() {
        return invoices.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @PostMapping("/invoices/{id}/payments")
    public Invoice pay(@PathVariable Long id, @RequestBody PayReq r) {
        return service.pay(id, r.amount, r.method);
    }

    @GetMapping("/invoices/{id}/payments")
    public List<Payment> payments(@PathVariable Long id) {
        return payments.findByInvoiceId(id);
    }
}