import React, { useMemo, useState } from "react";
import { AnimatedGridPattern } from "@/components/ui/magicui/animated-grid-pattern";
import { toast } from "sonner";

const Pill = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

const IconBtn = ({ children, onClick, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div
    className={
      "rounded-3xl bg-white border border-gray-200 shadow-2xl p-5 " + className
    }
  >
    {children}
  </div>
);

const THREADS = [
  {
    id: "t1",
    title: "Lecture Rescheduling",
    author: { name: "Elisabeth May", avatar: "🟡" },
    createdAgo: "6h ago",
    tags: ["Accounting"],
    excerpt:
      "Hi mates, spoke with Dr. Helen and because of her travel we need to reschedule upcoming lecture. Preference for Tue 10am or Wed 2pm?",
    replies: 12,
    participants: ["🟡", "🟣", "🟢", "🔵"],
  },
  {
    id: "t2",
    title: "Date of the Final Exams",
    author: { name: "Dr Ronald Jackson", avatar: "🟤" },
    createdAgo: "3d ago",
    tags: ["Accounting", "Corporate law"],
    excerpt:
      "We’ll finalize exam dates next week. Share constraints and topics you want emphasized. Draft syllabus updates attached.",
    replies: 34,
    participants: ["🟤", "🟡", "🟠"],
  },
  {
    id: "t3",
    title: "Best way to turn a research paper into an audio brief?",
    author: { name: "Aisha Khan", avatar: "🟢" },
    createdAgo: "1d ago",
    tags: ["Knowledge Base", "Tips"],
    excerpt:
      "What format works best inside Knowledge Base: dialogue vs narration? Also any tricks to keep below 3 mins for quick listening.",
    replies: 9,
    participants: ["🟢", "🟣"],
  },
  {
    id: "t4",
    title: "Cold outreach scripts that actually get replies",
    author: { name: "Marco Liu", avatar: "🔵" },
    createdAgo: "2h ago",
    tags: ["Email Theater", "Growth"],
    excerpt:
      "Sharing a template that pairs Email Theater with a short audio hook from Knowledge Base. CTR jumped ~27%.",
    replies: 18,
    participants: ["🔵", "🟡", "🟠", "🟣"],
  },
];

function Composer({ onCreate }) {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");

  const disabled = !title.trim() || !text.trim();

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">
            Start a thread
          </h3>
          <button
            onClick={() => onCreate?.(title, text)}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:shadow-lg disabled:opacity-60"
          >
            + Publish
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Thread title"
          className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Write your message…"
          className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="bg-blue-50 text-blue-700">Community</Pill>
            <Pill className="bg-purple-50 text-purple-700">General</Pill>
          </div>
          <div className="flex items-center gap-2">
            <IconBtn title="Attach">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 13l5-5a3 3 0 114 4l-7 7a5 5 0 11-7-7l8-8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconBtn>
            <IconBtn title="Emoji">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 20a8 8 0 100-16 8 8 0 000 16z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 14s1.5 2 4 2 4-2 4-2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M9 10h.01M15 10h.01"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </IconBtn>
          </div>
        </div>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
    </Card>
  );
}

function ThreadCard({ t }) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-100 text-lg">
            <span aria-hidden>{t.author.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {t.createdAgo}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-600 line-clamp-3">
              {t.excerpt}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {t.tags.map((tag) => (
                  <Pill key={tag} className="bg-gray-100 text-gray-700">
                    {tag}
                  </Pill>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                  onClick={() =>
                    toast.message("Open thread", { description: t.title })
                  }
                >
                  Add Response
                </button>
                <div className="hidden sm:flex -space-x-2">
                  {t.participants.map((p, i) => (
                    <div
                      key={i}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-sm"
                      title="participant"
                    >
                      <span aria-hidden>{p}</span>
                    </div>
                  ))}
                </div>
                <Pill className="bg-blue-50 text-blue-700">
                  {t.replies} replies
                </Pill>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*  bottom bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
    </Card>
  );
}

export default function Community() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState(THREADS);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        t.excerpt.toLowerCase().includes(s) ||
        t.tags.some((x) => x.toLowerCase().includes(s))
    );
  }, [q, items]);

  function handleCreate(title, text) {
    const entry = {
      id: crypto.randomUUID(),
      title,
      author: { name: "You", avatar: "✨" },
      createdAgo: "just now",
      tags: ["General"],
      excerpt: text,
      replies: 0,
      participants: ["✨"],
    };
    setItems((prev) => [entry, ...prev]);
    toast.success("Thread published");
  }

  return (
    <div className="relative bg-white/70 min-h-screen py-10 overflow-hidden">
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={0.06}
        duration={3}
        repeatDelay={1}
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(900px_circle_at_center,white,transparent)] skew-y-12 h-[150%] -top-[25%] fill-gray-400/30 stroke-gray-400/30"
        width={36}
        height={36}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Community
            </span>
          </h1>
          <p className="text-gray-600 mt-2">
            Ask questions, share wins, trade tips for <b>Knowledge Base</b> and{" "}
            <b>Email Theater</b>.
          </p>
        </div>

        {/* search + new thread */}
        <div className="mb-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search threads…"
                className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M20 20l-3-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <button
            onClick={() =>
              toast.message("Tip", {
                description: "Use the composer below to start a thread.",
              })
            }
            className="whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:shadow-lg"
          >
            + New Thread
          </button>
        </div>

        {/* composer */}
        <Composer onCreate={handleCreate} />

        {/* feed */}
        <div className="mt-6 space-y-4">
          {filtered.map((t) => (
            <ThreadCard key={t.id} t={t} />
          ))}
          {filtered.length === 0 && (
            <Card>
              <p className="text-sm text-gray-600">
                No results. Try a different keyword.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
