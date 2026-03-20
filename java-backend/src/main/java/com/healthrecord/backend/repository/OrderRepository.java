package com.healthrecord.backend.repository;

import com.healthrecord.backend.model.Order;
import com.healthrecord.backend.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByPatient(Patient patient);
}
