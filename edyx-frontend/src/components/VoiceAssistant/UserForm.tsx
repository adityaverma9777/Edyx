import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { submitVoiceLead } from "../../lib/voiceAssistantApi";
import type { LeadPayload } from "../../lib/voiceAssistantApi";

type UserFormProps = {
  onCompleted: (lead: LeadPayload) => void;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fields = [
  { key: "name", label: "Name", placeholder: "Enter your name", autoComplete: "name" },
  { key: "email", label: "Email", placeholder: "you@example.com", autoComplete: "email" },
  { key: "phone", label: "Phone number", placeholder: "+1 555 123 4567", autoComplete: "tel" },
];

export default function UserForm({ onCompleted }: UserFormProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setters: Record<string, (value: string) => void> = { name: setName, email: setEmail, phone: setPhone };
  const values: Record<string, string> = { name, email, phone };

  const validation = useMemo(() => {
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    return {
      name: name.trim().length >= 2,
      email: emailRegex.test(email.trim()),
      phone: cleanPhone.length >= 10,
      cleanPhone,
    };
  }, [name, email, phone]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!validation.name || !validation.email || !validation.phone) {
      setError("Please enter valid details to continue.");
      return;
    }

    setSubmitting(true);
    const payload: LeadPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: validation.cleanPhone,
      consent,
    };

    try {
      await submitVoiceLead(payload);
      onCompleted(payload);
    } catch (submitError: any) {
      setError(submitError?.message || "Unable to continue right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="voice-content-wrapper voice-form-wrapper">
      <button 
        type="button" 
        className="voice-top-back voice-global-back" 
        onClick={() => navigate('/')} 
      >
        <ArrowLeft size={16} /> Back
      </button>

      <motion.form
      className="voice-card"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <h2>Before we begin</h2>
      <p className="voice-card-subtitle">Share a few details to personalize your assistant experience.</p>

      {fields.map((field, index) => (
        <motion.label
          key={field.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.15 + index * 0.05,
            duration: 0.35,
            ease: "easeOut",
          }}
        >
          <span>{field.label}</span>
          <input
            value={values[field.key]}
            onChange={(e) => setters[field.key](e.target.value)}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
          />
        </motion.label>
      ))}

      <motion.p
        className="voice-safety-note"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        Don't worry, your information is safe and will never be misused.
      </motion.p>

      <label className="voice-checkbox">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>I agree to receive updates, emails, or calls about the platform (optional)</span>
      </label>

      {error && <div className="voice-soft-error">{error}</div>}

      <motion.button
        className="voice-primary-btn"
        type="submit"
        disabled={submitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {submitting ? "Saving..." : "Continue"}
      </motion.button>
    </motion.form>
    </div>
  );
}
