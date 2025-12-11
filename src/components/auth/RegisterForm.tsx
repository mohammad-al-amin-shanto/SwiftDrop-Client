import React from "react";
import { useForm } from "react-hook-form";
import { useRegisterMutation } from "../../api/authApi";
import { useAppDispatch } from "../../app/hooks";
import { setAuth } from "../../features/auth/authSlice";
import { setToken, setUser } from "../../lib/storage";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import type { User } from "../../types";

/** Short id generator (same approach as LoginForm) */
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
  name: string;
  email: string;
  password: string;
  role: "sender" | "receiver";
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

const RegisterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<FormValues>({
    defaultValues: { name: "", email: "", password: "", role: "sender" },
  });

  const [registerApi] = useRegisterMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Focus first input on mount for better UX
  React.useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  const onSubmit = async (payload: FormValues) => {
    try {
      const res = await registerApi(payload).unwrap();
      const token = res?.token ?? "";
      const userCandidate = (res?.user ?? null) as User | null;

      if (!token) {
        toast.error("Registration response missing token.");
        return;
      }

      if (!userCandidate) {
        // fallback: persist token only
        setToken(token);
        toast.warn("Registered but user data missing. Contact support.");
        navigate("/", { replace: true });
        return;
      }

      // ensure shortId exists and keep immutability
      const user = userCandidate as UserWithShortId;
      const storedUser: UserWithShortId = {
        ...user,
        shortId:
          (user.shortId && String(user.shortId).trim()) || generateShortId(8),
      };

      // persist token and user, update redux
      setToken(token);
      setUser(storedUser);
      dispatch(setAuth({ token, user: storedUser }));

      toast.success("Account created — welcome!");

      // role-based redirect
      const role = normalizeRole(storedUser.role);
      if (role === "admin") navigate("/dashboard/admin", { replace: true });
      else if (role === "sender")
        navigate("/dashboard/sender", { replace: true });
      else if (role === "receiver")
        navigate("/dashboard/receiver", { replace: true });
      else navigate("/", { replace: true });
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
              Create an account
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-300 mb-6">
              Sign up as a sender or receiver. You'll get a User ID for quick
              sharing.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
                >
                  Full name
                </label>
                <input
                  id="name"
                  {...register("name", { required: "Name required" })}
                  type="text"
                  placeholder="Your full name"
                  className="w-full rounded-md border px-3 py-2 text-sm placeholder:text-slate-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && (
                  <p role="alert" className="mt-1 text-xs text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  {...register("email", { required: "Email required" })}
                  type="email"
                  placeholder="you@company.com"
                  className="w-full rounded-md border px-3 py-2 text-sm placeholder:text-slate-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p role="alert" className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  {...register("password", {
                    required: "Password required",
                    minLength: { value: 6, message: "Min 6 chars" },
                  })}
                  type="password"
                  placeholder="Create a password (min 6 chars)"
                  className="w-full rounded-md border px-3 py-2 text-sm placeholder:text-slate-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password && (
                  <p role="alert" className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
                >
                  Role
                </label>
                <select
                  id="role"
                  {...register("role")}
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <option value="sender">Sender</option>
                  <option value="receiver">Receiver</option>
                </select>
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center items-center rounded-md bg-sky-600 text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
                >
                  {isSubmitting ? "Creating..." : "Create account"}
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-4 text-center text-sm">
              <span className="text-slate-600 dark:text-slate-300">
                Already have an account?{" "}
              </span>
              <a
                href="/auth/login"
                className="text-sky-600 font-medium hover:underline"
              >
                Sign in
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          By creating an account you agree to our terms and privacy policy.
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
