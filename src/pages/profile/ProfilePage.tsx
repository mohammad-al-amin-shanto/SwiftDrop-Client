// src/pages/profile/ProfilePage.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { setUser } from "../../lib/storage";
import { setAuth } from "../../features/auth/authSlice";
import { toast } from "react-toastify";
import {
  FaUserCircle,
  FaRegCopy,
  FaCheck,
  FaSignOutAlt,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";
import type { User } from "../../types";
import AppShell from "../../components/layout/AppShell";

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

  // ----- Edit profile form -----
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: saving },
    reset: resetEditForm,
  } = useForm<EditFormValues>({
    defaultValues: { name, email },
  });

  // ----- Password form (modal) -----
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

  // keep form in sync with store user changes
  React.useEffect(() => {
    resetEditForm({ name, email });
  }, [name, email, resetEditForm]);

  const onSaveProfile = (vals: EditFormValues) => {
    if (!user) {
      toast.error("No user loaded.");
      return;
    }

    const updated: UserWithShortId = {
      ...user,
      name: vals.name,
      email: vals.email,
    };

    try {
      // Persist to local storage
      setUser(updated);

      // Update redux auth slice
      const authPayload: { token: string | null; user: UserWithShortId } = {
        token: token ?? null,
        user: updated,
      };
      dispatch(setAuth(authPayload));

      toast.success(
        "Profile updated (local only). Hook up your API to persist."
      );
      setEditing(false);
    } catch (e) {
      console.error("failed to save user locally", e);
      toast.error("Could not save profile locally.");
    }
  };

  const onCopyId = async () => {
    if (!shortId) {
      toast.info("No user ID available to copy.");
      return;
    }
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
      toast.error("New password and confirm password do not match.");
      return;
    }

    // TODO: Call real backend endpoint here.
    // Example:
    // await changePasswordApi({
    //   currentPassword: vals.currentPassword,
    //   newPassword: vals.newPassword,
    // }).unwrap();

    toast.success(
      "Password change flow is wired up on the UI. Connect your backend API to persist it."
    );
    resetPwForm();
    setPwOpen(false);
  };

  // Skeleton if somehow profile is opened without user
  if (!user) {
    return (
      <AppShell hideChrome={false}>
        <div className="max-w-xl mx-auto p-6 text-center">
          <div className="inline-flex w-20 h-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-3xl text-slate-400 mb-4">
            <FaUserCircle />
          </div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            No profile loaded
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Please log in again to view your profile details.
          </p>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 rounded bg-sky-600 text-white text-sm"
          >
            Back to home
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* Page heading */}
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
            Your profile
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your personal information, login details, and account
            security.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT COLUMN – Identity + actions */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center md:items-stretch">
            <div className="flex flex-col items-center md:items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-4xl text-slate-500 dark:text-slate-200">
                <FaUserCircle />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {name || "Unnamed user"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {email || "No email set"}
                </p>
                <p className="mt-1 text-xs inline-flex px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200">
                  Role: {role.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="mt-5 w-full border-t border-slate-100 dark:border-slate-700 pt-4 space-y-4">
              {/* User ID + Copy */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    User ID
                  </div>
                  <div className="mt-1 font-mono text-sm text-slate-800 dark:text-slate-100 break-all">
                    {shortId || "—"}
                  </div>
                </div>
                <button
                  onClick={onCopyId}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900"
                  aria-label="Copy user ID"
                >
                  <FaRegCopy className="text-sm" />
                  {copied ? (
                    <>
                      <FaCheck className="text-green-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <span>Copy ID</span>
                  )}
                </button>
              </div>

              {/* Primary actions */}
              <div className="space-y-2">
                <button
                  onClick={() => setPwOpen(true)}
                  className="w-full inline-flex justify-center items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <FaLock />
                  Change password
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full inline-flex justify-center items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                  aria-label="Log out"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN – Details & Security */}
          <section className="md:col-span-2 space-y-6">
            {/* Account details / Edit profile */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    Account details
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Update your basic profile information.
                  </p>
                </div>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs hover:bg-sky-700"
                  >
                    Edit profile
                  </button>
                )}
              </div>

              {/* VIEW MODE */}
              {!editing ? (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">
                      Full name
                    </dt>
                    <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                      {name || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">
                      Email
                    </dt>
                    <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                      {email || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">
                      User ID
                    </dt>
                    <dd className="mt-1 font-mono text-sm">{shortId || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">
                      Role
                    </dt>
                    <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                      {role}
                    </dd>
                  </div>
                </dl>
              ) : (
                // EDIT MODE
                <form
                  onSubmit={handleSubmit(onSaveProfile)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">
                        Full name
                      </label>
                      <input
                        {...register("name", { required: "Name is required" })}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                        {...register("email", {
                          required: "Email is required",
                        })}
                        type="email"
                        className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetEditForm({ name, email });
                        setEditing(false);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Security card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200">
                  <FaShieldAlt />
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
                    Security & sign in
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Keep your account safe with strong passwords and extra
                    checks.
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-300 mb-3">
                Your password is hashed and cannot be displayed. Use{" "}
                <span className="font-medium">Change password</span> whenever
                you think your account might be at risk.
              </p>

              <div className="flex flex-wrap gap-3 mt-2">
                <button
                  onClick={() => setPwOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm hover:bg-amber-600"
                >
                  <FaLock />
                  Change password
                </button>
                <button
                  onClick={() =>
                    toast.info("Two-factor authentication not implemented yet.")
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Two-factor auth (coming soon)
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Password modal */}
        {pwOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="fixed inset-0 bg-black/40"
              onClick={() => {
                resetPwForm();
                setPwOpen(false);
              }}
            />
            <div className="relative max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 z-10">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-1">
                Change password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Enter your current password and choose a new one that’s at least
                6 characters long.
              </p>

              <form
                onSubmit={handlePwSubmit(onChangePassword)}
                className="space-y-3"
              >
                <div>
                  <label className="block text-sm mb-1 text-slate-700 dark:text-slate-200">
                    Current password
                  </label>
                  <input
                    {...registerPw("currentPassword", {
                      required: "Current password is required",
                    })}
                    type="password"
                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  {pwErrors.currentPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {pwErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1 text-slate-700 dark:text-slate-200">
                    New password
                  </label>
                  <input
                    {...registerPw("newPassword", {
                      required: "New password is required",
                      minLength: { value: 6, message: "Min 6 characters" },
                    })}
                    type="password"
                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  {pwErrors.newPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {pwErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1 text-slate-700 dark:text-slate-200">
                    Confirm new password
                  </label>
                  <input
                    {...registerPw("confirmPassword", {
                      required: "Please confirm your new password",
                    })}
                    type="password"
                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  {pwErrors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {pwErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetPwForm();
                      setPwOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pwSubmitting}
                    className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {pwSubmitting ? "Saving…" : "Save password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default ProfilePage;
