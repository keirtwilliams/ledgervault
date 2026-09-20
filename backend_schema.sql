-- COMPLETE SCHEMA RESET & CLEANUP SCRIPT
-- This will wipe all existing messy tables and recreate the exact schema the React app expects.

-- 1. Drop EVERYTHING to clean up duplicates (WARNING: DELETES ALL DATA)
DROP TABLE IF EXISTS ledger_events CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS compensating_transaction CASCADE;
DROP TABLE IF EXISTS ledger_event CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP VIEW IF EXISTS current_account_balance CASCADE;
DROP VIEW IF EXISTS current_account_b CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the true, singular `account` table
-- CHANGED TO TEXT so you can use super short custom IDs like '111111'
CREATE TABLE account (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    owner_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create the `ledger_event` table
CREATE TABLE ledger_event (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    account_id TEXT NOT NULL REFERENCES account(id),
    session_id TEXT, -- For tracking the teller who made the entry
    amount BIGINT NOT NULL, -- Stored in cents (e.g. 50000 = $500.00)
    reference_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create the `compensating_transaction` table for Reversals (Auditor Portal)
CREATE TABLE compensating_transaction (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    original_event_id TEXT NOT NULL REFERENCES ledger_event(id),
    session_id TEXT,
    amount BIGINT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Insert Demo Accounts so you can test right away!
INSERT INTO account (id, owner_name) VALUES 
('111111', 'Test Customer'),
('222222', 'Wayne Enterprises Corporate'),
('333333', 'Stark Industries Payroll'),
('444444', 'Daily Planet Operating Fund')
ON CONFLICT (id) DO NOTHING;

-- =======================================================================
-- ROW LEVEL SECURITY (RLS)
-- =======================================================================
ALTER TABLE account ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE compensating_transaction ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated operations for MVP testing
CREATE POLICY "Allow All on Account" ON account FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on Ledger" ON ledger_event FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on Compensating" ON compensating_transaction FOR ALL USING (true) WITH CHECK (true);

-- STRICT IMMUTABILITY RULES 
-- These strictly override the "Allow All" above, blocking any Deletes or Updates to historical records
CREATE POLICY "Prevent Ledger Updates" ON ledger_event FOR UPDATE USING (false);
CREATE POLICY "Prevent Ledger Deletes" ON ledger_event FOR DELETE USING (false);
CREATE POLICY "Prevent Reversal Updates" ON compensating_transaction FOR UPDATE USING (false);
CREATE POLICY "Prevent Reversal Deletes" ON compensating_transaction FOR DELETE USING (false);

-- =======================================================================
-- REALTIME SUBSCRIPTIONS
-- =======================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE ledger_event;
ALTER PUBLICATION supabase_realtime ADD TABLE compensating_transaction;
