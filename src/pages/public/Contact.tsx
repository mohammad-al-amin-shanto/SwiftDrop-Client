import React from "react";
import { useForm } from "react-hook-form";
import { AppShell } from "../../components/layout/AppShell";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { toast } from "react-toastify";

type FormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const Contact: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      console.log("Contact form submitted:", data);
      await new Promise((res) => setTimeout(res, 800));
      toast.success("Message sent. We will get back to you shortly!");
      reset();
    } catch (err: unknown) {
      console.error("Contact form submit failed:", err);
      toast.error("Failed to send message — please try again");
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold mb-2">Contact us</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Questions, partnerships, or support — we’re here to help. Fill the
          form or drop us an email at{" "}
          <a className="text-sky-600" href="mailto:support@swiftdrop.example">
            support@swiftdrop.example
          </a>
          .
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white dark:bg-slate-800 p-6 rounded shadow space-y-4"
          >
            <div>
              <Input
                {...(register("name", {
                  required: true,
                }) as unknown as React.InputHTMLAttributes<HTMLInputElement>)}
                placeholder="Your name"
              />
            </div>

            <div>
              <Input
                {...(register("email", {
                  required: true,
                }) as unknown as React.InputHTMLAttributes<HTMLInputElement>)}
                placeholder="Your email"
                type="email"
              />
            </div>

            <div>
              <Input
                {...(register("subject", {
                  required: true,
                }) as unknown as React.InputHTMLAttributes<HTMLInputElement>)}
                placeholder="Subject"
              />
            </div>

            <div>
              <textarea
                {...(register("message", {
                  required: true,
                }) as unknown as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                rows={6}
                placeholder="Your message"
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send message"}
              </Button>
            </div>
          </form>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded shadow">
              <h3 className="font-semibold">Support</h3>
              <p className="text-sm text-gray-500 mt-2">
                support@swiftdrop.example
              </p>
              <p className="text-sm text-gray-500 mt-2">Mon–Fri, 9:00–18:00</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded shadow">
              <h3 className="font-semibold">Office</h3>
              <p className="text-sm text-gray-500 mt-2">
                123 Swift Street, Dhaka, Bangladesh
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded shadow">
              <h3 className="font-semibold">Press</h3>
              <p className="text-sm text-gray-500 mt-2">
                press@swiftdrop.example
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Contact;
