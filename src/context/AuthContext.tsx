/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [loading, setLoading] = useState(true);

  // Sign up function - with profile creation
  const signUpNewUser = async (email, password, profileData = {}) => {
    try {
      setLoading(true);
      console.log(profileData.firstName);
      console.log(profileData.lastName);

      // Step 1: Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            first_name: profileData.firstName,
            last_name: profileData.lastName,
          },
        },
      });

      if (error) {
        console.error("there was a problem signing up:", error);
        return { success: false, error: error.message };
      }

      // Step 2: If user was created and we have a session, update our state
      if (data.session) {
        setSession(data.session);
      }

      // console.log("Sign-up successful:", data);
      return { success: true, data, hasSession: !!data.session };
    } catch (error) {
      console.error("An error occurred during signup:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign In function
  const signInUser = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("sign in error occurred: ", error);
        return { success: false, error: error.message };
      }
      console.log("sign-in success: ", data);
      return { success: true, data };
    } catch (error) {
      console.error("An error occurred: ", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("there was an error signing out: ", error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error("An error occurred during sign out: ", error);
      return { success: false, error: error.message };
    }
  };

  // Get user profile
  const getUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("An error occurred fetching profile:", error);
      return { success: false, error: error.message };
    }
  };

  // Update user profile (only first_name and last_name for now)
  const updateUserProfile = async (userId, updates) => {
    try {
      // Only allow first_name and last_name updates for now
      const allowedUpdates = {};
      if (updates.first_name !== undefined)
        allowedUpdates.first_name = updates.first_name;
      if (updates.last_name !== undefined)
        allowedUpdates.last_name = updates.last_name;

      const { data, error } = await supabase
        .from("profiles")
        .update(allowedUpdates)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("An error occurred updating profile:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        signUpNewUser,
        signInUser,
        signOut,
        loading,
        getUserProfile,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
