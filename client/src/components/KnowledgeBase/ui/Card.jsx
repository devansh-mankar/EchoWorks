export default function Card({ title, children, className = "" }) {
  return (
    <div
      className={
        "rounded-3xl bg-white border border-gray-200 shadow-2xl px-4 py-4 sm:px-6 sm:py-6 " +
        className
      }
    >
      {title && (
        <h2 className="text-sm font-semibold text-gray-800 mb-3">{title}</h2>
      )}
      {children}
    </div>
  );
}
