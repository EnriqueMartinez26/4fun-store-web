'use client';

/**
 * Capa de Administración: Dashboard Analítico de Administración (Admin Home)
 * --------------------------------------------------------------------------
 * Orquesta la visualización de métricas críticas de negocio, reportes de
 * ventas y rankings de productos. Utiliza Recharts para la visualización.
 * (MVC - View)
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Download,
  FileSpreadsheet,
  FileText,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  BarChart3,
  Eye,
  Calendar,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAdminDashboardViewModel } from '@/hooks/use-admin-dashboard-view-model';
import { useState } from 'react';
import Link from 'next/link';

/**
 * ATÓMICO: Tarjeta de Indicador Clave de Rendimiento (KPI)
 */
function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  alert,
  isLoading,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  alert?: boolean;
  isLoading?: boolean;
}) {
  if (isLoading) return <Skeleton className="h-32 rounded-lg bg-white/5" />;

  return (
    <Card
      className={cn(
        'relative border-0 overflow-hidden group transition-all duration-300',
        'bg-gradient-to-br from-slate-900/50 to-slate-950 shadow-sm hover:shadow-lg hover:shadow-primary/5',
        'ring-1 ring-white/8 hover:ring-white/12 backdrop-blur-sm',
        alert && 'ring-red-500 shadow-red-500/20'
      )}
    >
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
            <Icon className="h-8 w-8 text-primary/60" />
          </div>
          {trendValue && trend && (
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold tracking-wider',
                trend === 'up' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/20 text-red-500'
              )}
            >
              {trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {trendValue}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold text-muted-foreground opacity-40 uppercase tracking-widest">
            {title}
          </p>
          <p className="text-4xl font-bold text-white/90 tracking-tighter">{value}</p>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground font-medium mt-4 flex items-center gap-2 opacity-50">
            <Activity className="h-4 w-4" /> {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * ATÓMICO: Fila de Producto en el Ranking de Ventas
 */
function ProductRow({ product, idx, maxSold }: { product: any; idx: number; maxSold: number }) {
  const pct = maxSold > 0 ? (product.totalSold / maxSold) * 100 : 0;
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="group py-4 px-4 rounded-lg hover:bg-white/3 transition-all duration-200 border border-transparent hover:border-white/5">
      <div className="flex items-center gap-4">
        <span className="text-xl w-6 flex justify-center font-bold">
          {medals[idx] || `${idx + 1}.`}
        </span>
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
            {product.name}
          </p>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-white/80">
            {formatCurrency(product.revenueGenerated)}
          </p>
          <p className="text-[10px] font-bold text-primary/60 mt-1">{product.totalSold} ud.</p>
        </div>
      </div>
    </div>
  );
}

/**
 * COMPONENTE PRINCIPAL: Página de Dashboard de Administración
 */
export default function AdminDashboardPage() {
  const {
    stats,
    chartData,
    topProducts,
    recentActivity,
    loading,
    handleExportPDF,
    handleExportExcel,
  } = useAdminDashboardViewModel();

  if (loading) {
    return (
      <div className="space-y-8 p-6 md:p-8 animate-in fade-in duration-500">
        <div className="flex items-end justify-between">
          <Skeleton className="h-10 w-64 bg-white/5" />
          <Skeleton className="h-10 w-32 bg-white/5" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[2rem] bg-white/5" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-7">
          <Skeleton className="lg:col-span-4 h-96 rounded-[3rem] bg-white/5" />
          <Skeleton className="lg:col-span-3 h-96 rounded-[3rem] bg-white/5" />
        </div>
      </div>
    );
  }

  const maxSold = topProducts.length > 0 ? Math.max(...topProducts.map((p) => p.totalSold)) : 1;
  const monthlyGrowth = stats?.monthlyGrowth || 0;

  return (
    <div className="space-y-8 p-6 md:p-10 animate-in fade-in duration-700 pb-20">
      {/* CABECERA DE MANDO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-white/90 tracking-tighter italic">Dashboard</h1>
          <p className="text-sm text-muted-foreground font-bold opacity-40 flex items-center gap-2 uppercase tracking-widest">
            <Calendar className="h-4 w-4 text-primary opacity-60" />
            {new Date().toLocaleDateString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-11 px-6 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-bold text-[10px] uppercase tracking-wide rounded-xl transition-all shadow-xl hover:shadow-primary/10">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Exportar Reporte</DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-primary mt-2">
                  Consolidado de Negocio
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-8">
                <Button
                  variant="outline"
                  className="h-20 justify-start px-6 gap-5 border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group"
                  onClick={handleExportExcel}
                >
                  <FileSpreadsheet className="h-8 w-8 text-emerald-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-bold text-white">Libro Excel</p>
                    <p className="text-[9px] font-bold text-muted-foreground">
                      Formato de Auditoría (.xlsx)
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 justify-start px-6 gap-5 border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
                  onClick={handleExportPDF}
                >
                  <FileText className="h-8 w-8 text-red-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-bold text-white">Documento PDF</p>
                    <p className="text-[9px] font-bold text-muted-foreground">
                      Resumen Ejecutivo (.pdf)
                    </p>
                  </div>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* MATRIZ DE KPIs */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ingresos Totales"
          value={formatCurrency(stats?.totalRevenue || 0)}
          subtitle="Acumulado histórico de ventas"
          icon={DollarSign}
          trend={monthlyGrowth >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(monthlyGrowth)}%`}
        />
        <KpiCard
          title="Base de Usuarios"
          value={stats?.totalUsers || 0}
          subtitle="Clientes registrados en el nodo"
          icon={Users}
        />
        <KpiCard
          title="Stock Activo"
          value={stats?.activeProducts || 0}
          subtitle="Productos publicados en tienda"
          icon={Package}
        />
        <KpiCard
          title="Órdenes"
          value={stats?.totalOrders || 0}
          subtitle="Transacciones validadas"
          icon={ShoppingBag}
          alert={!!(stats?.totalOrders && stats.totalOrders < 10)}
        />
      </div>

      {/* GRÁFICOS Y RANKINGS */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* TENDENCIA DE VENTAS */}
        <Card className="lg:col-span-4 border-none bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] ring-1 ring-white/5 shadow-2xl overflow-hidden">
          <CardHeader className="p-8 pb-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold flex items-center gap-2 italic text-white/90">
                  <BarChart3 className="h-5 w-5 text-primary/60" /> Tendencia de Ventas
                </CardTitle>
                <CardDescription className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                  Evolución de tus ingresos (Últimos 30 días)
                </CardDescription>
              </div>
              {chartData.length > 0 && (
                <div className="text-right">
                  <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">
                    Pico Máximo
                  </p>
                  <p className="text-2xl font-bold text-white/90 tracking-tighter">
                    {formatCurrency(Math.max(...chartData.map((d) => d.total)))}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-10">
            {chartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(255,255,255,0.03)"
                    />
                    <XAxis
                      dataKey="displayDate"
                      stroke="transparent"
                      tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="transparent"
                      tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900/90 border border-white/10 px-4 py-3 rounded-2xl backdrop-blur-xl shadow-2xl">
                              <p className="text-[9px] font-bold text-primary/60 mb-1 uppercase tracking-widest">
                                {payload[0].payload.displayDate}
                              </p>
                              <p className="text-lg font-bold text-white/90">
                                {formatCurrency(payload[0].value as number)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-center opacity-20">
                <TrendingUp className="h-20 w-20 mb-4" />
                <p className="font-bold text-xs opacity-40 uppercase tracking-widest">
                  Aún no hay datos analíticos
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* TOP PRODUCTOS */}
        <Card className="lg:col-span-3 border-none bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] ring-1 ring-white/5 shadow-2xl flex flex-col">
          <CardHeader className="p-8 pb-4 border-b border-white/5">
            <CardTitle className="text-xl font-bold flex items-center gap-2 italic text-white/90">
              <Eye className="h-5 w-5 text-primary/60" /> Más Vendidos
            </CardTitle>
            <CardDescription className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
              Ranking de tus productos estrella
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pt-6 pb-8 flex-1 overflow-y-auto">
            {topProducts.length > 0 ? (
              <div className="space-y-2">
                {topProducts.map((product, idx) => (
                  <ProductRow key={product._id} product={product} idx={idx} maxSold={maxSold} />
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <Activity className="h-16 w-16 mb-4" />
                <p className="font-bold uppercase tracking-widest text-[10px] opacity-40">
                  Sin movimientos de stock
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ACTIVIDAD RECIENTE (AUDITORÍA) */}
      <Card className="border-none bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] ring-1 ring-white/5 shadow-2xl overflow-hidden">
        <CardHeader className="p-8 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2 italic text-white/90">
                <Activity className="h-5 w-5 text-primary/60" /> Última Actividad de Ventas
              </CardTitle>
              <CardDescription className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                Auditoría en vivo de las últimas transacciones
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              asChild
              className="text-[10px] font-bold text-primary/60 hover:text-primary uppercase tracking-widest"
            >
              <Link href="/admin/orders">Ver todas</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                  <th className="px-8 py-5 text-left">Cliente</th>
                  <th className="px-8 py-5 text-left">Estado</th>
                  <th className="px-8 py-5 text-right">Monto</th>
                  <th className="px-8 py-5 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {recentActivity.map((order) => (
                  <tr
                    key={order.id}
                    className="group hover:bg-white/[0.02] transition-colors duration-200"
                  >
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                          {order.user.name}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground/40 lowercase tracking-tight">
                          {order.user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div
                        className={cn(
                          'inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest',
                          order.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-yellow-500/10 text-yellow-500'
                        )}
                      >
                        {order.status === 'COMPLETED' ? 'Completada' : 'Pendiente'}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-sm font-bold text-white/80 tabular-nums">
                        {formatCurrency(order.amount)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                        {new Date(order.date).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
