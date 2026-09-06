"use client";

import { clearAuthCache } from "@/services/auth-session-cache";
import { signupAPI } from "@/services/user/mutation";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  fieldClassName,
  primaryButtonClassName,
  serverErrorClassName,
} from "@/utils/form-styles";
import {
  signupFormSchema,
  type SignupFormValues,
} from "@/utils/validations/signup-form";
import { showFieldError } from "@/utils/validations/show-field-error";
import { getZodFormErrors } from "@/utils/validations/to-formik-validate";
import { showSuccessToast } from "@/utils/toast";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik, type FormikHelpers } from "formik";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const initialValues: SignupFormValues = {
  name: "",
  email: "",
  password: "",
};

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const { mutateAsync: signup, isPending } = useMutation({
    mutationKey: ["signup"],
    mutationFn: signupAPI,
  });

  async function handleSubmit(
    values: SignupFormValues,
    { setErrors, setSubmitting, setTouched }: FormikHelpers<SignupFormValues>,
  ) {
    setServerError("");

    const parsed = signupFormSchema.safeParse(values);
    if (!parsed.success) {
      setTouched({ name: true, email: true, password: true }, false);
      setErrors(getZodFormErrors(parsed.error));
      setSubmitting(false);
      return;
    }

    setSubmitting(true);

    try {
      await signup(parsed.data);

      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        showSuccessToast("Account created successfully");
        setServerError("Account created. Sign in to continue.");
        router.push("/auth/login");
        router.refresh();
        return;
      }

      showSuccessToast("Account created successfully");
      clearAuthCache();
      router.push("/boards");
      router.refresh();
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          "Could not create your account. Please try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({
        errors,
        handleBlur,
        handleChange,
        isSubmitting,
        submitCount,
        touched,
        values,
      }) => (
        <Form className="flex flex-col gap-5" noValidate>
          {serverError && <p className={serverErrorClassName}>{serverError}</p>}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              value={values.name}
              onChange={(event) => {
                handleChange(event);
                if (serverError) setServerError("");
              }}
              onBlur={handleBlur}
              aria-invalid={showFieldError(errors.name, touched.name, submitCount)}
              aria-describedby={
                showFieldError(errors.name, touched.name, submitCount)
                  ? "name-error"
                  : undefined
              }
              className={fieldClassName}
            />
            {showFieldError(errors.name, touched.name, submitCount) && (
              <p id="name-error" className="text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={(event) => {
                handleChange(event);
                if (serverError) setServerError("");
              }}
              onBlur={handleBlur}
              aria-invalid={showFieldError(errors.email, touched.email, submitCount)}
              aria-describedby={
                showFieldError(errors.email, touched.email, submitCount)
                  ? "email-error"
                  : undefined
              }
              className={fieldClassName}
            />
            {showFieldError(errors.email, touched.email, submitCount) && (
              <p id="email-error" className="text-sm text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.password}
              onChange={(event) => {
                handleChange(event);
                if (serverError) setServerError("");
              }}
              onBlur={handleBlur}
              aria-invalid={showFieldError(
                errors.password,
                touched.password,
                submitCount,
              )}
              aria-describedby={
                showFieldError(errors.password, touched.password, submitCount)
                  ? "password-error"
                  : "password-hint"
              }
              className={fieldClassName}
            />
            {showFieldError(errors.password, touched.password, submitCount) ? (
              <p id="password-error" className="text-sm text-red-600 dark:text-red-400">
                {errors.password}
              </p>
            ) : (
              <p id="password-hint" className="text-sm text-zinc-500 dark:text-zinc-400">
                Must be at least 8 characters.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isPending}
            className={`${primaryButtonClassName} h-11 w-full`}
          >
            {isSubmitting || isPending ? "Creating account…" : "Create account"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
