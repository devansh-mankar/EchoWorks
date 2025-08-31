import RailCard from "./RailCard";

export default function Panel({ title, right, children, className = "" }) {
  return (
    <RailCard className={"flex flex-col " + className}>
      {(title || right) && (
        <div className="px-4 sm:px-5 py-3 border-b bg-gray-50/60 rounded-t-2xl flex items-center gap-3">
          {title && (
            <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          )}
          <div className="ml-auto">{right}</div>
        </div>
      )}
      <div className="p-4 sm:p-5 flex-1 min-h-0 flex flex-col">{children}</div>
    </RailCard>
  );
}
