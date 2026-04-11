import { Poll } from "@/lib/polling-store";

interface PollResultsProps {
  poll: Poll;
}

const PollResults = ({ poll }: PollResultsProps) => {
  const totalResponses = Object.keys(poll.responses).length;

  if (poll.type === "text") {
    const textResponses = Object.values(poll.responses);
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{totalResponses} responses</p>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {textResponses.map((r, i) => (
            <div key={i} className="rounded-md bg-muted p-3 text-sm">
              {r}
            </div>
          ))}
          {textResponses.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No responses yet</p>
          )}
        </div>
      </div>
    );
  }

  const counts: Record<string, number> = {};
  poll.options.forEach((o) => (counts[o.id] = 0));
  Object.values(poll.responses).forEach((r) => {
    if (counts[r] !== undefined) counts[r]++;
  });

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{totalResponses} responses</p>
      {poll.options.map((option) => {
        const count = counts[option.id] || 0;
        const pct = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
        return (
          <div key={option.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{option.label}</span>
              <span className="text-muted-foreground">
                {count} ({pct}%)
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full hero-gradient transition-all duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PollResults;
