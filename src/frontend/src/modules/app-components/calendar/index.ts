/**
 * FullCalendar - Calendários e agendamentos
 *
 * Re-exporta componentes do FullCalendar v6.
 *
 * @see https://fullcalendar.io/
 */

// Main calendar component
export { default as Calendar } from '@fullcalendar/react';

// Plugins
export { default as dayGridPlugin } from '@fullcalendar/daygrid';
export { default as timeGridPlugin } from '@fullcalendar/timegrid';
export { default as interactionPlugin } from '@fullcalendar/interaction';

// Types
export type {
  CalendarOptions,
  EventInput,
  EventClickArg,
  EventDropArg,
} from '@fullcalendar/core';

export type {
  DateClickArg,
} from '@fullcalendar/interaction';

/**
 * Configuração padrão do calendário com tema da plataforma
 */
export const DEFAULT_CALENDAR_CONFIG = {
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  buttonText: {
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia'
  },
  locale: 'pt-br',
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: 3,
  weekends: true,
  height: '100%',
};
