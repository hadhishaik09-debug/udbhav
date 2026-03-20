package com.healthrecord.backend.repository;

import com.healthrecord.backend.model.Patient;
import com.healthrecord.backend.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReminderRepository extends JpaRepository<Reminder, UUID> {
    List<Reminder> findByPatient(Patient patient);
}
