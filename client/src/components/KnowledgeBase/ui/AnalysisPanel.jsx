import Card from "./Card";

export default function AnalysisPanel({ analysis }) {
  if (!analysis) return null;
  return (
    <Card title="Analysis">
      <p className="text-xs text-gray-600">
        Complexity: <b>{analysis.complexity}</b>
      </p>
      <p className="text-xs text-gray-600">
        Words: <b>{analysis.wordCount}</b> · Avg sentence length:{" "}
        <b>{analysis.avgSentenceLen.toFixed(1)}</b>
      </p>
      <p className="text-xs text-gray-600 mt-2">Key concepts:</p>
      <ul className="text-xs text-gray-700 list-disc pl-5">
        {analysis.keyConcepts.map((k) => (
          <li key={k}>{k}</li>
        ))}
      </ul>
    </Card>
  );
}
