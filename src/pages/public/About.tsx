import React from "react";
import { AppShell } from "../../components/layout/AppShell";

const About: React.FC = () => {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <header>
          <h1 className="text-3xl font-extrabold">About SwiftDrop</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            SwiftDrop is a modern parcel delivery platform built to make sending
            and receiving packages effortless for individuals and businesses. We
            combine smart logistics, clear pricing, and delightful UX so you can
            move things — not headaches.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded shadow">
            <h3 className="font-semibold">Our mission</h3>
            <p className="text-sm text-gray-500 mt-2">
              To simplify local and nation-wide parcel delivery with transparent
              tools and fast service.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded shadow">
            <h3 className="font-semibold">Our values</h3>
            <ul className="text-sm text-gray-500 mt-2 space-y-1">
              <li>Reliability — we show what’s happening, always.</li>
              <li>Clarity — pricing and status without surprises.</li>
              <li>Humanity — real people behind support & operations.</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded shadow">
            <h3 className="font-semibold">Who we serve</h3>
            <p className="text-sm text-gray-500 mt-2">
              Small businesses, marketplaces, individual senders, and teams that
              need dependable delivery at scale.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">How SwiftDrop works</h2>
          <ol className="list-decimal pl-6 space-y-3 text-gray-600 dark:text-gray-300">
            <li>
              <strong>Create a booking</strong> — fill sender/receiver details
              and choose pickup time.
            </li>
            <li>
              <strong>Pickup & tracking</strong> — driver collects the package
              and updates the status in real time.
            </li>
            <li>
              <strong>Delivery confirmation</strong> — receiver confirms and the
              status is finalized in your dashboard.
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">The team</h2>
          <p className="text-gray-600 dark:text-gray-300">
            A small multidisciplinary team (Software, dev, and support) building
            SwiftDrop with a focus on reliability and usefulness.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white dark:bg-slate-800 rounded p-4 text-center">
              <div className="font-medium">Abu Taher Saikat</div>
              <div className="text-sm text-gray-500">Software Engineer</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded p-4 text-center">
              <div className="font-medium">Mohammad AL Amin</div>
              <div className="text-sm text-gray-500">Fullstack Developer</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded p-4 text-center">
              <div className="font-medium">Arifur Rahman Shakil</div>
              <div className="text-sm text-gray-500">Frontend Developer</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded p-4 text-center">
              <div className="font-medium">Fazla Rabbi</div>
              <div className="text-sm text-gray-500">Support</div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default About;
