/**
 * useUser Custom Hook
 *
 * This custom React hook provides a comprehensive interface for managing user authentication
 * state and profile data throughout the application. It serves as the primary source of
 * user information by combining authentication session data with detailed profile information.
 *
 * Key Features:
 * - Manages user authentication state and session information
 * - Fetches and caches detailed user profile data from the backend
 * - Provides computed user properties like full name and initials
 * - Handles loading states for both authentication and profile data
 * - Implements fallback mechanisms for user data sources
 * - Offers utility properties for user status and profile completeness
 * - Automatically refreshes profile data when authentication state changes
 * - Provides error handling for profile loading failures
 *
 * Data Sources:
 * - Primary: User authentication session from AuthContext
 * - Secondary: Detailed profile data from getUserProfile API
 * - Fallback: User metadata from authentication provider
 *
 * User Information Hierarchy:
 * 1. Profile data (from API) - most complete and up-to-date
 * 2. User metadata (from auth) - basic information from authentication
 * 3. Default values - safe fallbacks to prevent UI errors
 *
 * Computed Properties:
 * - fullName: Combines first and last name with proper formatting
 * - initials: Generates user initials for avatar displays
 * - hasProfile: Boolean indicating if detailed profile data exists
 * - Various loading states for different data sources
 *
 * Usage:
 * const {
 *   isLoggedIn, loading, user, userId, profile, email,
 *   firstName, lastName, fullName, initials, error
 * } = useUser();
 *
 * Dependencies:
 * - AuthContext for session management and profile fetching
 * - React hooks for state management and side effects
 */

import { UserAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

/**
 * Custom hook that provides comprehensive user authentication and profile management
 * @returns {Object} Object containing user state, profile data, computed properties, and utility functions
 */
export const useUser = () => {
  // Get authentication context with session data and profile fetching function
  const { session, loading, getUserProfile } = UserAuth();

  // State for storing detailed user profile data from the API
  const [profile, setProfile] = useState(null);

  // Loading state specifically for profile data fetching
  // Separate from auth loading to provide granular loading feedback
  const [profileLoading, setProfileLoading] = useState(true);

  // Error state for profile loading failures
  // Authentication errors are handled by the AuthContext
  const [error, setError] = useState(null);

  /**
   * Effect hook to load user profile data when session changes
   * Automatically fetches detailed profile information when user logs in
   * Clears profile data when user logs out
   */
  useEffect(() => {
    /**
     * Async function to fetch user profile data from the API
     * Handles the complete profile loading lifecycle with error handling
     */
    const loadProfile = async () => {
      // Check if we have a valid session with user ID
      if (session?.user?.id) {
        // Set loading state and clear any previous errors
        setProfileLoading(true);
        setError(null);

        try {
          // Fetch detailed profile data using the user ID from session
          const result = await getUserProfile(session.user.id);

          // Check if the profile fetch was successful
          if (result.success) {
            // Store the profile data in state
            setProfile(result.data);
          } else {
            // Handle API error response
            setError(result.error);
          }
        } catch (err) {
          // Handle any network or parsing errors
          setError("Failed to load profile");
        } finally {
          // Always reset loading state when operation completes
          setProfileLoading(false);
        }
      } else {
        // No session or user ID - clear profile data and stop loading
        setProfile(null);
        setProfileLoading(false);
      }
    };

    // Execute the profile loading function
    loadProfile();
  }, [session, getUserProfile]); // Re-run when session or getUserProfile changes

  // Extract basic user information from the authentication session
  const user = session?.user;

  // Compute authentication status based on session existence
  const isLoggedIn = !!session;

  // Extract user names from multiple sources with fallback hierarchy
  // This ensures we always have name data even if one source fails

  // Get names from user metadata (stored during authentication)
  const firstNameFromMetadata = user?.user_metadata?.first_name || "";
  const lastNameFromMetadata = user?.user_metadata?.last_name || "";

  // Get names from detailed profile data (from API)
  const firstNameFromProfile = profile?.first_name || "";
  const lastNameFromProfile = profile?.last_name || "";

  // Prefer profile data over metadata (profile is more complete and current)
  // Fall back to metadata if profile is not available or incomplete
  const firstName = firstNameFromProfile || firstNameFromMetadata;
  const lastName = lastNameFromProfile || lastNameFromMetadata;

  // Create full name by combining first and last names
  // Trim to remove any extra whitespace from partial names
  const fullName = `${firstName} ${lastName}`.trim();

  // Extract email from user session data
  const email = user?.email || "";

  /**
   * Generate user initials for avatar displays
   * Uses a fallback hierarchy to ensure we always have meaningful initials:
   * 1. First letter of first name + first letter of last name
   * 2. First letter of first name only
   * 3. First letter of email address
   * 4. Default "U" for "User"
   */
  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase() // Both names available
      : firstName
      ? firstName[0].toUpperCase() // Only first name available
      : email
      ? email[0].toUpperCase() // Use email as fallback
      : "U"; // Ultimate fallback

  // Return the hook's public API with all user-related data and utilities
  return {
    // Authentication state properties
    isLoggedIn, // Boolean indicating if user is authenticated
    loading: loading || profileLoading, // Combined loading state for auth and profile
    error, // Any error that occurred during profile loading

    // Core user data objects
    user, // Complete user object from authentication session
    userId: user?.id, // User ID extracted from session for easy access
    profile, // Detailed profile data from API (may be null)

    // Basic user information with fallbacks
    email, // User's email address
    firstName, // User's first name (profile > metadata > empty)
    lastName, // User's last name (profile > metadata > empty)
    fullName, // Computed full name from first + last names
    initials, // Computed initials for avatar displays

    // Additional user metadata
    metadata: user?.user_metadata || {}, // Raw metadata from authentication provider

    // Utility properties for UI logic
    hasProfile: !!profile, // Boolean indicating if detailed profile exists
    createdAt: user?.created_at, // When the user account was created
    profileCreatedAt: profile?.created_at, // When the profile was created (if different)
  };
};
