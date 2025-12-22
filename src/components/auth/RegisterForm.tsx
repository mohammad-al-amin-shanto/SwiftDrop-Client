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
  confirmPassword: string; // ✅ NEW
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

/**
 * Extend User locally without touching global type
 */
type UserWithShortId = User & { shortId?: string };

const RegisterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "sender",
    },
  });

  const passwordValue = watch("password");

  const [registerApi] = useRegisterMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  React.useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  const onSubmit = async (payload: FormValues) => {
    try {
      const { name, email, password, role } = payload;

      const res = await registerApi({
        name,
        email,
        password,
        role,
      }).unwrap();

      const token = res?.token ?? "";
      const userCandidate = res?.user as UserWithShortId | null;

      if (!token) {
        toast.error("Registration response missing token.");
        return;
      }

      if (!userCandidate) {
        setToken(token);
        toast.warn("Registered but user data missing. Contact support.");
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

      toast.success("Account created — welcome!");

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
              Create an account
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-300 mb-6">
              Sign up as a sender or receiver. You'll get a User ID for quick
              sharing.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full name
                </label>
                <input
                  {...register("name", { required: "Name required" })}
                  className="w-full rounded-md border px-3 py-2"
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  {...register("email", { required: "Email required" })}
                  type="email"
                  className="w-full rounded-md border px-3 py-2"
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  {...register("password", {
                    required: "Password required",
                    minLength: { value: 6, message: "Min 6 chars" },
                  })}
                  type="password"
                  className="w-full rounded-md border px-3 py-2"
                />
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm password
                </label>
                <input
                  {...register("confirmPassword", {
                    required: "Confirm your password",
                    validate: (v) =>
                      v === passwordValue || "Passwords do not match",
                  })}
                  type="password"
                  className="w-full rounded-md border px-3 py-2"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  {...register("role")}
                  className="w-full rounded-md border px-3 py-2"
                >
                  <option value="sender">Sender</option>
                  <option value="receiver">Receiver</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-sky-600 text-white py-2 rounded-md"
              >
                {isSubmitting ? "Creating..." : "Create account"}
              </button>
            </form>

            <div className="mt-6 border-t pt-4 text-center text-sm">
              <span>Already have an account? </span>
              <a
                href="/auth/login"
                className="text-sky-600 font-medium hover:underline"
              >
                Sign in
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          By creating an account you agree to our terms and privacy policy.
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
