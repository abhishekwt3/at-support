-- Add custom_name column to portals table
ALTER TABLE portals ADD COLUMN custom_name VARCHAR(255);

-- Add unique index on custom_name
CREATE UNIQUE INDEX idx_portals_custom_name ON portals(custom_name);

-- Add category_slug column to conversations table
ALTER TABLE conversations ADD COLUMN category_slug VARCHAR(255);

-- Create index on category_slug for better query performance
CREATE INDEX idx_conversations_category_slug ON conversations(category_slug);

-- Create composite index for efficient lookups by URL parameters
CREATE INDEX idx_conversations_url_params ON conversations(portal_id, category_slug, unique_code);
