# Firestore Security Specification & Design Invariants

This specification lists the database invariants and validation criteria designed to protect the **Esplanada Viva** application from unauthorized modifications or data leakage.

## Data Invariants

1. **User Ownership (The Master Gate)**:
   - A user's profile and all nested resources (Sabbath lessons, Bible readings, reflections, medals, logs) under `/users/{userId}/...` are strictly reserved for that specific authenticated user.
   - Standard users cannot read or write to other users' profiles or subcollections.
2. **Access Control Hierarchy**:
   - Only administrative/coordinating users can list and view all user profiles for accountability.
   - For standard fields, users can read and write their own data.
   - A standard user cannot promote themselves to `'admin'`.
3. **Mission Challenges Verification**:
   - Only administrative users (coordinators, pastors) can create/update challenges under `/challenges/{challengeId}`.
   - Normal members have read-only access to `/challenges/...`.
4. **Data Shape Integrity**:
   - All text and IDs must comply with defined constraints to avoid resource exhaustion or script injections.

## The Dirty Dozen Payloads (Vulnerability Vector Checklist)

Each of the following payloads must be strictly rejected (`PERMISSION_DENIED`) by our security rules:

1. **Attacking Users collection (Unloaded identity)**: User `A` trying to modify User `B`'s profile.
2. **Attacking Users collection (Role escalation)**: A member trying to set `"role": "admin"`.
3. **Attacking Lessons collection (Malicious overwrite)**: Writing answers to another user's Sabbath lessons.
4. **Attacking Mission Challenges (Unauthorized Creation)**: Standard user trying to write a mission challenge.
5. **Attacking Mission Challenges (Injected junk)**: Attempting to bypass validations and inject giant scripts or oversized text as mission descriptions.
6. **Poisoning Document IDs**: Trying to register a subcollection document with a massive 200-character weird-encoded key.
7. **Bypassing Verification**: Writing writes when `email_verified` is not validated (if configured).
8. **Malicious Reflection Overwrites**: Trying to delete or modify another devotee's reflection journal entries.
9. **Spamming Activity Logs**: Writing fictitious XP records under your logs.
10. **Spoofing Creation Date**: Client providing their own custom, older timezone timestamp for `createdAt` instead of relying on `request.time`.
11. **Injecting shadow fields**: Adding unrelated fields in `UserProfile` update.
12. **Bypassing terminal status locks**: Attempting to alter a challenge that has already been deactivated or is frozen by administrators.

All tests to prove the protection against these payloads are described.
