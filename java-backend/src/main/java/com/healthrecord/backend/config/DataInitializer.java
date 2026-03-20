package com.healthrecord.backend.config;

import com.healthrecord.backend.model.Medicine;
import com.healthrecord.backend.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final MedicineRepository medicineRepository;

    @Override
    public void run(String... args) throws Exception {
        if (medicineRepository.count() == 0) {
            List<Medicine> initialMedicines = List.of(
                Medicine.builder()
                    .name("Paracetamol 500mg")
                    .generic("Paracetamol")
                    .price(32.0)
                    .pharmacy("LifeCare Pharmacy")
                    .distance("0.4 km")
                    .address("12, MG Road, Bengaluru")
                    .inStock(true)
                    .category("Analgesic")
                    .unit("Strip of 10")
                    .build(),
                Medicine.builder()
                    .name("Azithromycin 500mg")
                    .generic("Azithromycin")
                    .price(98.0)
                    .pharmacy("Apollo Pharmacy")
                    .distance("0.8 km")
                    .address("45, Brigade Road, Bengaluru")
                    .inStock(true)
                    .category("Antibiotic")
                    .unit("Strip of 3")
                    .build(),
                Medicine.builder()
                    .name("Metformin 500mg")
                    .generic("Metformin HCl")
                    .price(45.0)
                    .pharmacy("MedPlus Pharmacy")
                    .distance("1.2 km")
                    .address("78, Indiranagar, Bengaluru")
                    .inStock(true)
                    .category("Antidiabetic")
                    .unit("Strip of 10")
                    .build(),
                Medicine.builder()
                    .name("Pantoprazole 40mg")
                    .generic("Pantoprazole")
                    .price(62.0)
                    .pharmacy("LifeCare Pharmacy")
                    .distance("0.4 km")
                    .address("12, MG Road, Bengaluru")
                    .inStock(false)
                    .category("Antacid")
                    .unit("Strip of 10")
                    .build(),
                Medicine.builder()
                    .name("Cetirizine 10mg")
                    .generic("Cetirizine HCl")
                    .price(28.0)
                    .pharmacy("Wellness Pharma")
                    .distance("1.6 km")
                    .address("90, Koramangala, Bengaluru")
                    .inStock(true)
                    .category("Antihistamine")
                    .unit("Strip of 10")
                    .build(),
                Medicine.builder()
                    .name("Atorvastatin 10mg")
                    .generic("Atorvastatin")
                    .price(74.0)
                    .pharmacy("Apollo Pharmacy")
                    .distance("0.8 km")
                    .address("45, Brigade Road, Bengaluru")
                    .inStock(true)
                    .category("Statin")
                    .unit("Strip of 10")
                    .build(),
                Medicine.builder()
                    .name("Amoxicillin 500mg")
                    .generic("Amoxicillin")
                    .price(85.0)
                    .pharmacy("MedPlus Pharmacy")
                    .distance("1.2 km")
                    .address("78, Indiranagar, Bengaluru")
                    .inStock(true)
                    .category("Antibiotic")
                    .unit("Strip of 10")
                    .build(),
                Medicine.builder()
                    .name("Losartan 50mg")
                    .generic("Losartan Potassium")
                    .price(110.0)
                    .pharmacy("Wellness Pharma")
                    .distance("1.6 km")
                    .address("90, Koramangala, Bengaluru")
                    .inStock(true)
                    .category("Antihypertensive")
                    .unit("Strip of 10")
                    .build()
            );
            medicineRepository.saveAll(initialMedicines);
            System.out.println("Seeded medicine database with " + initialMedicines.size() + " items.");
        }
    }
}
