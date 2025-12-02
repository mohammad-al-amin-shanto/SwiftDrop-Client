// src/pages/profile/ProfilePage.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { setUser } from "../../lib/storage";
import { setAuth } from "../../features/auth/authSlice";
import { toast } from "react-toastify";
import { FaUserCircle, FaRegCopy, FaCheck, FaSignOutAlt } from "react-icons/fa";
import type { User } from "../../types";

/**
 * Simple copy helper that falls back gracefully.
 */
async function copyToClipboard(text: string) {
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    return true;
  } catch {
    return false;
  }
}

type EditFormValues = {
  name: string;
  email: string;
};

type PWFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

/**
 * Local user type that augments backend User with optional shortId.
 * Adjust according to your real User shape in src/types.
 */
type UserWithShortId = (User & { shortId?: string }) | null;

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => (s.auth ? s.auth.token : null)) as
    | string
    | null;
  const user = useAppSelector((s) =>
    s.auth ? s.auth.user : null
  ) as UserWithShortId;

  // Defensive defaults
  const name = (user?.name as string) ?? "";
  const email = (user?.email as string) ?? "";
  const shortId = (user?.shortId as string) ?? "";
  const role = (user?.role as string) ?? "user";

  // Edit form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: saving },
    reset: resetEditForm,
  } = useForm<EditFormValues>({ defaultValues: { name, email } });

  // Password form (modal)
  const {
    register: registerPw,
    handleSubmit: handlePwSubmit,
    formState: { errors: pwErrors, isSubmitting: pwSubmitting },
    reset: resetPwForm,
  } = useForm<PWFormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // local UI state
  const [copied, setCopied] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [pwOpen, setPwOpen] = React.useState(false);

  React.useEffect(() => {
    // whenever user changes in store, reset form to latest
    resetEditForm({ name, email });
  }, [name, email, resetEditForm]);

  const onSaveProfile = (vals: EditFormValues) => {
    // Update local storage + redux so UI shows changes immediately.
    // IMPORTANT: this only updates client state. To persist server-side you
    // should call your update-user endpoint and then update storage with the returned user.
    const updated: UserWithShortId = {
      ...(user ?? ({} as User)),
      name: vals.name,
      email: vals.email,
    } as UserWithShortId;

    try {
      setUser(updated);

      // Create a well-typed payload for setAuth so we avoid `any`.
      const authPayload: { token: string | null; user: UserWithShortId } = {
        token: token ?? null,
        user: updated,
      };

      dispatch(setAuth(authPayload));

      toast.success(
        "Profile updated locally. To persist changes, call your API."
      );
      setEditing(false);
    } catch (e) {
      console.error("failed to save user locally", e);
      toast.error("Could not save profile locally.");
    }
  };

  const onCopyId = async () => {
    const ok = await copyToClipboard(shortId);
    if (ok) {
      setCopied(true);
      toast.success("User ID copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (e) {
      console.warn(e);
    }
    dispatch(setAuth({ token: null, user: null }));
    toast.info("Logged out");
    window.location.href = "/";
  };

  const onChangePassword = async (vals: PWFormValues) => {
    if (vals.newPassword !== vals.confirmPassword) {
      toast.error("New password and confirm do not match");
      return;
    }

    // If you have a change-password endpoint, call it here (recommended).
    // Example: await changePasswordApi({ currentPassword: vals.currentPassword, newPassword: vals.newPassword });
    toast.info(
      "Password change requires backend endpoint. Add API call to persist."
    );
    resetPwForm();
    setPwOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: profile card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-4xl text-slate-600 dark:text-slate-200 mb-4">
            <FaUserCircle />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold">{name || "Unnamed user"}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
              {email || "No email set"}
            </p>
          </div>

          <div className="mt-5 w-full">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  User ID
                </div>
                <div className="font-mono font-semibold">{shortId || "—"}</div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={onCopyId}
                  className="inline-flex items-center gap-2 px-3 py-1 border rounded text-sm hover:bg-slate-50 dark:hover:bg-slate-900"
                  aria-label="Copy user id"
                >
                  <FaRegCopy /> {copied ? <FaCheck /> : "Copy"}
                </button>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {role?.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => setPwOpen(true)}
                className="w-full inline-flex justify-center items-center px-3 py-2 rounded border text-sm hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Change password
              </button>

              <button
                onClick={handleLogout}
                className="w-full inline-flex justify-center items-center px-3 py-2 rounded bg-red-600 text-white text-sm"
                aria-label="Log out"
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Right: details and edit form (spans 2 cols on md) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Account details</h3>
              <div className="text-sm text-slate-500 dark:text-slate-300">
                Manage your profile
              </div>
            </div>

            <div className="mt-4">
              {!editing ? (
                <>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs text-slate-500 dark:text-slate-400">
                        Full name
                      </dt>
                      <dd className="mt-1 font-medium">{name || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500 dark:text-slate-400">
                        Email
                      </dt>
                      <dd className="mt-1 font-medium">{email || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500 dark:text-slate-400">
                        User ID
                      </dt>
                      <dd className="mt-1 font-mono">{shortId || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500 dark:text-slate-400">
                        Role
                      </dt>
                      <dd className="mt-1 font-medium">{role}</dd>
                    </div>
                  </dl>

                  <div className="mt-6">
                    <button
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded bg-sky-600 text-white"
                    >
                      Edit profile
                    </button>
                  </div>
                </>
              ) : (
                <form
                  onSubmit={handleSubmit(onSaveProfile)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">
                      Full name
                    </label>
                    <input
                      {...register("name", { required: "Name required" })}
                      defaultValue={name}
                      className="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">
                      Email
                    </label>
                    <input
                      {...register("email", { required: "Email required" })}
                      defaultValue={email}
                      type="email"
                      className="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded bg-sky-600 text-white"
                    >
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetEditForm({ name, email });
                        setEditing(false);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded border"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Security / history card (placeholder) */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h4 className="font-semibold mb-2">Security</h4>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Your password is stored securely and cannot be displayed here. Use
              "Change password" to update it.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setPwOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-amber-500 text-white"
              >
                Change password
              </button>
              <button
                onClick={() => toast.info("Two-factor auth not implemented")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border"
              >
                Two-factor auth (coming)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password modal (simple) */}
      {pwOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setPwOpen(false)}
          />
          <div className="relative max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow p-6 z-10">
            <h3 className="text-lg font-semibold mb-2">Change password</h3>
            <form
              onSubmit={handlePwSubmit(onChangePassword)}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm mb-1">Current password</label>
                <input
                  {...registerPw("currentPassword", {
                    required: "Current password required",
                  })}
                  type="password"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                {pwErrors.currentPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {pwErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">New password</label>
                <input
                  {...registerPw("newPassword", {
                    required: "New password required",
                    minLength: { value: 6, message: "Min 6 chars" },
                  })}
                  type="password"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                {pwErrors.newPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {pwErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Confirm new password
                </label>
                <input
                  {...registerPw("confirmPassword", {
                    required: "Confirm password required",
                  })}
                  type="password"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                {pwErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {pwErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetPwForm();
                    setPwOpen(false);
                  }}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwSubmitting}
                  className="px-4 py-2 rounded bg-sky-600 text-white"
                >
                  {pwSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
