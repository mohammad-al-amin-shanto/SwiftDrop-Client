// src/pages/public/Faq.tsx
import React, { useMemo, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import Footer from "../../components/layout/Footer";
import Input from "../../components/common/Input";

type FAQ = { q: string; a: string };

const FAQS: FAQ[] = [
  {
    q: "How do I track my parcel?",
    a: "Use the tracking ID provided by the sender. Enter it on the home page or the tracking page to see status updates.",
  },
  {
    q: "What are your pickup hours?",
    a: "Pickup is available same-day in selected areas. Standard pickup window: 9:00–18:00.",
  },
  {
    q: "How is delivery confirmed?",
    a: "Delivery is confirmed by the receiver either via an OTP, signature or mobile confirmation depending on the service chosen.",
  },
  {
    q: "Can I cancel a parcel?",
    a: "Senders can cancel parcels if the parcel has not been dispatched. Go to your dashboard, open the parcel and cancel.",
  },
  {
    q: "How are fees calculated?",
    a: "Charges are based on weight, dimensions, distance and optional insurance/priority services.",
  },
  {
    q: "How do I become a delivery partner?",
    a: "Visit our careers page or contact operations@swiftdrop.example for partnership details.",
  },
];

const Faq: React.FC = () => {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [query]);

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <h1 className="text-3xl font-extrabold">Frequently asked questions</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Quick answers to common questions. Still stuck?{" "}
          <a href="/contact" className="text-sky-600">
            Contact support
          </a>
          .
        </p>

        <div>
          <Input
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            placeholder="Search FAQ..."
          />
        </div>

        <div className="space-y-3">
          {filtered.map((f, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded shadow">
              <button
                className="w-full text-left p-4 flex items-center justify-between"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
              >
                <span className="font-medium">{f.q}</span>
                <span className="text-sm text-gray-500">
                  {openIdx === i ? "−" : "+"}
                </span>
              </button>
              {openIdx === i && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 text-gray-700 dark:text-gray-300">
                  {f.a}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-gray-500 p-4">
              No results. Try a different term.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </AppShell>
  );
};

export default Faq;
