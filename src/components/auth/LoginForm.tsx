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
    // fallback
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

function normalizeRole(
  roleLike: unknown
): "admin" | "sender" | "receiver" | null {
  if (!roleLike) return null;
  const s = String(roleLike).trim().toLowerCase();
  if (s.includes("admin")) return "admin";
  if (s.includes("sender")) return "sender";
  if (s.includes("receiver")) return "receiver";
  return null;
}

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

  // UX state
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    // focus first field on mount
    setFocus("emailOrId");
  }, [setFocus]);

  const onSubmit = async (payload: FormValues) => {
    try {
      const res = await login({
        email: payload.emailOrId,
        password: payload.password,
      }).unwrap();

      const token = res?.token ?? "";
      const userCandidate = (res?.user ?? null) as User | null;

      if (!token) {
        toast.error("Login response missing token.");
        return;
      }

      if (!userCandidate) {
        // persist token only (best-effort)
        setToken(token);
        toast.warn("Logged in but user data missing. Contact support.");
        navigate("/", { replace: true });
        return;
      }

      const user = userCandidate as UserWithShortId;
      const storedUser: UserWithShortId = {
        ...user,
        shortId:
          (user.shortId && String(user.shortId).trim()) || generateShortId(8),
      };

      // persist and update redux
      setToken(token);
      setUser(storedUser);
      dispatch(setAuth({ token, user: storedUser }));

      toast.success("Welcome back!");

      if (onSuccess) {
        try {
          onSuccess();
        } catch (e) {
          // non-fatal

          console.warn("onSuccess threw:", e);
        }
        return;
      }

      // fallback: role-based redirect
      const role = normalizeRole(storedUser.role);
      if (role === "admin") navigate("/dashboard/admin", { replace: true });
      else if (role === "receiver")
        navigate("/dashboard/receiver", { replace: true });
      else navigate("/dashboard/sender", { replace: true });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      toast.error(msg);
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
              {/* Email or ID */}
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
                  className={`w-full rounded-md border px-3 py-2 text-sm placeholder:text-slate-400 
                    bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent`}
                  aria-invalid={errors.emailOrId ? "true" : "false"}
                />
                {errors.emailOrId && (
                  <p role="alert" className="mt-1 text-xs text-red-500">
                    {errors.emailOrId.message}
                  </p>
                )}
              </div>

              {/* Password + show toggle */}
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
                    {...register("password", { required: "Password required" })}
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    className={`w-full rounded-md border px-3 py-2 text-sm placeholder:text-slate-400 
                      bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent pr-12`}
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p role="alert" className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Row: remember + forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <input
                    {...register("remember")}
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span>Remember me</span>
                </label>

                <a href="/auth/forgot" className="text-sky-600 hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center items-center rounded-md bg-sky-600 text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
                >
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-4 text-center text-sm">
              <span className="text-slate-600 dark:text-slate-300">
                Don't have an account?{" "}
              </span>
              <a
                href="/auth/register"
                className="text-sky-600 font-medium hover:underline"
              >
                Create one
              </a>
            </div>
          </div>
        </div>

        {/* Small footer note */}
        <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          By signing in you agree to our terms and privacy policy.
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
