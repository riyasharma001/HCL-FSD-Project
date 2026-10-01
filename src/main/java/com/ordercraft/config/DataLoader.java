package com.ordercraft.config;

import com.ordercraft.model.*;
import com.ordercraft.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataLoader implements CommandLineRunner {

    private final CustomerRepository customers;
    private final ProductRepository products;
    private final MaterialRepository materials;
    private final BomItemRepository boms;

    public DataLoader(CustomerRepository customers, ProductRepository products,
                      MaterialRepository materials, BomItemRepository boms) {
        this.customers = customers;
        this.products = products;
        this.materials = materials;
        this.boms = boms;
    }

    @Override
    public void run(String... args) {
        if (customers.count() > 0) return;

        Customer c = new Customer();
        c.name = "Acme Industries";
        c.email = "purchase@acme.com";
        c.phone = "9876543210";
        c.address = "Pune, India";
        customers.save(c);

        Product chair = product("PRD-001", "Steel Chair", "2500.00");
        Product table = product("PRD-002", "Steel Table", "6500.00");

        Material steel = material("MAT-001", "Steel Rod", "120.00", 100, "SteelCorp");
        Material wood = material("MAT-002", "Wood Plank", "200.00", 50, "WoodWorks");
        Material screws = material("MAT-003", "Screws", "5.00", 500, "FixIt");

        bom(chair, steel, 4);
        bom(chair, wood, 1);
        bom(chair, screws, 12);
        bom(table, steel, 8);
        bom(table, wood, 3);
        bom(table, screws, 24);
    }

    private Product product(String code, String name, String price) {
        Product p = new Product();
        p.code = code;
        p.name = name;
        p.price = new BigDecimal(price);
        return products.save(p);
    }

    private Material material(String code, String name, String cost, int stock, String supplier) {
        Material m = new Material();
        m.code = code;
        m.name = name;
        m.unitCost = new BigDecimal(cost);
        m.stock = stock;
        m.supplier = supplier;
        return materials.save(m);
    }

    private void bom(Product p, Material m, int qty) {
        BomItem b = new BomItem();
        b.product = p;
        b.material = m;
        b.qtyPerUnit = qty;
        boms.save(b);
    }
}