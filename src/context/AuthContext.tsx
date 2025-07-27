/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [loading, setLoading] = useState(true);

  // Sign up function - fixed naming to match usage
  const signUpNewUser = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        console.error("there was a problem signing up:", error);
        return { success: false, error: error.message };
      }

      console.log("Sign-up successful:", data);
      return { success: true, data };
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

  return (
    <AuthContext.Provider
      value={{
        session,
        signUpNewUser,
        signInUser,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
