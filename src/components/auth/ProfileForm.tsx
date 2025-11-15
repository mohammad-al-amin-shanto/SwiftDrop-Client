// src/components/auth/ProfileForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { useUpdateUserMutation } from "../../api/usersApi";
import { setAuth } from "../../features/auth/authSlice";
import { setUser } from "../../lib/storage";
import { toast } from "react-toastify";

type FormValues = {
  name: string;
  email: string;
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

const ProfileForm: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });
  const [updateUser] = useUpdateUserMutation();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    reset({ name: user?.name ?? "", email: user?.email ?? "" });
  }, [user, reset]);

  const onSubmit = async (payload: FormValues) => {
    if (!user) {
      toast.error("No user found");
      return;
    }

    try {
      const updated = await updateUser({
        id: user._id,
        body: payload,
      }).unwrap();

      // preserve token from storage (if present) — ensure it's a string
      const token = localStorage.getItem("swiftdrop_token") || "";

      // update redux auth slice and local storage user
      dispatch(
        setAuth({
          token,
          user: updated,
        })
      );

      setUser(updated);
      toast.success("Profile updated");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg mx-auto bg-white dark:bg-slate-800 p-6 rounded shadow"
    >
      <h3 className="text-lg font-semibold mb-4">Profile</h3>

      <label className="block mb-3">
        <div className="text-sm mb-1">Full name</div>
        <input
          {...register("name", { required: "Name required" })}
          className="input"
        />
      </label>

      <label className="block mb-3">
        <div className="text-sm mb-1">Email</div>
        <input
          {...register("email", { required: "Email required" })}
          className="input"
        />
      </label>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          Save
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
