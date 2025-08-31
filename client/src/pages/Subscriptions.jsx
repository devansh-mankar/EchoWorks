import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { AnimatedGridPattern } from "@/components/ui/magicui/animated-grid-pattern";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    badge: "Free",
    monthly: 0,
    yearly: 0,
    highlight: false,
    cta: "Start Free",
    kb: {
      scriptsPerMonth: 10,
      ttsMinutes: 20,
      voiceChangeMinutes: 5,
      languages: "2 languages",
      uploads: "PDF/DOC up to 10MB",
    },
    et: {
      inboxes: 1,
      dailyThreads: 25,
      aiSummaries: "50 / mo",
      attachments: "Preview",
      triage: "Manual",
    },
    support: "Community",
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Most Popular",
    monthly: 19.99,
    yearly: 179.88,
    highlight: true,
    cta: "Upgrade to Pro",
    kb: {
      scriptsPerMonth: 200,
      ttsMinutes: 300,
      voiceChangeMinutes: 120,
      languages: "All supported",
      uploads: "PDF/DOC up to 50MB",
    },
    et: {
      inboxes: 3,
      dailyThreads: 200,
      aiSummaries: "Unlimited",
      attachments: "Preview + OCR",
      triage: "Priority rules",
    },
    support: "Priority",
  },
  {
    id: "team",
    name: "Team",
    badge: "Best for Teams",
    monthly: 49.99,
    yearly: 479.88,
    highlight: false,
    cta: "Go Team",
    kb: {
      scriptsPerMonth: 1000,
      ttsMinutes: 1200,
      voiceChangeMinutes: 600,
      languages: "All supported",
      uploads: "PDF/DOC up to 200MB",
    },
    et: {
      inboxes: 10,
      dailyThreads: 1000,
      aiSummaries: "Unlimited + export",
      attachments: "Preview + OCR + Export",
      triage: "Shared queues",
    },
    support: "24/7",
  },
];

const FEATURE_SECTIONS = [
  {
    title: "Knowledge Base",
    fields: [
      ["kb.scriptsPerMonth", "Scripts / month"],
      ["kb.ttsMinutes", "TTS minutes / month"],
      ["kb.voiceChangeMinutes", "Voice Changer minutes / month"],
      ["kb.languages", "Languages"],
      ["kb.uploads", "Document uploads"],
    ],
  },
  {
    title: "Email Theater",
    fields: [
      ["et.inboxes", "Connected inboxes"],
      ["et.dailyThreads", "Threads processed / day"],
      ["et.aiSummaries", "AI summaries"],
      ["et.attachments", "Attachments & OCR"],
      ["et.triage", "Triage & routing"],
    ],
  },
  { title: "Service", fields: [["support", "Support"]] },
];

const get = (obj, path) =>
  path.split(".").reduce((a, k) => (a ? a[k] : undefined), obj);

function Price({ amount, period }) {
  const free = Number(amount) === 0;
  return (
    <div className="mt-1 sm:mt-2">
      <div className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
        {free ? (
          "Free"
        ) : (
          <>
            {`$${amount.toFixed(2)}`}
            <span className="ml-1 text-xs sm:text-sm font-medium text-gray-500">
              /{period}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function PlanCard({ plan, billing, onSelect }) {
  const price = billing === "monthly" ? plan.monthly : plan.yearly;
  return (
    <div
      className={[
        "rounded-3xl bg-white border shadow-2xl p-5 sm:p-6 lg:p-8 flex flex-col",
        plan.highlight
          ? "border-blue-500 ring-1 ring-blue-200"
          : "border-gray-200",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          {plan.name}
        </h3>
        {plan.badge && (
          <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {plan.badge}
          </span>
        )}
      </div>

      <Price amount={price} period={billing === "monthly" ? "mo" : "yr"} />

      <ul className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3 text-[13px] sm:text-sm text-gray-700">
        <li className="flex items-center gap-2">
          <span className="text-green-600">✔</span>
          {get(plan, "kb.scriptsPerMonth")} scripts/month
        </li>
        <li className="flex items-center gap-2">
          <span className="text-green-600">✔</span>
          {get(plan, "kb.ttsMinutes")} TTS min •{" "}
          {get(plan, "kb.voiceChangeMinutes")} VC min
        </li>
        <li className="flex items-center gap-2">
          <span className="text-green-600">✔</span>
          {get(plan, "kb.languages")}
        </li>
        <li className="flex items-center gap-2">
          <span className="text-green-600">✔</span>
          {get(plan, "kb.uploads")}
        </li>
        <li className="flex items-center gap-2">
          <span className="text-green-600">✔</span>
          {get(plan, "et.inboxes")} inbox
          {get(plan, "et.inboxes") > 1 ? "es" : ""} •{" "}
          {get(plan, "et.dailyThreads")} threads/day
        </li>
      </ul>

      <button
        onClick={onSelect}
        className={[
          "mt-6 sm:mt-8 w-full py-2.5 sm:py-3 rounded-xl text-sm font-semibold transition shadow-md hover:shadow-lg",
          plan.highlight
            ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50",
        ].join(" ")}
      >
        {plan.cta}
      </button>
    </div>
  );
}

export default function Subscriptions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState("monthly");

  const savingsText = useMemo(
    () => (billing === "yearly" ? "Save with annual billing" : " "),
    [billing]
  );

  const selectPlan = (id) => {
    if (!user) return navigate(`/signup?plan=${id}&billing=${billing}`);
    navigate(`/home?upgrade=${id}&billing=${billing}`);
  };

  return (
    <div className="relative bg-white/70 min-h-screen py-12 sm:py-16 overflow-hidden">
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={0.06}
        duration={3}
        repeatDelay={1}
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(900px_circle_at_center,white,transparent)]
          skew-y-12 h-[150%] -top-[25%] fill-gray-400/30 stroke-gray-400/30"
        width={36}
        height={36}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Our Subscription Plans
            </span>
          </h1>
          <p className="mt-2 sm:mt-3 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Built for <b>Knowledge Base</b> & <b>Email Theater</b>. Scale from
            solo to team.
          </p>
        </header>

        {/* Billing Toggle */}
        <div className="mt-6 sm:mt-8 flex flex-col items-center gap-2">
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-white shadow-md">
            <button
              className={[
                "px-3 sm:px-4 py-2 text-sm rounded-full transition",
                billing === "monthly"
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-50",
              ].join(" ")}
              onClick={() => setBilling("monthly")}
              aria-pressed={billing === "monthly"}
            >
              Monthly
            </button>
            <button
              className={[
                "px-3 sm:px-4 py-2 text-sm rounded-full transition",
                billing === "yearly"
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-50",
              ].join(" ")}
              onClick={() => setBilling("yearly")}
              aria-pressed={billing === "yearly"}
            >
              Yearly
            </button>
          </div>
          <div className="text-xs text-green-700">{savingsText}</div>
        </div>

        {/* Cards */}
        <section className="mt-8 sm:mt-10 grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              billing={billing}
              onSelect={() => selectPlan(p.id)}
            />
          ))}
        </section>

        {/* Comparison — desktop table */}
        <section className="mt-10 sm:mt-12 hidden md:block">
          <div className="rounded-3xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">
                Feature Comparison
              </h2>
              <div className="text-xs text-gray-500">
                {billing === "monthly"
                  ? "Monthly prices shown"
                  : "Yearly prices shown"}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="text-left font-semibold px-6 py-3 w-1/3">
                      Package Details
                    </th>
                    {PLANS.map((p) => (
                      <th
                        key={p.id}
                        className="text-left font-semibold px-6 py-3"
                      >
                        {p.name}
                        <div className="mt-1 text-xs text-gray-500">
                          {Number(
                            billing === "monthly" ? p.monthly : p.yearly
                          ) === 0 ? (
                            "Free"
                          ) : (
                            <>
                              $
                              {Number(
                                billing === "monthly" ? p.monthly : p.yearly
                              ).toFixed(2)}{" "}
                              {billing === "monthly" ? "/mo" : "/yr"}
                            </>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {FEATURE_SECTIONS.map((sec) => (
                    <React.Fragment key={sec.title}>
                      <tr className="bg-gray-50/60">
                        <td
                          colSpan={1}
                          className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide"
                        >
                          {sec.title}
                        </td>
                        {PLANS.map((p) => (
                          <td
                            key={`${p.id}-${sec.title}`}
                            className="px-6 py-3"
                          />
                        ))}
                      </tr>
                      {sec.fields.map(([path, label]) => (
                        <tr key={path}>
                          <td className="px-6 py-4 font-medium text-gray-800">
                            {label}
                          </td>
                          {PLANS.map((p) => (
                            <td
                              key={`${p.id}-${path}`}
                              className="px-6 py-4 text-gray-700"
                            >
                              {String(get(p, path))}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Comparison — mobile cards */}
        <section className="mt-10 sm:mt-12 md:hidden space-y-5">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-white border border-gray-200 shadow-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold text-gray-900">
                    {p.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Number(billing === "monthly" ? p.monthly : p.yearly) ===
                    0 ? (
                      "Free"
                    ) : (
                      <>
                        $
                        {Number(
                          billing === "monthly" ? p.monthly : p.yearly
                        ).toFixed(2)}{" "}
                        {billing === "monthly" ? "/mo" : "/yr"}
                      </>
                    )}
                  </div>
                </div>
                {p.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {p.badge}
                  </span>
                )}
              </div>

              {FEATURE_SECTIONS.map((sec) => (
                <div key={sec.title} className="mt-4">
                  <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    {sec.title}
                  </div>
                  <ul className="mt-2 divide-y divide-gray-100 text-sm">
                    {sec.fields.map(([path, label]) => (
                      <li key={path} className="flex justify-between py-2">
                        <span className="text-gray-600">{label}</span>
                        <span className="text-gray-800">
                          {String(get(p, path))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <button
                onClick={() => selectPlan(p.id)}
                className={[
                  "mt-5 w-full py-2.5 rounded-lg text-sm font-semibold transition shadow-sm hover:shadow-md",
                  p.highlight
                    ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50",
                ].join(" ")}
              >
                {p.highlight ? "Select Pro" : "Select"}
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
