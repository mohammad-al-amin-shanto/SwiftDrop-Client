import React from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import TrackingSearchWidget from "../../components/parcels/TrackingSearchWidget";
import ShipmentsBarChart from "../../components/charts/ShipmentsBarChart";
import StatusPieChart from "../../components/charts/StatusPieChart";
import Button from "../../components/common/Button";
import { useParcelsStatsQuery } from "../../api/parcelsApi";

const Home: React.FC = () => {
  const { data: stats, isLoading } = useParcelsStatsQuery();

  return (
    <AppShell>
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* HERO */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              SwiftDrop — parcel delivery that actually moves fast.
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Send, track and manage parcels across the country with real-time
              updates, transparent pricing and human-friendly support. Built for
              modern senders, trusted by local businesses.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/auth/register">
                <Button variant="primary">Create account</Button>
              </Link>
              <Link to="/features">
                <Button variant="outline">See features</Button>
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-semibold">
                  {stats?.total ?? "—"}
                </div>
                <div className="text-xs text-gray-500">Shipments</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">
                  {stats?.delivered ?? "—"}
                </div>
                <div className="text-xs text-gray-500">Delivered</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">
                  {stats?.inTransit ?? "—"}
                </div>
                <div className="text-xs text-gray-500">In transit</div>
              </div>
            </div>
          </div>

          {/* Right column: tracking + quick stats */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow tour-create-parcel">
              <h3 className="font-semibold mb-3">Track a parcel</h3>
              <TrackingSearchWidget />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
                <h4 className="font-medium mb-2">Monthly shipments</h4>
                <ShipmentsBarChart
                  data={stats?.monthly ?? []}
                  loading={isLoading}
                />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
                <h4 className="font-medium mb-2">Status breakdown</h4>
                <StatusPieChart stats={stats} loading={isLoading} />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Why people love SwiftDrop
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
              <h3 className="font-semibold">Fast pickup & delivery</h3>
              <p className="text-sm text-gray-500 mt-2">
                Same-day pickup in many areas, with accurate ETAs and live
                tracking for receivers.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
              <h3 className="font-semibold">Transparent pricing</h3>
              <p className="text-sm text-gray-500 mt-2">
                No surprise fees — estimate costs before you create a booking.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
              <h3 className="font-semibold">Business-ready</h3>
              <p className="text-sm text-gray-500 mt-2">
                Bulk upload, webhooks, and an admin console for teams and
                retailers.
              </p>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Trusted by local sellers & small teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <blockquote className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
              <div className="font-medium">
                "SwiftDrop cut our delivery headaches — fast pickup and zero
                surprises."
              </div>
              <footer className="mt-3 text-sm text-gray-500">
                — Rahim, e-commerce owner
              </footer>
            </blockquote>
            <blockquote className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
              <div className="font-medium">
                "Clean dashboard, useful notifications and stellar support."
              </div>
              <footer className="mt-3 text-sm text-gray-500">
                — Nusrat, operations
              </footer>
            </blockquote>
            <blockquote className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
              <div className="font-medium">
                "The tracking experience impressed our customers — fewer 'where
                is my parcel' messages."
              </div>
              <footer className="mt-3 text-sm text-gray-500">
                — Tanvir, marketplace vendor
              </footer>
            </blockquote>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-lg text-white p-8">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold">Ready to ship smarter?</h3>
              <p className="mt-2 text-sky-100">
                Create an account and try SwiftDrop. Onboarding takes less than
                3 minutes.
              </p>
            </div>
            <div className="text-right">
              <Link to="/auth/register">
                <Button variant="primary">Get started — it's free</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
};

export default Home;
