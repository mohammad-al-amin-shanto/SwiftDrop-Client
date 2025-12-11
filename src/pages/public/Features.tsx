import React from "react";
import {
  FaTruck,
  FaChartBar,
  FaUserShield,
  FaClock,
  FaMobileAlt,
  FaCogs,
} from "react-icons/fa";
import AppShell from "../../components/layout/AppShell";

const FeatureCard: React.FC<{
  title: string;
  desc: string;
  icon: React.ReactNode;
}> = ({ title, desc, icon }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200/70 dark:border-slate-700 hover:shadow-md transition-shadow">
    <div className="flex items-start gap-4">
      <div className="mt-1 text-sky-600 dark:text-sky-400 text-2xl">{icon}</div>
      <div>
        <h4 className="font-semibold text-slate-900 dark:text-slate-50">
          {title}
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  </div>
);

const Features: React.FC = () => {
  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14 space-y-10">
          {/* Hero / header */}
          <header className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
              SwiftDrop Features
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50">
              Built for modern parcel delivery
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              From pickup requests to final delivery confirmation, SwiftDrop
              gives senders, receivers, and admins a clean, auditable workflow
              with real-time visibility.
            </p>
          </header>

          {/* Feature grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={<FaTruck />}
              title="Flexible pickup"
              desc="Create pickup requests in seconds. Schedule same-day or next-day pickups with clear status updates."
            />
            <FeatureCard
              icon={<FaClock />}
              title="Real-time tracking"
              desc="Each parcel has a timeline of status logs and timestamps you can share with customers."
            />
            <FeatureCard
              icon={<FaChartBar />}
              title="Actionable analytics"
              desc="Monitor monthly shipment volume, delivery ratios, and cancellations directly from your dashboard."
            />
            <FeatureCard
              icon={<FaUserShield />}
              title="Role-based access"
              desc="Sender, Receiver, and Admin roles keep your data secure and your team workflows organized."
            />
            <FeatureCard
              icon={<FaMobileAlt />}
              title="Mobile friendly"
              desc="Dashboards and tracking pages are fully responsive for phones, tablets, and desktops."
            />
            <FeatureCard
              icon={<FaCogs />}
              title="Developer friendly"
              desc="REST API, JWT auth, and predictable endpoints. Plug SwiftDrop into your existing tools easily."
            />
          </section>

          {/* Dev / technical section */}
          <section className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] gap-6 items-start">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700 p-6 space-y-3">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Transparent status history
              </h2>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Each parcel keeps a status log — from{" "}
                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                  created
                </span>{" "}
                through{" "}
                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                  dispatched
                </span>{" "}
                and{" "}
                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                  delivered
                </span>
                . This timeline is visible in the dashboard and via the tracking
                page so you always know what happened and when.
              </p>
            </div>

            <div className="bg-slate-900 dark:bg-black rounded-xl p-5 shadow-sm border border-slate-800">
              <h3 className="text-sm font-semibold text-sky-400 mb-3">
                Under the hood
              </h3>
              <ul className="space-y-2 text-xs md:text-sm text-slate-200">
                <li>• RESTful API with predictable routes</li>
                <li>• JWT-based authentication</li>
                <li>
                  • Role-aware filtering of parcels (sender / receiver / admin)
                </li>
                <li>
                  • Aggregated stats for charts (delivered, in-transit, pending)
                </li>
                <li>• Built to integrate nicely with React + RTK Query</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
};

export default Features;
