import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/shared/Skeleton';
import * as adminDashboardService from '@/services/adminDashboard.service';

const GATEWAY_COLORS: Record<string, string> = {
  ESEWA: '#146B63',
  FONEPAY: '#D9694F',
  WALLET: '#C68A2E',
};

function formatMonth(key: string) {
  const [year, month] = key.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString(undefined, {
    month: 'short',
  });
}

export default function AdminRevenuePage() {
  useSetPageTitle('Revenue');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'revenue-analytics'],
    queryFn: () => adminDashboardService.fetchRevenueAnalytics(6),
  });

  const chartData = (data?.monthly ?? []).map((m) => ({
    month: formatMonth(m.month),
    revenue: m.revenue,
  }));

  const gatewayData = (data?.byGateway ?? []).filter((g) => g.revenue > 0);

  return (
    <div className="flex flex-col gap-6">
      <StatCard
        label="Total Revenue (6 months)"
        value={data ? `NPR ${data.totalRevenue.toLocaleString()}` : 0}
        icon={TrendingUp}
        accent="success"
        isLoading={isLoading}
      />

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="rounded-lg border border-slate-100 bg-paper-0 p-6 shadow-sm">
          <h3 className="font-display text-lg text-slate-900 mb-6">Monthly revenue</h3>
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9ECE9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#6B7370' }}
                    axisLine={{ stroke: '#E9ECE9' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6B7370' }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                    tickFormatter={(v: number) => `${v / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: '#DCEEEA' }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #E9ECE9', fontSize: 13 }}
                    formatter={(value: number) => [`NPR ${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#146B63" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-100 bg-paper-0 p-6 shadow-sm">
          <h3 className="font-display text-lg text-slate-900 mb-6">By payment gateway</h3>
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : gatewayData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-sm text-slate-400">
              No payment data yet.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gatewayData}
                    dataKey="revenue"
                    nameKey="gateway"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {gatewayData.map((entry) => (
                      <Cell key={entry.gateway} fill={GATEWAY_COLORS[entry.gateway] ?? '#6B7370'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #E9ECE9', fontSize: 13 }}
                    formatter={(value: number) => [`NPR ${value.toLocaleString()}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-4 -mt-4">
                {gatewayData.map((g) => (
                  <span key={g.gateway} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: GATEWAY_COLORS[g.gateway] ?? '#6B7370' }}
                    />
                    {g.gateway}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
