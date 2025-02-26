/*
  # Remove existing users

  1. Changes
    - Safely remove all existing users and related data
    - Maintain referential integrity
    - Clean up any orphaned data

  2. Security
    - Preserves RLS policies and security settings
    - Maintains table structure and constraints
*/

-- First, remove all user-related data in the correct order to maintain referential integrity
DO $$
BEGIN
  -- Delete all message-related data
  DELETE FROM message_attachments;
  DELETE FROM messages;
  
  -- Delete all connection-related data
  DELETE FROM connections;
  
  -- Delete all user settings and tracking data
  DELETE FROM user_settings;
  DELETE FROM request_tracking;
  
  -- Delete all blocked and reported content
  DELETE FROM blocked_users;
  DELETE FROM reported_content;
  
  -- Delete all opportunity-related data
  DELETE FROM favorite_opportunities;
  DELETE FROM opportunity_views;
  DELETE FROM opportunities;
  
  -- Delete all prospect-related data
  DELETE FROM prospect_list_items;
  DELETE FROM prospect_lists;
  DELETE FROM saved_searches;
  DELETE FROM prospect_categories;
  DELETE FROM prospects;
  
  -- Delete all requirement-related data
  DELETE FROM requirement_categories;
  DELETE FROM requirements;
  
  -- Delete all calls
  DELETE FROM calls;
  
  -- Finally, delete all users from the auth schema
  DELETE FROM auth.users;
END $$;