package com.ordercraft.model;

import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "materials")
public class Material {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(unique = true, nullable = false)
    public String code;

    @Column(nullable = false)
    public String name;

    public BigDecimal unitCost;
    public int stock;
    public String supplier;
}
