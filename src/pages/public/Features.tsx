// src/pages/public/Features.tsx
import React from "react";
import { AppShell } from "../../components/layout/AppShell";
import Footer from "../../components/layout/Footer";
import {
  FaTruck,
  FaChartBar,
  FaUserShield,
  FaClock,
  FaMobileAlt,
  FaCogs,
} from "react-icons/fa";

const FeatureCard: React.FC<{
  title: string;
  desc: string;
  icon: React.ReactNode;
}> = ({ title, desc, icon }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow hover:shadow-md transition">
    <div className="flex items-center gap-3">
      <div className="text-sky-600 text-2xl">{icon}</div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-gray-500 mt-1">{desc}</p>
      </div>
    </div>
  </div>
);

const Features: React.FC = () => {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <header>
          <h1 className="text-3xl font-extrabold">
            Features built for real-world delivery
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Everything you need to manage parcels from pickup to confirmation —
            simple, fast, and auditable.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<FaTruck />}
            title="Flexible pickup"
            desc="Schedule same-day or next-day pickups with live driver updates."
          />
          <FeatureCard
            icon={<FaClock />}
            title="Real-time tracking"
            desc="Live status logs and timestamps — share tracking IDs with customers."
          />
          <FeatureCard
            icon={<FaChartBar />}
            title="Business analytics"
            desc="Charts and exportable reports to understand your delivery trends."
          />
          <FeatureCard
            icon={<FaUserShield />}
            title="Role-based access"
            desc="Sender, Receiver, and Admin roles with secure access control."
          />
          <FeatureCard
            icon={<FaMobileAlt />}
            title="Mobile-friendly"
            desc="Responsive dashboards and tracking experience for every device."
          />
          <FeatureCard
            icon={<FaCogs />}
            title="Extensible"
            desc="Webhooks and APIs to integrate SwiftDrop with your systems."
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Developer friendly</h2>
          <div className="bg-white dark:bg-slate-800 p-6 rounded shadow">
            <p className="text-gray-600 dark:text-gray-300">
              Built with a REST API, JWT auth, and predictable endpoints. Use
              RTK Query + Redux on the frontend for fast integration. Need a
              custom integration? We’ve made our API easy to extend.
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </AppShell>
  );
};

export default Features;
