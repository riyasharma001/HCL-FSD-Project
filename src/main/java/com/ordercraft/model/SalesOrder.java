package com.ordercraft.model;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "sales_orders")
public class SalesOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String orderNo;

    @ManyToOne(optional = false)
    public Customer customer;

    public LocalDate orderDate;
    public String status; // NEW, CONFIRMED, SHIPPED, COMPLETED, CANCELLED
    public BigDecimal total;
}