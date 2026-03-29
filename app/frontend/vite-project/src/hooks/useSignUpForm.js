import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getPasswordStrength, isPasswordStrong } from '../utils/passwordStrength';

/**
 * Single Responsibility: owns all sign-up form state, derived validation, and submit logic.
 * Dependency Inversion: SignUpPage depends on this hook, not raw useState/useAuth calls.
 */
export function useSignUpForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const strength = getPasswordStrength(form.password);
  const allPassed = isPasswordStrong(form.password);
  const matches = form.password === form.confirm;
  const canSubmit = allPassed && matches && form.name && form.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      await register(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { form, update, showPw, setShowPw, showConfirm, setShowConfirm, strength, allPassed, matches, canSubmit, error, loading, handleSubmit };
}
