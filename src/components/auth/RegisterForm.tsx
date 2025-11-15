// src/components/auth/RegisterForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { useRegisterMutation } from "../../api/authApi";
import { useAppDispatch } from "../../app/hooks";
import { setAuth } from "../../features/auth/authSlice";
import { setToken, setUser } from "../../lib/storage";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

type FormValues = {
  name: string;
  email: string;
  password: string;
  role: "sender" | "receiver";
};

/** Safe error extractor (no `any`) */
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

const RegisterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: "", email: "", password: "", role: "sender" },
  });

  const [registerApi] = useRegisterMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (payload: FormValues) => {
    try {
      const res = await registerApi(payload).unwrap(); // expects { token, user }

      // persist token & user using lib/storage helpers
      setToken(res.token);
      setUser(res.user);

      // update redux auth slice
      dispatch(setAuth({ token: res.token, user: res.user }));

      toast.success("Registered");

      // redirect based on role
      if (res.user?.role === "sender") navigate("/dashboard/sender");
      else navigate("/");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto bg-white dark:bg-slate-800 p-6 rounded shadow"
    >
      <h2 className="text-xl font-semibold mb-4">Create an account</h2>

      <label className="block mb-3">
        <div className="text-sm mb-1">Full name</div>
        <input
          {...register("name", { required: "Name required" })}
          className="input"
        />
        {errors.name && (
          <div className="text-xs text-red-500 mt-1">{errors.name.message}</div>
        )}
      </label>

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
          {...register("password", {
            required: "Password required",
            minLength: { value: 6, message: "Min 6 chars" },
          })}
          type="password"
          className="input"
        />
        {errors.password && (
          <div className="text-xs text-red-500 mt-1">
            {errors.password.message}
          </div>
        )}
      </label>

      <label className="block mb-3">
        <div className="text-sm mb-1">Role</div>
        <select {...register("role")} className="input">
          <option value="sender">Sender</option>
          <option value="receiver">Receiver</option>
        </select>
      </label>

      <div className="flex justify-between items-center mt-4">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Creating..." : "Create account"}
        </button>
        <a href="/auth/login" className="text-sm text-sky-600">
          Sign in
        </a>
      </div>
    </form>
  );
};

export default RegisterForm;
