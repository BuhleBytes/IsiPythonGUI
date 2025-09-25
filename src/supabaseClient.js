/**
 * Supabase Client Configuration
 *
 * This file creates and exports a configured Supabase client instance that can be used
 * throughout the application to interact with the Supabase backend services.
 *
 * Supabase is an open-source Firebase alternative that provides:
 * - PostgreSQL database with real-time subscriptions
 * - Authentication and user management
 * - Auto-generated APIs (REST and GraphQL)
 * - File storage
 * - Edge functions
 *
 * This client instance handles:
 * - Database operations (CRUD operations on tables)
 * - Authentication (sign up, sign in, sign out)
 * - Real-time subscriptions to database changes
 * - File uploads and downloads
 * - Row Level Security (RLS) enforcement
 *
 * Usage:
 * Import this client in any file where you need to interact with Supabase:
 * import { supabase } from './supabaseClient';
 *
 * Environment Variables Required:
 * - VITE_SUPABASE_URL: The unique URL for your Supabase project
 * - VITE_SUPABASE_ANON_KEY: The anonymous/public key for client-side access
 */

// Import the createClient function from the Supabase JavaScript library
// This function is used to initialize a new Supabase client with the provided configuration
import { createClient } from "@supabase/supabase-js";

// Retrieve the Supabase project URL from environment variables
// This URL is unique to your Supabase project and serves as the base endpoint
// for all API requests (database, auth, storage, etc.)
// Format: https://your-project-ref.supabase.co
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Retrieve the anonymous key from environment variables
// This is a public key that allows client-side access to your Supabase project
// It respects Row Level Security (RLS) policies and is safe to expose in client-side code
// The anonymous key has limited permissions and is used for public operations
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the Supabase client instance
// This client will be used throughout the application to:
// - Perform database queries and mutations
// - Handle user authentication
// - Subscribe to real-time database changes
// - Upload and download files
// - Execute edge functions
//
// The client is configured with:
// - The project URL (where to send requests)
// - The anonymous key (for authentication and RLS)
// - Default options (automatic token refresh, persistence settings, etc.)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
