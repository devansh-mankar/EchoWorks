import Card from "./Card";

export default function InputType({ mode, setMode }) {
  const opts = [
    { id: "query", label: "Search" },
    { id: "url", label: "Wikipedia URL" },
    { id: "upload", label: "Upload Doc" },
    { id: "paste", label: "Paste Text/Link" },
  ];
  return (
    <Card title="Input Type">
      <div className="grid grid-cols-2 gap-2">
        {opts.map((opt) => (
          <label key={opt.id} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="mode"
              value={opt.id}
              checked={mode === opt.id}
              onChange={(e) => setMode(e.target.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </Card>
  );
}
