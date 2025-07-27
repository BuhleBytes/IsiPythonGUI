import { UserAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export const useUser = () => {
  const { session, loading, getUserProfile } = UserAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load profile data when session changes
  useEffect(() => {
    const loadProfile = async () => {
      if (session?.user?.id) {
        setProfileLoading(true);
        setError(null);

        try {
          const result = await getUserProfile(session.user.id);

          if (result.success) {
            setProfile(result.data);
          } else {
            setError(result.error);
          }
        } catch (err) {
          setError("Failed to load profile");
        } finally {
          setProfileLoading(false);
        }
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [session, getUserProfile]);

  // Extract user information
  const user = session?.user;
  const isLoggedIn = !!session;

  // Get names from both sources (fallback to metadata if profile fails)
  const firstNameFromMetadata = user?.user_metadata?.first_name || "";
  const lastNameFromMetadata = user?.user_metadata?.last_name || "";
  const firstNameFromProfile = profile?.first_name || "";
  const lastNameFromProfile = profile?.last_name || "";

  // Prefer profile data, fallback to metadata
  const firstName = firstNameFromProfile || firstNameFromMetadata;
  const lastName = lastNameFromProfile || lastNameFromMetadata;
  const fullName = `${firstName} ${lastName}`.trim();
  const email = user?.email || "";

  // Get user initials for avatar
  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : firstName
      ? firstName[0].toUpperCase()
      : email
      ? email[0].toUpperCase()
      : "U";

  return {
    // Auth state
    isLoggedIn,
    loading: loading || profileLoading,
    error,

    // User data
    user,
    profile,
    email,
    firstName,
    lastName,
    fullName,
    initials,

    // Metadata (from auth)
    metadata: user?.user_metadata || {},

    // Utility
    hasProfile: !!profile,
    createdAt: user?.created_at,
    profileCreatedAt: profile?.created_at,
  };
};
