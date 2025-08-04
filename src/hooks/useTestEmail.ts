
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * A hook for sending a test email using the current SMTP settings.
 * Expects a Supabase edge function named "send-smtp-test-email".
 * Returns { sendTestEmail, loading, success, error }
 */
export function useTestEmail() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendTestEmail = async (toEmail: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Edge function call (must exist on Supabase)
    const { data, error } = await supabase.functions.invoke("send-smtp-test-email", {
      body: { to: toEmail }
    });

    if (!error && data?.ok) {
      setSuccess("Test email sent successfully!");
    } else {
      setError(
        error?.message ||
          data?.error ||
          "Failed to send test email. Please check your SMTP credentials and try again."
      );
    }
    setLoading(false);
  };

  return { sendTestEmail, loading, success, error };
}
