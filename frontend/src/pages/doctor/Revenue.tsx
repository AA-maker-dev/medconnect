import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp, CheckCircle2, XCircle, Percent } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/shared/Skeleton';
import * as doctorDashboardService from '@/services/doctorDashboard.service';

function formatMonth(key: string) {
  const [year, month] = key.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString(undefined, {
    month: 'short',
  });
}

export default function DoctorRevenuePage() {
  useSetPageTitle('Revenue Analytics');

  const { data, isLoading } = useQuery({
    queryKey: ['doctor', 'revenue-analytics'],
    queryFn: () => doctorDashboardService.fetchRevenueAnalytics(6),
  });

  const chartData = (data?.monthly ?? []).map((m) => ({
    month: formatMonth(m.month),
    revenue: m.revenue,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue (6 mo)"
          value={data ? `NPR ${data.totalRevenue.toLocaleString()}` : 0}
          icon={TrendingUp}
          accent="success"
          isLoading={isLoading}
        />
        <StatCard
          label="Completed"
          value={data?.completedCount ?? 0}
          icon={CheckCircle2}
          accent="teal"
          isLoading={isLoading}
        />
        <StatCard
          label="Cancelled / No-show"
          value={data?.cancelledCount ?? 0}
          icon={XCircle}
          accent="coral"
          isLoading={isLoading}
        />
        <StatCard
          label="Completion Rate"
          value={data ? `${data.completionRate}%` : 0}
          icon={Percent}
          accent="amber"
          isLoading={isLoading}
        />
      </div>

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
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #E9ECE9',
                    fontSize: 13,
                  }}
                  formatter={(value: number) => [`NPR ${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#146B63" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
