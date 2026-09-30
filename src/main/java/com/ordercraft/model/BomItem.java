package com.ordercraft.model;

import javax.persistence.*;

@Entity
@Table(name = "bom_items")
public class BomItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(optional = false)
    public Product product;

    @ManyToOne(optional = false)
    public Material material;

    public int qtyPerUnit;
}