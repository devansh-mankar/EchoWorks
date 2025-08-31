export default function RailCard({ children, className = "" }) {
  return (
    <div
      className={
        "rounded-2xl border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 " +
        className
      }
    >
      {children}
    </div>
  );
}
