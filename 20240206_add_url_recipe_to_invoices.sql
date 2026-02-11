-- Migration: 20240206_add_url_recipe_to_invoices.sql
-- Description: Add url_recipe field to store payment receipt URLs

ALTER TABLE invoices 
ADD COLUMN url_recipe TEXT;

-- Add comment
COMMENT ON COLUMN invoices.url_recipe IS 'URL to the payment receipt image stored in cloud storage';
