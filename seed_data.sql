-- ==========================================
-- LEDGERVAULT PITCH DEMO SEED DATA
-- Run this in your Supabase SQL Editor!
-- ==========================================

-- 1. Insert Corporate/Demo Accounts (Super short IDs!)
INSERT INTO account (id, owner_name) VALUES 
('111111', 'Test Customer'),
('222222', 'Wayne Enterprises Corporate'),
('333333', 'Stark Industries Payroll'),
('444444', 'Daily Planet Operating Fund')
ON CONFLICT (id) DO NOTHING;

-- NOTE: Mockup ledger events have been removed as requested.
-- Your "Shift Activity" list will be completely blank for the pitch, 
-- allowing you to generate all the data live during your demo!
