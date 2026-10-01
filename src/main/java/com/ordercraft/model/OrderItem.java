package com.ordercraft.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @JsonIgnore
    @ManyToOne(optional = false)
    public SalesOrder salesOrder;

    @ManyToOne(optional = false)
    public Product product;

    public int quantity;
    public BigDecimal unitPrice;
}