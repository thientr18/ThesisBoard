import { useState, useCallback } from "react";

export interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit?: (values: T) => void | Promise<void>;
}

interface UseFormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

interface UseFormActions<T> {
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  resetForm: () => void;
}

interface UseFormHelpers<T> {
  validateForm: () => Partial<Record<keyof T, string>>;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
}

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): {
  state: UseFormState<T>;
  actions: UseFormActions<T>;
  helpers: UseFormHelpers<T>;
} {
  const { initialValues, validate, onSubmit } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;
      let fieldValue: any = value;

      if (type === "checkbox") {
        // TypeScript fix: checked only exists on HTMLInputElement
        fieldValue = (e.target as HTMLInputElement).checked;
      }

      setValues((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));
    },
    []
  );

  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const validateForm = useCallback(() => {
    if (validate) {
      const validationErrors = validate(values) || {};
      setErrors(validationErrors);
      return validationErrors;
    }
    setErrors({});
    return {};
  }, [validate, values]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      if (e) e.preventDefault();
      setIsSubmitting(true);
      try {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
          setIsSubmitting(false);
          return;
        }
        if (onSubmit) {
          await onSubmit(values);
        }
      } catch (error) {
        // Optionally handle submission errors here
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, validateForm, values]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    state: {
      values,
      errors,
      isSubmitting,
      isValid,
    },
    actions: {
      handleChange,
      handleSubmit,
      setFieldValue,
      resetForm,
    },
    helpers: {
      validateForm,
      setErrors,
    },
  };
}
