package com.ordercraft.model;

import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(unique = true, nullable = false)
    public String code;

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    public BigDecimal price;
}