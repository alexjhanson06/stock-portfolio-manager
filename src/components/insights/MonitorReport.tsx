import { AIMonitorOutput } from "@/types/ai";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";

interface Props {
  report: AIMonitorOutput;
}

export default function MonitorReport({ report }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Monitor Report</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{report.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Benchmark Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{report.benchmarkComparison}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {report.outperformers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-emerald-700">
                Outperformers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.outperformers.map((item) => (
                <div key={item.symbol}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      {item.symbol}
                    </span>
                    <span className="text-emerald-600 font-medium text-sm">
                      {formatPercent(item.gainPercent)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{item.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {report.underperformers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-red-700">
                Underperformers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.underperformers.map((item) => (
                <div key={item.symbol}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      {item.symbol}
                    </span>
                    <span className="text-red-600 font-medium text-sm">
                      {formatPercent(item.gainPercent)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{item.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {report.riskFlags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-amber-700">
              Risk Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.riskFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-500 mt-0.5">&#9888;</span>
                  {flag}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
