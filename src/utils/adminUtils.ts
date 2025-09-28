import { supabase } from "@/integrations/supabase/client";

/**
 * Check if the current user is an admin
 */
export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("auth_user_id", userId)
      .single();

    if (error || !profile) {
      console.error("Error fetching user profile:", error);
      return false;
    }

    return profile.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

/**
 * Make a user an admin
 */
export const makeUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .upsert(
        { 
          auth_user_id: userId, 
          role: "admin",
          updated_at: new Date().toISOString()
        },
        { onConflict: "auth_user_id" }
      );

    if (error) {
      console.error("Error making user admin:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in makeUserAdmin:", error);
    return false;
  }
};
