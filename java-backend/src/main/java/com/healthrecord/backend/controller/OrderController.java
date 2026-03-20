package com.healthrecord.backend.controller;

import com.healthrecord.backend.model.Order;
import com.healthrecord.backend.model.OrderItem;
import com.healthrecord.backend.model.Patient;
import com.healthrecord.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal Patient patient) {
        return ResponseEntity.ok(orderRepository.findByPatient(patient));
    }

    @PostMapping
    public ResponseEntity<Order> placeOrder(@AuthenticationPrincipal Patient patient, @RequestBody Order order) {
        order.setPatient(patient);
        if (order.getStatus() == null) {
            order.setStatus("confirmed");
        }
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setOrder(order);
            }
        }
        return ResponseEntity.status(201).body(orderRepository.save(order));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@AuthenticationPrincipal Patient patient, @PathVariable UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.getPatient().getId().equals(patient.getId())) {
            throw new SecurityException("Unauthorized access to order");
        }
        return ResponseEntity.ok(order);
    }
}
