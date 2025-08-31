import Panel from "./Panel";
import { CATEGORY_TABS } from "../constants";

export default function InboxPanel({
  category,
  setCategory,
  loadingList,
  allEmails,
  filteredEmails,
  selectedIdx,
  setSelectedIdx,
  currentPage,
  estimate,
  nextPageToken,
  pageTokens,
  fetchPage,
}) {
  return (
    <Panel
      title="Inbox"
      right={
        <div className="flex items-center gap-2">
          {CATEGORY_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setCategory(t.id)}
              className={
                "px-3 py-1.5 rounded-full text-xs border shadow-sm " +
                (category === t.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-50")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      }
      className="h-[calc(100vh-180px)] min-h-[560px]"
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loadingList && allEmails.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">Loading…</div>
        ) : filteredEmails.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">
            No emails for this category yet.
          </div>
        ) : (
          <ul className="space-y-2 px-2 pt-2 pb-2">
            {filteredEmails.map((m, idx) => {
              const active = idx === selectedIdx;
              return (
                <li
                  key={m.id || idx}
                  role="option"
                  aria-selected={active}
                  onClick={() => setSelectedIdx(idx)}
                  className={
                    "px-4 py-3 cursor-pointer rounded-xl transition " +
                    (active
                      ? "bg-blue-50 border border-blue-200 shadow-md"
                      : "bg-white hover:bg-gray-50 hover:shadow")
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold truncate">
                      {m.subject || "(no subject)"}
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(m.date || Date.now()).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 truncate mt-0.5">
                    {m.from}
                  </div>
                  <div className="text-xs text-gray-700 line-clamp-2 mt-1">
                    {(m.text || "").trim() ||
                      (m.snippet || "").trim() ||
                      (m.html ? "[HTML content]" : "")}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="shrink-0 border-t bg-white px-4 py-3 flex items-center justify-between rounded-b-2xl">
        <div className="text-[12px] text-gray-600">
          Page <b>{currentPage}</b>
          {estimate !== null ? (
            <span className="ml-2">
              • showing {filteredEmails.length} • ~{estimate} msgs total
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              fetchPage(
                Math.max(1, currentPage - 1),
                pageTokens[Math.max(1, currentPage - 1)]
              )
            }
            disabled={currentPage <= 1 || loadingList}
            className="px-3 py-1.5 rounded-lg border bg-white text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() =>
              nextPageToken ? fetchPage(currentPage + 1, nextPageToken) : null
            }
            disabled={!nextPageToken || loadingList}
            className="px-3 py-1.5 rounded-lg border bg-white text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Panel>
  );
}
