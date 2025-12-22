import React from "react";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "../../api/authApi";
import { useAppDispatch } from "../../app/hooks";
import { setAuth } from "../../features/auth/authSlice";
import { setToken, setUser } from "../../lib/storage";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import type { User } from "../../types";

/**
 * Generate an 8-character alphanumeric short id.
 * Uses crypto when available for better randomness.
 */
function generateShortId(length = 8) {
  try {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return Array.from(arr)
      .map((n) => chars[n % chars.length])
      .join("");
  } catch {
    return Math.random()
      .toString(36)
      .slice(2, 2 + length)
      .padEnd(length, "0");
  }
}

type FormValues = {
  emailOrId: string;
  password: string;
  remember?: boolean;
};

function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null) {
    const obj = err as Record<string, unknown>;
    const data = obj["data"];
    if (typeof data === "object" && data !== null) {
      const msg = (data as Record<string, unknown>)["message"];
      if (typeof msg === "string" && msg.trim()) return msg;
    }
    const message = obj["message"];
    if (typeof message === "string" && message.trim()) return message;
  }
  return "An error occurred";
}

/**
 * ✅ FIX 1:
 * Extend User locally instead of modifying global User type
 */
type UserWithShortId = User & { shortId?: string };

const LoginForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<FormValues>({
    defaultValues: { emailOrId: "", password: "", remember: true },
  });

  const [login] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    setFocus("emailOrId");
  }, [setFocus]);

  const onSubmit = async (payload: FormValues) => {
    try {
      const res = await login({
        email: payload.emailOrId,
        password: payload.password,
      }).unwrap();

      const token = res?.token ?? "";
      const userCandidate = res?.user as UserWithShortId | null;

      if (!token) {
        toast.error("Login response missing token.");
        return;
      }

      if (!userCandidate) {
        setToken(token);
        toast.warn("Logged in but user data missing. Contact support.");
        navigate("/", { replace: true });
        return;
      }

      const storedUser: UserWithShortId = {
        ...userCandidate,
        shortId:
          (userCandidate.shortId && String(userCandidate.shortId).trim()) ||
          generateShortId(8),
      };

      setToken(token);
      setUser(storedUser);
      dispatch(setAuth({ token, user: storedUser }));

      toast.success("Welcome back!");

      if (onSuccess) {
        onSuccess();
        return;
      }

      /**
       * ✅ FIX 2:
       * Single redirect authority
       * Role-based routing happens inside AppRoutes
       */
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-[60vh] flex items-start justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-1 text-slate-900 dark:text-white">
              Sign in
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-300 mb-6">
              Use your email or your short user ID to sign in.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="emailOrId"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
                >
                  Email or User ID
                </label>
                <input
                  id="emailOrId"
                  {...register("emailOrId", {
                    required: "Email or user id is required",
                  })}
                  type="text"
                  placeholder="you@company.com or Ab3fG7xZ"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                {errors.emailOrId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.emailOrId.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    {...register("password", {
                      required: "Password required",
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    className="w-full rounded-md border px-3 py-2 pr-12 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" {...register("remember")} />
                  <span>Remember me</span>
                </label>
                <a href="/auth/forgot" className="text-sky-600 hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-sky-600 text-white py-2 rounded-md"
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="mt-6 border-t pt-4 text-center text-sm">
              <span>Don't have an account? </span>
              <a
                href="/auth/register"
                className="text-sky-600 font-medium hover:underline"
              >
                Create one
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          By signing in you agree to our terms and privacy policy.
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
