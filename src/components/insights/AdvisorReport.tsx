import { AIAdvisorOutput } from "@/types/ai";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  report: AIAdvisorOutput;
}

const actionColors: Record<string, string> = {
  BUY: "bg-emerald-100 text-emerald-800",
  SELL: "bg-red-100 text-red-800",
  HOLD: "bg-gray-100 text-gray-700",
};

const urgencyColors: Record<string, string> = {
  HIGH: "bg-red-50 text-red-600 border-red-200",
  MEDIUM: "bg-amber-50 text-amber-600 border-amber-200",
  LOW: "bg-gray-50 text-gray-500 border-gray-200",
};

export default function AdvisorReport({ report }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Advisor Report</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{report.overallAssessment}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {report.recommendations.map((rec) => (
            <div
              key={rec.symbol}
              className={`rounded-xl border p-4 ${urgencyColors[rec.urgency]}`}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-gray-900 text-sm">
                  {rec.symbol}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${actionColors[rec.action]}`}
                >
                  {rec.action}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {rec.urgency} urgency
                </span>
              </div>
              <p className="text-sm text-gray-600">{rec.rationale}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Diversification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{report.diversificationInsights}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{report.riskAnalysis}</p>
          </CardContent>
        </Card>
      </div>

      {report.suggestedAllocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Suggested Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.suggestedAllocations.map((alloc) => (
                <div
                  key={alloc.symbol}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-gray-800">
                    {alloc.symbol}
                  </span>
                  <div className="flex items-center gap-3 text-gray-500">
                    <span>Now: {alloc.currentPercent.toFixed(1)}%</span>
                    <span className="text-gray-300">→</span>
                    <span
                      className={
                        alloc.suggestedPercent > alloc.currentPercent
                          ? "text-emerald-600 font-medium"
                          : alloc.suggestedPercent < alloc.currentPercent
                          ? "text-red-600 font-medium"
                          : "text-gray-600"
                      }
                    >
                      Target: {alloc.suggestedPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-gray-400 text-center">
        For educational purposes only. Not financial advice. Consult a
        professional before making investment decisions.
      </p>
    </div>
  );
}
