package com.ordercraft.model;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String poNo;

    @ManyToOne(optional = false)
    public Material material;

    public int quantity;
    public BigDecimal total;
    public String status; // ORDERED, RECEIVED
    public LocalDate createdDate;
    public Long salesOrderId;
}