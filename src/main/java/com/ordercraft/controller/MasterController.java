package com.ordercraft.controller;

import com.ordercraft.model.*;
import com.ordercraft.repository.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MasterController {

    public static class BomReq {
        public Long productId;
        public Long materialId;
        public int qtyPerUnit;
    }

    private final CustomerRepository customers;
    private final ProductRepository products;
    private final MaterialRepository materials;
    private final BomItemRepository boms;

    public MasterController(CustomerRepository customers, ProductRepository products,
                            MaterialRepository materials, BomItemRepository boms) {
        this.customers = customers;
        this.products = products;
        this.materials = materials;
        this.boms = boms;
    }

    private static boolean blank(String s) {
        return s == null || s.trim().isEmpty();
    }

    @GetMapping("/customers")
    public List<Customer> customers() { return customers.findAll(); }

    @PostMapping("/customers")
    public Customer addCustomer(@RequestBody Customer c) {
        if (blank(c.name)) throw new IllegalArgumentException("Customer name is required");
        c.id = null;
        return customers.save(c);
    }

<<<<<<< HEAD
    @DeleteMapping("/customers/{id}")
    public void deleteCustomer(@PathVariable Long id) {
        if (!customers.existsById(id)) {
            throw new IllegalArgumentException("Customer not found with id: " + id);
        }
        try {
            customers.deleteById(id);
        } catch (Exception e) {
            throw new IllegalArgumentException("Cannot delete customer: existing orders or documents are linked to this customer.");
        }
    }

=======
>>>>>>> 74ea1c64538c61d40779212c657caf7dd6277212
    @GetMapping("/products")
    public List<Product> products() { return products.findAll(); }

    @PostMapping("/products")
    public Product addProduct(@RequestBody Product p) {
        if (blank(p.code) || blank(p.name))
            throw new IllegalArgumentException("Product code and name are required");
        if (p.price == null || p.price.signum() <= 0)
            throw new IllegalArgumentException("Price must be greater than zero");
        p.id = null;
        return products.save(p);
    }

    @GetMapping("/materials")
    public List<Material> materials() { return materials.findAll(); }

    @PostMapping("/materials")
    public Material addMaterial(@RequestBody Material m) {
        if (blank(m.code) || blank(m.name))
            throw new IllegalArgumentException("Material code and name are required");
        if (m.unitCost == null || m.unitCost.signum() <= 0 || m.stock < 0)
            throw new IllegalArgumentException("Invalid unit cost or stock");
        m.id = null;
        return materials.save(m);
    }

    @GetMapping("/bom")
    public List<BomItem> bomList() { return boms.findAll(); }

    @PostMapping("/bom")
    public BomItem addBom(@RequestBody BomReq r) {
        if (r.qtyPerUnit <= 0)
            throw new IllegalArgumentException("Quantity per unit must be greater than zero");
        BomItem b = new BomItem();
        b.product = products.findById(r.productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        b.material = materials.findById(r.materialId)
                .orElseThrow(() -> new IllegalArgumentException("Material not found"));
        b.qtyPerUnit = r.qtyPerUnit;
        return boms.save(b);
    }
}