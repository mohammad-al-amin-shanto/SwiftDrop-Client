// src/components/parcels/CreateParcelForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { useCreateParcelMutation } from "../../api/parcelsApi";
import { toast } from "react-toastify";
import type { ParcelCreateDto } from "../../types";

type FormValues = {
  // Sender
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  // Receiver
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  // Parcel details
  weightKg: number;
  dimensions: string;
  declaredValue: number;
  note?: string;
};

const defaults: FormValues = {
  senderName: "",
  senderPhone: "",
  senderAddress: "",
  receiverName: "",
  receiverPhone: "",
  receiverAddress: "",
  weightKg: 0,
  dimensions: "",
  declaredValue: 0,
  note: "",
};

/** Narrowly-typed shape we expect many API errors to follow */
function isApiError(
  obj: unknown
): obj is { data?: { message?: string }; message?: string } {
  return typeof obj === "object" && obj !== null;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (isApiError(err)) {
    if (err.data && typeof err.data.message === "string")
      return err.data.message;
    if (typeof err.message === "string") return err.message;
  }
  return "Failed to create parcel";
}

export const CreateParcelForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState, // we'll use formState.errors to show validation messages
  } = useForm<FormValues>({
    defaultValues: defaults,
    mode: "onTouched",
  });

  const [createParcel, { isLoading }] = useCreateParcelMutation();

  const mapToDto = (values: FormValues): ParcelCreateDto => {
    return {
      receiverEmail: undefined,
      origin: values.senderAddress,
      destination: values.receiverAddress,
      weight: values.weightKg,
      cost: values.declaredValue,
      note: values.note,
    };
  };

  const onSubmit = async (payload: FormValues) => {
    try {
      const dto = mapToDto(payload);
      const created = await createParcel(dto).unwrap();
      toast.success(`Parcel created — tracking ID: ${created.trackingId}`);
      reset(defaults);
      // Optionally navigate to a details page or update UI
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      toast.error(message);
    }
  };

  return (
    <form
      className="max-w-2xl mx-auto p-4 bg-white dark:bg-slate-800 rounded-lg shadow"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <h3 className="text-lg font-semibold mb-4">Create Parcel Request</h3>

      {/* Sender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <input
            {...register("senderName", { required: "Sender name is required" })}
            placeholder="Sender name"
            className="input"
          />
          {formState.errors.senderName && (
            <p className="text-sm text-red-500 mt-1">
              {formState.errors.senderName.message}
            </p>
          )}
        </div>

        <div>
          <input
            {...register("senderPhone", { required: "Sender phone required" })}
            placeholder="Sender phone"
            className="input"
          />
          {formState.errors.senderPhone && (
            <p className="text-sm text-red-500 mt-1">
              {formState.errors.senderPhone.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <input
            {...register("senderAddress", {
              required: "Sender address required",
            })}
            placeholder="Sender address"
            className="input w-full"
          />
          {formState.errors.senderAddress && (
            <p className="text-sm text-red-500 mt-1">
              {formState.errors.senderAddress.message}
            </p>
          )}
        </div>
      </div>

      {/* Receiver */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <input
            {...register("receiverName", {
              required: "Receiver name is required",
            })}
            placeholder="Receiver name"
            className="input"
          />
          {formState.errors.receiverName && (
            <p className="text-sm text-red-500 mt-1">
              {formState.errors.receiverName.message}
            </p>
          )}
        </div>

        <div>
          <input
            {...register("receiverPhone", {
              required: "Receiver phone required",
            })}
            placeholder="Receiver phone"
            className="input"
          />
          {formState.errors.receiverPhone && (
            <p className="text-sm text-red-500 mt-1">
              {formState.errors.receiverPhone.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <input
            {...register("receiverAddress", {
              required: "Receiver address required",
            })}
            placeholder="Receiver address"
            className="input w-full"
          />
          {formState.errors.receiverAddress && (
            <p className="text-sm text-red-500 mt-1">
              {formState.errors.receiverAddress.message}
            </p>
          )}
        </div>
      </div>

      {/* Parcel details */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <input
            type="number"
            step="0.1"
            {...register("weightKg", {
              valueAsNumber: true,
              min: { value: 0.01, message: "Weight must be positive" },
            })}
            placeholder="Weight (kg)"
            className="input"
          />
          {formState.errors.weightKg && (
            <p className="text-sm text-red-500 mt-1">
              {formState.errors.weightKg.message}
            </p>
          )}
        </div>

        <div>
          <input
            {...register("dimensions")}
            placeholder="Dimensions (L×W×H)"
            className="input"
          />
        </div>

        <div>
          <input
            type="number"
            step="0.01"
            {...register("declaredValue", {
              valueAsNumber: true,
              min: { value: 0, message: "Declared value must be >= 0" },
            })}
            placeholder="Declared value (BDT)"
            className="input"
          />
          {formState.errors.declaredValue && (
            <p className="text-sm text-red-500 mt-1">
              {formState.errors.declaredValue.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <textarea
          {...register("note")}
          placeholder="Note (optional)"
          className="input mt-2 h-24 w-full"
        />
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => reset(defaults)}
          className="btn-outline"
        >
          Reset
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Parcel"}
        </button>
      </div>
    </form>
  );
};

export default CreateParcelForm;
