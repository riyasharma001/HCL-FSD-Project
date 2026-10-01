package com.ordercraft.model;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
public class Invoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String invoiceNo;

    @ManyToOne(optional = false)
    public SalesOrder salesOrder;

    public BigDecimal subtotal;
    public BigDecimal tax;
    public BigDecimal total;
    public BigDecimal paid;
    public String status; // UNPAID, PARTIAL, PAID
    public LocalDate invoiceDate;
}