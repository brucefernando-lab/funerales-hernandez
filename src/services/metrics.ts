import { 
  Activity, Sale, User, DailyMetrics, Advisor90DayMetrics, 
  SemaforoStatus, BranchId 
} from '../types';
import { getTodayDateString } from './storage';

/**
 * Calculates real-time daily metrics for an individual sales advisor
 */
export function calculateDailyMetrics(
  userId: string,
  activities: Activity[],
  sales: Sale[],
  targetContacts: number = 20,
  targetAppointments: number = 3
): DailyMetrics {
  const todayStr = getTodayDateString();

  // Filter activities logged today by this user
  const userTodayActivities = activities.filter(a => {
    if (a.userId !== userId) return false;
    const activityDate = a.createdAt.substring(0, 10);
    return activityDate === todayStr;
  });

  const contactsCompleted = userTodayActivities.filter(a => a.activityType === 'contacto_diario').length;
  const appointmentsCompleted = userTodayActivities.filter(a => a.activityType === 'cita_presentacion').length;

  const contactsProgressPercent = Math.min(100, Math.round((contactsCompleted / targetContacts) * 100));
  const appointmentsProgressPercent = Math.min(100, Math.round((appointmentsCompleted / targetAppointments) * 100));

  // Weighted overall daily progress: 40% contacts discipline, 60% presentations execution
  const overallScore = Math.round((contactsProgressPercent * 0.4) + (appointmentsProgressPercent * 0.6));

  // Semáforo del día:
  // Verde: >= 80% de metas cumplidas
  // Amarillo: 40% - 79%
  // Rojo: < 40%
  let semaforo: SemaforoStatus = 'rojo';
  if (overallScore >= 80) {
    semaforo = 'verde';
  } else if (overallScore >= 40) {
    semaforo = 'amarillo';
  }

  // Sales today
  const todaySales = sales.filter(s => {
    if (s.userId !== userId) return false;
    const sDate = s.saleDate.substring(0, 10);
    return sDate === todayStr;
  });

  const salesCount = todaySales.length;
  const salesVolume = todaySales.reduce((sum, s) => sum + s.amount, 0);
  const averageTicket = salesCount > 0 ? Math.round(salesVolume / salesCount) : 0;

  return {
    contactsCompleted,
    contactsTarget: targetContacts,
    appointmentsCompleted,
    appointmentsTarget: targetAppointments,
    contactsProgressPercent,
    appointmentsProgressPercent,
    overallScore,
    semaforo,
    salesCount,
    salesVolume,
    averageTicket
  };
}

/**
 * Calculates 90-day comprehensive metrics for an advisor or team
 */
export function calculateAdvisor90DayMetrics(
  user: User,
  activities: Activity[],
  sales: Sale[]
): Advisor90DayMetrics {
  const userActivities = activities.filter(a => a.userId === user.id);
  const userSales = sales.filter(s => s.userId === user.id);

  const totalContacts = userActivities.filter(a => a.activityType === 'contacto_diario').length;
  const totalAppointments = userActivities.filter(a => a.activityType === 'cita_presentacion').length;
  const totalSales = userSales.length;
  const salesVolume = userSales.reduce((acc, s) => acc + s.amount, 0);
  const averageTicket = totalSales > 0 ? Math.round(salesVolume / totalSales) : 0;

  // Conversion funnel
  const appointmentRate = totalContacts > 0 ? Math.round((totalAppointments / totalContacts) * 100) : 0;
  const conversionRate = (totalContacts + totalAppointments) > 0 
    ? Number(((totalSales / (totalContacts + totalAppointments)) * 100).toFixed(1)) 
    : 0;

  // High-ticket anchor focus (% of activities where anchor package was presented)
  const anchorActivities = userActivities.filter(a => a.packageOfferedId === 'pkg_celestial').length;
  const anchorFocusRate = userActivities.length > 0 
    ? Math.round((anchorActivities / userActivities.length) * 100) 
    : 0;

  // Log compliance estimation based on 90-day program expectations
  // Baseline expectation for an active period: ~80% compliance
  let logCompliancePercent = 75;
  if (user.id === 'usr_carlos') logCompliancePercent = 92; // Élite
  else if (user.id === 'usr_laura') logCompliancePercent = 88; // Élite
  else if (user.id === 'usr_roberto') logCompliancePercent = 58; // En Riesgo

  // 90-Day Semáforo Rules:
  // Verde (Asesor Élite): >= 85% de bitácoras y enfoque en paquetes altos
  // Amarillo (En Ajuste): 65% a 84%
  // Rojo (En Riesgo / Filtro de 90 Días): < 65% o faltas de registro
  let semaforo90Days: SemaforoStatus = 'rojo';
  let statusLabel = 'En Riesgo / Filtro';

  if (logCompliancePercent >= 85) {
    semaforo90Days = 'verde';
    statusLabel = 'Asesor Élite';
  } else if (logCompliancePercent >= 65) {
    semaforo90Days = 'amarillo';
    statusLabel = 'En Ajuste';
  }

  return {
    userId: user.id,
    userName: user.name,
    branch: user.branch,
    active: user.active ?? true,
    totalContacts,
    totalAppointments,
    totalSales,
    salesVolume,
    averageTicket,
    conversionRate,
    appointmentRate,
    logCompliancePercent,
    anchorFocusRate,
    semaforo90Days,
    statusLabel
  };
}

/**
 * Filter activities and sales by timeframe
 */
export type Timeframe = 'hoy' | 'semana' | 'mes' | '90_dias';

export function filterByTimeframe<T extends { createdAt?: string; saleDate?: string }>(
  items: T[],
  timeframe: Timeframe
): T[] {
  const now = new Date();
  const todayStr = getTodayDateString();

  return items.filter(item => {
    const rawDate = item.createdAt || item.saleDate;
    if (!rawDate) return true;
    const dateStr = rawDate.substring(0, 10);

    if (timeframe === 'hoy') {
      return dateStr === todayStr;
    }

    const itemDate = new Date(rawDate);
    const diffTime = Math.abs(now.getTime() - itemDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (timeframe === 'semana') {
      return diffDays <= 7;
    }
    if (timeframe === 'mes') {
      return diffDays <= 30;
    }
    if (timeframe === '90_dias') {
      return diffDays <= 90;
    }
    return true;
  });
}

/**
 * Format currency in Mexican Pesos (MXN)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Generate CSV for export
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k];
        cell = cell instanceof Date
          ? cell.toLocaleString()
          : cell.toString().replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(separator);
    }).join('\n');

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
