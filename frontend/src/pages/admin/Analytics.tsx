import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import * as adminDashboardService from '@/services/adminDashboard.service';

function formatMonth(key: string) {
  const [year, month] = key.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString(undefined, {
    month: 'short',
  });
}

export default function AdminAnalyticsPage() {
  useSetPageTitle('System Analytics');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'system-analytics'],
    queryFn: () => adminDashboardService.fetchSystemAnalytics(6),
  });

  const growthData = (data?.patientGrowth ?? []).map((p, i) => ({
    month: formatMonth(p.month),
    patients: p.count,
    doctors: data?.doctorGrowth[i]?.count ?? 0,
  }));

  const volumeData = (data?.appointmentVolume ?? []).map((v) => ({
    month: formatMonth(v.month),
    appointments: v.count,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-slate-100 bg-paper-0 p-6 shadow-sm">
          <h3 className="font-display text-lg text-slate-900 mb-6">User growth</h3>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9ECE9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#6B7370' }}
                    axisLine={{ stroke: '#E9ECE9' }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7370' }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E9ECE9', fontSize: 13 }} />
                  <Line type="monotone" dataKey="patients" stroke="#146B63" strokeWidth={2} dot={false} name="Patients" />
                  <Line type="monotone" dataKey="doctors" stroke="#D9694F" strokeWidth={2} dot={false} name="Doctors" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex items-center gap-4 mt-2 justify-center text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-700" /> Patients
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-coral-600" /> Doctors
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-paper-0 p-6 shadow-sm">
          <h3 className="font-display text-lg text-slate-900 mb-6">Appointment volume</h3>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9ECE9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#6B7370' }}
                    axisLine={{ stroke: '#E9ECE9' }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7370' }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E9ECE9', fontSize: 13 }} />
                  <Bar dataKey="appointments" fill="#1F8F82" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-100 bg-paper-0 p-6 shadow-sm">
        <h3 className="font-display text-lg text-slate-900 mb-6">Doctors by specialization</h3>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : data && data.specializationDistribution.length > 0 ? (
          <div className="flex flex-col gap-3">
            {data.specializationDistribution
              .slice()
              .sort((a, b) => b.count - a.count)
              .map((s) => {
                const max = Math.max(...data.specializationDistribution.map((d) => d.count));
                return (
                  <div key={s.specialization} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 w-40 shrink-0 truncate">
                      {s.specialization}
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-ivory-100 overflow-hidden">
                      <div
                        className="h-full bg-teal-700 rounded-full"
                        style={{ width: `${(s.count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-900 w-6 text-right">
                      {s.count}
                    </span>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No data yet.</p>
        )}
      </div>
    </div>
  );
}
