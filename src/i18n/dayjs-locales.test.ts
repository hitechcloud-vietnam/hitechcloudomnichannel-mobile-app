import dayjs from 'dayjs';

import {
  formatCalendarDate,
  formatClockTime,
  formatDateTime,
  setDayjsLocale,
} from '@/i18n/dayjs-locales';

afterEach(() => {
  dayjs.locale('en');
});

describe('setDayjsLocale', () => {
  it('maps pt-BR to the pt-br dayjs locale', () => {
    setDayjsLocale('pt-BR');
    expect(dayjs.locale()).toBe('pt-br');
  });

  it('maps pt-PT to the pt dayjs locale (dayjs has no distinct pt-pt)', () => {
    setDayjsLocale('pt-PT');
    expect(dayjs.locale()).toBe('pt');
  });

  it('maps zh-CN and zh-TW to their lowercase dayjs equivalents', () => {
    setDayjsLocale('zh-CN');
    expect(dayjs.locale()).toBe('zh-cn');
    setDayjsLocale('zh-TW');
    expect(dayjs.locale()).toBe('zh-tw');
  });

  it('maps a simple language like vi to its identity lowercase locale', () => {
    setDayjsLocale('vi');
    expect(dayjs.locale()).toBe('vi');
  });
});

describe('formatCalendarDate', () => {
  const date = '2026-03-05T14:07:00';

  it('keeps the Vietnamese day-month order instead of the English one', () => {
    setDayjsLocale('vi');
    expect(formatCalendarDate(date, { withYear: false })).toBe('5 tháng 3');
    expect(formatCalendarDate(date, { withYear: true })).toBe('5 tháng 3 năm 2026');
  });

  it('formats English as month-day', () => {
    setDayjsLocale('en');
    expect(formatCalendarDate(date, { withYear: false })).toBe('March 5');
    expect(formatCalendarDate(date, { withYear: true })).toBe('March 5, 2026');
  });

  it('drops a year that leads the format (ja/zh)', () => {
    setDayjsLocale('ja');
    expect(formatCalendarDate(date, { withYear: false })).toBe('3月5日');
  });

  it('keeps a month suffix glued to the month (fi partitive)', () => {
    setDayjsLocale('fi');
    expect(formatCalendarDate(date, { withYear: false })).toBe('5. maaliskuuta');
  });
});

describe('formatClockTime / formatDateTime', () => {
  it('uses the 24-hour clock in Vietnamese', () => {
    setDayjsLocale('vi');
    expect(formatClockTime('2026-03-05T14:07:00')).toBe('14:07');
    expect(formatDateTime('2026-03-05T14:07:00')).toBe('5 tháng 3 năm 2026 14:07');
  });
});
