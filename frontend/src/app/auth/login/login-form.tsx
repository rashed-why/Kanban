"use client";

import {
  loginFormSchema,
  type LoginFormValues,
} from "@/utils/validations/login-form";
import { showFieldError } from "@/utils/validations/show-field-error";
import { getZodFormErrors, toFormikValidate } from "@/utils/validations/to-formik-validate";
import { showSuccessToast } from "@/utils/toast";
import {
  fieldClassName,
  primaryButtonClassName,
  serverErrorClassName,
} from "@/utils/form-styles";
import { clearAuthCache } from "@/services/auth-session-cache";
import { Form, Formik, type FormikHelpers } from "formik";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  async function handleSubmit(
    values: LoginFormValues,
    { setErrors, setSubmitting, setTouched }: FormikHelpers<LoginFormValues>,
  ) {
    setServerError("");

    const parsed = loginFormSchema.safeParse(values);
    if (!parsed.success) {
      setTouched({ email: true, password: true }, false);
      setErrors(getZodFormErrors(parsed.error));
      setSubmitting(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError("Invalid email or password.");
        return;
      }

      clearAuthCache();
      showSuccessToast("Signed in successfully");
      router.push("/boards");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validate={toFormikValidate(loginFormSchema)}
      validateOnChange
      validateOnBlur
      onSubmit={handleSubmit}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        isSubmitting,
        setFieldTouched,
        submitCount,
        touched,
        values,
      }) => (
        <Form className="flex flex-col gap-5" noValidate>
          {serverError && <p className={serverErrorClassName}>{serverError}</p>}

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
                void setFieldTouched("email", true, false);
                if (serverError) {
                  setServerError("");
                }
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
              autoComplete="current-password"
              placeholder="••••••••"
              value={values.password}
              onChange={(event) => {
                handleChange(event);
                void setFieldTouched("password", true, false);
                if (serverError) {
                  setServerError("");
                }
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
                  : undefined
              }
              className={fieldClassName}
            />
            {showFieldError(errors.password, touched.password, submitCount) && (
              <p
                id="password-error"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`${primaryButtonClassName} h-11 w-full`}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
