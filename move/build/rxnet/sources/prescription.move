module prescription_nft::prescription {
    use std::string::{Self, String};
    use std::signer;
    use std::vector;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_std::table::{Self, Table};
    use std::error;
    use aptos_std::debug;

    /// Errors
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_DOCTOR_NOT_APPROVED: u64 = 2;
    const E_PRESCRIPTION_EXPIRED: u64 = 3;
    const E_PRESCRIPTION_ALREADY_FILLED: u64 = 4;
    const E_INVALID_TOKEN: u64 = 5;
    const E_ZERO_DOSAGE: u64 = 6;
    const E_ZERO_NUM_PILLS: u64 = 7;
    const E_EXPIRATION_IN_PAST: u64 = 8;

    /// Structs
    struct PrescriptionMetadata has store, drop {
        doctor: address,
        prescribed_patient: address,
        pzn: String,
        medication_name: String,
        dosage: u8,
        dosage_unit: String,
        num_pills: u8,
        date_filled: u64,
        expiration_time: u64,
    }

    struct Prescription has store, drop {
        metadata: PrescriptionMetadata,
        owner: address,
        filled: bool,
    }

    struct Doctor has store, drop {
        name: String,
        is_valid: bool,
    }

    struct PrescriptionNFT has key {
        owner: address,
        total_tokens: u64,
        prescriptions: Table<u64, Prescription>,
        approved_doctors: Table<address, Doctor>,
        issued_tokens: Table<address, vector<u64>>,
        owned_tokens: Table<address, vector<u64>>,
        prescription_minted_events: EventHandle<PrescriptionMinted>,
        prescription_cancelled_events: EventHandle<PrescriptionCancelled>,
        prescription_filled_events: EventHandle<PrescriptionFilled>,
    }

    struct PrescriptionMinted has drop, store {
        token_id: u64,
        doctor: address,
        patient: address,
    }

    struct PrescriptionCancelled has drop, store {
        token_id: u64,
        doctor: address,
    }

    struct PrescriptionFilled has drop, store {
        token_id: u64,
        pharmacy: address,
    }

    /// Initialize the PrescriptionNFT
    public fun initialize(account: &signer) {
        let owner_addr = signer::address_of(account);
        assert!(!exists<PrescriptionNFT>(owner_addr), error::already_exists(E_NOT_AUTHORIZED));
        
        move_to(account, PrescriptionNFT {
            owner: owner_addr,
            total_tokens: 0,
            prescriptions: table::new(),
            approved_doctors: table::new(),
            issued_tokens: table::new(),
            owned_tokens: table::new(),
            prescription_minted_events: account::new_event_handle<PrescriptionMinted>(account),
            prescription_cancelled_events: account::new_event_handle<PrescriptionCancelled>(account),
            prescription_filled_events: account::new_event_handle<PrescriptionFilled>(account),
        });
        debug::print(&string::utf8(b"PrescriptionNFT initialized"));
    }

    /// Approve a doctor
    public entry fun approve_doctor(account: &signer, doctor_address: address, name: String) acquires PrescriptionNFT {
        let prescription_nft = borrow_global_mut<PrescriptionNFT>(@prescription_nft);
        assert!(prescription_nft.owner == signer::address_of(account), error::permission_denied(E_NOT_AUTHORIZED));
        table::upsert(&mut prescription_nft.approved_doctors, doctor_address, Doctor { name, is_valid: true });
        debug::print(&string::utf8(b"Doctor approved: "));
        debug::print(&doctor_address);
    }

    /// Remove a doctor's approval
    public entry fun remove_doctor(account: &signer, doctor_address: address) acquires PrescriptionNFT {
        let prescription_nft = borrow_global_mut<PrescriptionNFT>(@prescription_nft);
        assert!(prescription_nft.owner == signer::address_of(account), error::permission_denied(E_NOT_AUTHORIZED));
        if (table::contains(&prescription_nft.approved_doctors, doctor_address)) {
            let doctor = table::borrow_mut(&mut prescription_nft.approved_doctors, doctor_address);
            doctor.is_valid = false;
            debug::print(&string::utf8(b"Doctor approval removed: "));
            debug::print(&doctor_address);
        };
    }

    /// Prescribe (mint) a new prescription
    public entry fun prescribe(
        doctor: &signer,
        patient_address: address,
        pzn: String,
        medication_name: String,
        dosage: u8,
        dosage_unit: String,
        num_pills: u8,
        expiration_time: u64
    ) acquires PrescriptionNFT {
        let prescription_nft = borrow_global_mut<PrescriptionNFT>(@prescription_nft);
        let doctor_address = signer::address_of(doctor);
        
        assert!(is_doctor_approved(doctor_address, prescription_nft), error::permission_denied(E_DOCTOR_NOT_APPROVED));
        assert!(dosage > 0, error::invalid_argument(E_ZERO_DOSAGE));
        assert!(num_pills > 0, error::invalid_argument(E_ZERO_NUM_PILLS));
        assert!(expiration_time > timestamp::now_seconds(), error::invalid_argument(E_EXPIRATION_IN_PAST));

        let token_id = prescription_nft.total_tokens;

        let metadata = PrescriptionMetadata {
            doctor: doctor_address,
            prescribed_patient: patient_address,
            pzn,
            medication_name,
            dosage,
            dosage_unit,
            num_pills,
            date_filled: timestamp::now_seconds(),
            expiration_time,
        };

        let prescription = Prescription {
            metadata,
            owner: patient_address,
            filled: false,
        };

        table::add(&mut prescription_nft.prescriptions, token_id, prescription);
        add_token_to_issued_tokens(doctor_address, token_id, prescription_nft);
        add_token_to_owned_tokens(patient_address, token_id, prescription_nft);

        prescription_nft.total_tokens = prescription_nft.total_tokens + 1;

        // Emit event
        event::emit_event(
            &mut prescription_nft.prescription_minted_events,
            PrescriptionMinted {
                token_id,
                doctor: doctor_address,
                patient: patient_address,
            }
        );
        debug::print(&string::utf8(b"Prescription minted: "));
        debug::print(&token_id);
    }

    /// Cancel a prescription
    public entry fun cancel_prescription(doctor: &signer, token_id: u64) acquires PrescriptionNFT {
        let prescription_nft = borrow_global_mut<PrescriptionNFT>(@prescription_nft);
        let doctor_address = signer::address_of(doctor);
        
        assert!(is_doctor_approved(doctor_address, prescription_nft), error::permission_denied(E_DOCTOR_NOT_APPROVED));
        assert!(table::contains(&prescription_nft.prescriptions, token_id), error::not_found(E_INVALID_TOKEN));

        let prescription = table::borrow(&prescription_nft.prescriptions, token_id);
        assert!(prescription.metadata.doctor == doctor_address, error::permission_denied(E_NOT_AUTHORIZED));
        assert!(!prescription.filled, error::invalid_state(E_PRESCRIPTION_ALREADY_FILLED));

        remove_token_from_owned_tokens(prescription.owner, token_id, prescription_nft);
        remove_token_from_issued_tokens(doctor_address, token_id, prescription_nft);
        table::remove(&mut prescription_nft.prescriptions, token_id);

        // Emit event
        event::emit_event(
            &mut prescription_nft.prescription_cancelled_events,
            PrescriptionCancelled {
                token_id,
                doctor: doctor_address,
            }
        );
        debug::print(&string::utf8(b"Prescription cancelled: "));
        debug::print(&token_id);
    }

    /// Fill a prescription
    public entry fun fill_prescription(patient: &signer, pharmacy_address: address, token_id: u64) acquires PrescriptionNFT {
        let prescription_nft = borrow_global_mut<PrescriptionNFT>(@prescription_nft);
        let patient_address = signer::address_of(patient);
        
        assert!(table::contains(&prescription_nft.prescriptions, token_id), error::not_found(E_INVALID_TOKEN));
        let prescription = table::borrow_mut(&mut prescription_nft.prescriptions, token_id);
        
        assert!(prescription.owner == patient_address, error::permission_denied(E_NOT_AUTHORIZED));
        assert!(!prescription.filled, error::invalid_state(E_PRESCRIPTION_ALREADY_FILLED));
        assert!(prescription.metadata.expiration_time > timestamp::now_seconds(), error::invalid_state(E_PRESCRIPTION_EXPIRED));

        prescription.filled = true;
        prescription.owner = pharmacy_address;

        remove_token_from_owned_tokens(patient_address, token_id, prescription_nft);
        add_token_to_owned_tokens(pharmacy_address, token_id, prescription_nft);

        // Emit event
        event::emit_event(
            &mut prescription_nft.prescription_filled_events,
            PrescriptionFilled {
                token_id,
                pharmacy: pharmacy_address,
            }
        );
        debug::print(&string::utf8(b"Prescription filled: "));
        debug::print(&token_id);
    }

    /// Check if a doctor is approved
    fun is_doctor_approved(doctor_address: address, prescription_nft: &PrescriptionNFT): bool {
        if (table::contains(&prescription_nft.approved_doctors, doctor_address)) {
            let doctor = table::borrow(&prescription_nft.approved_doctors, doctor_address);
            doctor.is_valid
        } else {
            false
        }
    }

    /// Add a token to the issued tokens list for a doctor
    fun add_token_to_issued_tokens(doctor_address: address, token_id: u64, prescription_nft: &mut PrescriptionNFT) {
        if (!table::contains(&prescription_nft.issued_tokens, doctor_address)) {
            table::add(&mut prescription_nft.issued_tokens, doctor_address, vector::empty<u64>());
        };
        let issued_tokens = table::borrow_mut(&mut prescription_nft.issued_tokens, doctor_address);
        vector::push_back(issued_tokens, token_id);
    }

    /// Remove a token from the issued tokens list for a doctor
    fun remove_token_from_issued_tokens(doctor_address: address, token_id: u64, prescription_nft: &mut PrescriptionNFT) {
        if (table::contains(&prescription_nft.issued_tokens, doctor_address)) {
            let issued_tokens = table::borrow_mut(&mut prescription_nft.issued_tokens, doctor_address);
            let (found, index) = vector::index_of(issued_tokens, &token_id);
            if (found) {
                vector::remove(issued_tokens, index);
            };
        };
    }

    /// Add a token to the owned tokens list for an address
    fun add_token_to_owned_tokens(owner: address, token_id: u64, prescription_nft: &mut PrescriptionNFT) {
        if (!table::contains(&prescription_nft.owned_tokens, owner)) {
            table::add(&mut prescription_nft.owned_tokens, owner, vector::empty<u64>());
        };
        let owned_tokens = table::borrow_mut(&mut prescription_nft.owned_tokens, owner);
        vector::push_back(owned_tokens, token_id);
    }

    /// Remove a token from the owned tokens list for an address
    fun remove_token_from_owned_tokens(owner: address, token_id: u64, prescription_nft: &mut PrescriptionNFT) {
        if (table::contains(&prescription_nft.owned_tokens, owner)) {
            let owned_tokens = table::borrow_mut(&mut prescription_nft.owned_tokens, owner);
            let (found, index) = vector::index_of(owned_tokens, &token_id);
            if (found) {
                vector::remove(owned_tokens, index);
            };
        };
    }

    /// Get the total supply of tokens
    public fun total_supply(): u64 acquires PrescriptionNFT {
        borrow_global<PrescriptionNFT>(@prescription_nft).total_tokens
    }

    /// Get the balance of tokens for an address
    public fun balance_of(owner: address): u64 acquires PrescriptionNFT {
        let prescription_nft = borrow_global<PrescriptionNFT>(@prescription_nft);
        if (table::contains(&prescription_nft.owned_tokens, owner)) {
            vector::length(table::borrow(&prescription_nft.owned_tokens, owner))
        } else {
            0
        }
    }

    /// Get the list of tokens issued by a doctor
    public fun tokens_issued(doctor: address): vector<u64> acquires PrescriptionNFT {
        let prescription_nft = borrow_global<PrescriptionNFT>(@prescription_nft);
        if (table::contains(&prescription_nft.issued_tokens, doctor)) {
            *table::borrow(&prescription_nft.issued_tokens, doctor)
        } else {
            vector::empty<u64>()
        }
    }

    /// Get the list of tokens owned by an address
    public fun tokens_of(owner: address): vector<u64> acquires PrescriptionNFT {
        let prescription_nft = borrow_global<PrescriptionNFT>(@prescription_nft);
        if (table::contains(&prescription_nft.owned_tokens, owner)) {
            *table::borrow(&prescription_nft.owned_tokens, owner)
        } else {
            vector::empty<u64>()
        }
    }

    /// Get the owner of a token
    public fun owner_of(token_id: u64): address acquires PrescriptionNFT {
        let prescription_nft = borrow_global<PrescriptionNFT>(@prescription_nft);
        assert!(table::contains(&prescription_nft.prescriptions, token_id), error::not_found(E_INVALID_TOKEN));
        let prescription = table::borrow(&prescription_nft.prescriptions, token_id);
        prescription.owner
    }
}