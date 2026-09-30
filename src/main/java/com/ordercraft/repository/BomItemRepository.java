package com.ordercraft.repository;

import com.ordercraft.model.BomItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BomItemRepository extends JpaRepository<BomItem, Long> {
    List<BomItem> findByProductId(Long productId);
}