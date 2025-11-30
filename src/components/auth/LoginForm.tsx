// src/components/auth/LoginForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "../../api/authApi";
import { useAppDispatch } from "../../app/hooks";
import { setAuth } from "../../features/auth/authSlice";
import { setToken, setUser } from "../../lib/storage";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import type { User } from "../../types";

type FormValues = {
  email: string;
  password: string;
};

/** Safe extractor for error messages (no `any`) */
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

/** Normalize backend role value into one of: admin | sender | receiver | null */
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

const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { email: "", password: "" } });

  const [login] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (payload: FormValues) => {
    try {
      const res = await login(payload).unwrap(); // expects { token, user }

      // Defensive checks: ensure token and user exist
      const token = res?.token ?? "";
      const userCandidate = res?.user ?? null;

      if (!token) {
        toast.error("Login response missing token.");
        return;
      }

      if (!userCandidate) {
        // store token only (best-effort) and inform user/admin
        setToken(token);
        toast.warn(
          "Logged in but user data missing. Please contact support or try again."
        );
        // Navigate to a safe fallback (home) — do not call setAuth with null user
        navigate("/", { replace: true });
        return;
      }

      // At this point TypeScript knows userCandidate is not null
      const user = userCandidate as User;

      // persist and update redux
      setToken(token);
      setUser(user);
      dispatch(setAuth({ token, user }));
      toast.success("Logged in");

      console.debug("login response user:", user);

      // robust role handling
      const role = normalizeRole(user.role);
      if (role === "admin") navigate("/dashboard/admin", { replace: true });
      else if (role === "sender")
        navigate("/dashboard/sender", { replace: true });
      else if (role === "receiver")
        navigate("/dashboard/receiver", { replace: true });
      else navigate("/", { replace: true });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto bg-white dark:bg-slate-800 p-6 rounded shadow"
    >
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      <label className="block mb-3">
        <div className="text-sm mb-1">Email</div>
        <input
          {...register("email", { required: "Email required" })}
          type="email"
          className="input"
        />
        {errors.email && (
          <div className="text-xs text-red-500 mt-1">
            {errors.email.message}
          </div>
        )}
      </label>

      <label className="block mb-3">
        <div className="text-sm mb-1">Password</div>
        <input
          {...register("password", { required: "Password required" })}
          type="password"
          className="input"
        />
        {errors.password && (
          <div className="text-xs text-red-500 mt-1">
            {errors.password.message}
          </div>
        )}
      </label>

      <div className="flex items-center justify-between mt-4">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
        <a href="/auth/register" className="text-sm text-sky-600">
          Create account
        </a>
      </div>
    </form>
  );
};

export default LoginForm;
