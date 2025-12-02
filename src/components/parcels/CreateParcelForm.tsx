// src/components/parcels/CreateParcelForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { useCreateParcelMutation } from "../../api/parcelsApi";
import { toast } from "react-toastify";
import type { ParcelCreateDto } from "../../types";

type FormValues = {
  senderName: string;
  senderPhone: string;
  senderAddress: string;

  // NEW: receiverId (required by backend)
  receiverId: string;

  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;

  weightKg: number;
  dimensions: string;
  declaredValue: number;
  note?: string;
};

const defaults: FormValues = {
  senderName: "",
  senderPhone: "",
  senderAddress: "",
  receiverId: "", // keep empty by default
  receiverName: "",
  receiverPhone: "",
  receiverAddress: "",
  weightKg: 0.5,
  dimensions: "",
  declaredValue: 0,
  note: "",
};

function isApiError(
  obj: unknown
): obj is { data?: { message?: string }; message?: string } {
  return typeof obj === "object" && obj !== null;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (isApiError(err)) {
    if (err.data?.message) return err.data.message;
    if (err.message) return err.message;
  }
  return "Failed to create parcel";
}

/**
 * Map form values to the server DTO expected by your backend.
 * NOTE: backend requires `receiverId` and expects `price` (not cost)
 */
const mapToDto = (values: FormValues): ParcelCreateDto => {
  const weight = Number(values.weightKg ?? 0);
  const price = Number(values.declaredValue ?? 0);

  const dto: ParcelCreateDto & Record<string, unknown> = {
    receiverId: values.receiverId, // required by server
    origin: values.senderAddress || "",
    destination: values.receiverAddress || "",
    weight,
    price,
    note: values.note || "",
  };

  return dto as ParcelCreateDto;
};

export const CreateParcelForm: React.FC = () => {
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: defaults,
    mode: "onTouched",
  });

  const [createParcel, { isLoading }] = useCreateParcelMutation();

  const onSubmit = async (payload: FormValues) => {
    // Client-side validation to match backend expectations
    if (!payload.senderAddress || !payload.receiverAddress) {
      toast.error("Origin and destination addresses are required.");
      return;
    }

    // Backend requires receiverId
    if (!payload.receiverId || !payload.receiverId.trim()) {
      toast.error(
        "Receiver ID is required. Use an existing user ID or implement a lookup to find/create a receiver."
      );
      return;
    }

    // Basic checks for names/phones
    if (!payload.receiverName || !payload.receiverPhone) {
      toast.error("Receiver name and phone are required.");
      return;
    }
    if (!payload.senderName || !payload.senderPhone) {
      toast.error("Sender name and phone are required.");
      return;
    }

    const dto = mapToDto(payload);
    console.debug("Create parcel - outgoing payload:", dto);

    try {
      const created = await createParcel(dto).unwrap();
      toast.success(`Parcel created — Tracking ID: ${created.trackingId}`);
      reset(defaults);
    } catch (err) {
      console.error("createParcel error:", err);
      if (isApiError(err) && err.data) {
        console.error("Server error body:", err.data);
      }
      const msg = getErrorMessage(err);
      toast.error(msg);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto p-4 sm:p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm space-y-6"
    >
      <h3 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-white mb-2">
        Create New Parcel
      </h3>

      {/* Sender Info */}
      <section>
        <h4 className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 mb-3">
          Sender Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            id="senderName"
            label="Sender Name"
            error={formState.errors.senderName?.message}
          >
            <input
              id="senderName"
              {...register("senderName", {
                required: "Sender name is required",
              })}
              className="w-full text-sm sm:text-base border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Full name"
            />
          </Field>

          <Field
            id="senderPhone"
            label="Sender Phone"
            error={formState.errors.senderPhone?.message}
          >
            <input
              id="senderPhone"
              {...register("senderPhone", {
                required: "Sender phone required",
              })}
              className="w-full text-sm sm:text-base border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="+8801XXXXXXXXX"
            />
          </Field>

          <Field
            id="senderAddress"
            label="Sender Address"
            error={formState.errors.senderAddress?.message}
            full
          >
            <input
              id="senderAddress"
              {...register("senderAddress", {
                required: "Sender address required",
              })}
              className="w-full text-sm sm:text-base border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="House, Road, Area, City"
            />
          </Field>
        </div>
      </section>

      {/* Receiver Info */}
      <section>
        <h4 className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 mb-3">
          Receiver Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* NEW: receiverId input */}
          <Field
            id="receiverId"
            label="Receiver User ID (required)"
            error={formState.errors.receiverId?.message}
          >
            <input
              id="receiverId"
              {...register("receiverId", {
                required: "ReceiverId is required by the server",
              })}
              className="w-full text-sm sm:text-base border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Mongo user id (e.g. 63f1e4...)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use an existing user id. If you don't have one implement a lookup
              by phone/email or create the user server-side.
            </p>
          </Field>

          <Field
            id="receiverName"
            label="Receiver Name"
            error={formState.errors.receiverName?.message}
          >
            <input
              id="receiverName"
              {...register("receiverName", {
                required: "Receiver name is required",
              })}
              className="w-full text-sm sm:text-base border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Full name"
            />
          </Field>

          <Field
            id="receiverPhone"
            label="Receiver Phone"
            error={formState.errors.receiverPhone?.message}
          >
            <input
              id="receiverPhone"
              {...register("receiverPhone", {
                required: "Receiver phone required",
              })}
              className="w-full text-sm sm:text-base border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="+8801XXXXXXXXX"
            />
          </Field>

          <Field
            id="receiverAddress"
            label="Receiver Address"
            error={formState.errors.receiverAddress?.message}
            full
          >
            <input
              id="receiverAddress"
              {...register("receiverAddress", {
                required: "Receiver address required",
              })}
              className="w-full text-sm sm:text-base border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="House, Road, Area, City"
            />
          </Field>
        </div>
      </section>

      {/* Parcel Details */}
      <section>
        <h4 className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 mb-3">
          Parcel Details
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field
            id="weightKg"
            label="Weight (kg)"
            error={formState.errors.weightKg?.message}
          >
            <input
              id="weightKg"
              type="number"
              step="0.1"
              {...register("weightKg", {
                valueAsNumber: true,
                min: { value: 0.1, message: "Must be at least 0.1kg" },
              })}
              className="w-full text-sm sm:text-base border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </Field>

          <Field id="dimensions" label="Dimensions (L×W×H)">
            <input
              id="dimensions"
              {...register("dimensions")}
              className="w-full text-sm sm:text-base border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="e.g. 30×20×10 cm"
            />
          </Field>

          <Field
            id="declaredValue"
            label="Declared Value (BDT)"
            error={formState.errors.declaredValue?.message}
          >
            <input
              id="declaredValue"
              type="number"
              step="0.01"
              {...register("declaredValue", {
                valueAsNumber: true,
                min: { value: 0, message: "Cannot be negative" },
              })}
              className="w-full text-sm sm:text-base border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </Field>
        </div>

        <Field id="note" label="Additional Note (optional)" full>
          <textarea
            id="note"
            {...register("note")}
            className="w-full text-sm sm:text-base border rounded px-3 py-2 h-24 resize-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Any special instructions..."
          />
        </Field>
      </section>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => reset(defaults)}
          className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded text-sm sm:text-base
             bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
             hover:bg-slate-50 dark:hover:bg-slate-600
             focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1"
        >
          Reset
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 rounded text-sm sm:text-base bg-sky-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating..." : "Create Parcel"}
        </button>
      </div>
    </form>
  );
};

export default CreateParcelForm;

/* Reusable Field Wrapper */
function Field({
  id,
  label,
  error,
  children,
  full = false,
}: {
  id?: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  const colClass = full ? "sm:col-span-2" : "";
  return (
    <div className={colClass}>
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300"
      >
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
