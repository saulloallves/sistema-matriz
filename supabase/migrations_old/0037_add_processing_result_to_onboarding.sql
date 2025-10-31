-- Migration: Add processing_result column to onboarding_requests
-- Description: Stores the result of approval processing (franchisee_id, unit_id, system_password)
-- Created: 2025-10-29

-- Add processing_result column as JSONB
ALTER TABLE onboarding_requests
ADD COLUMN IF NOT EXISTS processing_result JSONB;

-- Add comment to document the column
COMMENT ON COLUMN onboarding_requests.processing_result IS 
'Stores the result of onboarding approval processing. Contains: franchisee_id, unit_id, system_password (generated), and created_at timestamp';

-- Create index for querying by franchisee_id in processing_result
CREATE INDEX IF NOT EXISTS idx_onboarding_requests_processing_result_franchisee 
ON onboarding_requests USING gin ((processing_result -> 'franchisee_id'));

-- Create index for querying by unit_id in processing_result
CREATE INDEX IF NOT EXISTS idx_onboarding_requests_processing_result_unit 
ON onboarding_requests USING gin ((processing_result -> 'unit_id'));
