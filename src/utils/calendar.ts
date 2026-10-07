export interface UpcomingFeast {
  ethiopicDay: number;
  gregorianDate: Date;
  formattedDateEn: string;
  formattedDateAm: string;
}

export interface NextServiceInfo {
  titleEn: string;
  titleAm: string;
  categoryEn: string;
  categoryAm: string;
  dateEn: string;
  dateAm: string;
  time: string;
  isToday: boolean;
}

const ethiopicDayFormatter = new Intl.DateTimeFormat('en-u-ca-ethiopic', { day: 'numeric' });

const ukDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const amharicMonths = [
  'ጃንዩወሪ', 'ፌብሩወሪ', 'ማርች', 'ኤፕሪል', 'ሜይ', 'ጁን',
  'ጁላይ', 'ኦገስት', 'ሴፕቴምበር', 'ኦክቶበር', 'ኖቬምበር', 'ዲሴምበር',
];

const amharicDays = [
  'እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ',
];

export function formatAmharicGregorianDate(d: Date): string {
  const dayName = amharicDays[d.getDay()];
  const dayNum = d.getDate();
  const monthName = amharicMonths[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}፣ ${dayNum} ${monthName} ${year}`;
}

export function getNextEthiopicFeastDate(targetEthiopicDay: number, fromDate: Date = new Date()): Date {
  const cursor = new Date(fromDate);
  cursor.setHours(0, 0, 0, 0);

  for (let i = 0; i <= 35; i++) {
    const currentEthDay = parseInt(ethiopicDayFormatter.format(cursor), 10);
    // If it's today, check if it's already past midday
    if (currentEthDay === targetEthiopicDay) {
      if (i > 0 || fromDate.getHours() < 12) {
        return new Date(cursor);
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return cursor;
}

export function getUpcomingFeasts(fromDate: Date = new Date()): Record<number, UpcomingFeast> {
  const feastDays = [16, 21, 23];
  const results: Record<number, UpcomingFeast> = {};

  for (const day of feastDays) {
    const gregDate = getNextEthiopicFeastDate(day, fromDate);
    results[day] = {
      ethiopicDay: day,
      gregorianDate: gregDate,
      formattedDateEn: ukDateFormatter.format(gregDate),
      formattedDateAm: formatAmharicGregorianDate(gregDate),
    };
  }

  return results;
}

export function getNextScheduledService(now: Date = new Date()): NextServiceInfo {
  const currentDay = now.getDay(); // 0 is Sunday, 6 is Saturday
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute;

  // Sunday Divine Liturgy: 07:30 to 11:30
  // Saturday Evening Prayer: 17:00 to 19:30

  // 1. Check if today is Sunday and service is not over (before 11:30)
  if (currentDay === 0 && currentTimeVal < 11 * 60 + 30) {
    return {
      titleEn: 'Sunday Divine Liturgy (Kidase)',
      titleAm: 'የሰንበት ቅዳሴ',
      categoryEn: 'Weekly Divine Liturgy',
      categoryAm: 'የሰንበት ቅዳሴ',
      dateEn: `Today (${ukDateFormatter.format(now)})`,
      dateAm: `ዛሬ (${formatAmharicGregorianDate(now)})`,
      time: '07:30 – 11:30',
      isToday: true,
    };
  }

  // 2. Check if today is Saturday and evening prayer is not over (before 19:30)
  if (currentDay === 6 && currentTimeVal < 19 * 60 + 30) {
    return {
      titleEn: 'Saturday Evening Prayer & Mahlet',
      titleAm: 'የቅዳሜ ምሽት ዋዜማ እና ማኅሌት',
      categoryEn: 'Evening Prayer & Wazema',
      categoryAm: 'የምሽት ጸሎት እና ዋዜማ',
      dateEn: `Today (${ukDateFormatter.format(now)})`,
      dateAm: `ዛሬ (${formatAmharicGregorianDate(now)})`,
      time: '17:00 – 19:30',
      isToday: true,
    };
  }

  // 3. Otherwise, find the next upcoming service day (Saturday or Sunday, whichever comes first)
  const nextSaturday = new Date(now);
  const daysUntilSat = (6 - currentDay + 7) % 7 || (currentTimeVal >= 19 * 60 + 30 ? 7 : 0);
  nextSaturday.setDate(now.getDate() + daysUntilSat);
  nextSaturday.setHours(17, 0, 0, 0);

  const nextSunday = new Date(now);
  const daysUntilSun = (7 - currentDay) % 7 || (currentTimeVal >= 11 * 60 + 30 ? 7 : 0);
  nextSunday.setDate(now.getDate() + daysUntilSun);
  nextSunday.setHours(7, 30, 0, 0);

  // If Saturday comes before Sunday
  if (nextSaturday.getTime() < nextSunday.getTime() && daysUntilSat > 0) {
    return {
      titleEn: 'Saturday Evening Prayer & Mahlet',
      titleAm: 'የቅዳሜ ምሽት ዋዜማ እና ማኅሌት',
      categoryEn: 'Weekly Evening Prayer',
      categoryAm: 'የምሽት ጸሎት',
      dateEn: ukDateFormatter.format(nextSaturday),
      dateAm: formatAmharicGregorianDate(nextSaturday),
      time: '17:00 – 19:30',
      isToday: false,
    };
  }

  // Otherwise, next Sunday Divine Liturgy
  return {
    titleEn: 'Sunday Divine Liturgy (Kidase)',
    titleAm: 'የሰንበት ቅዳሴ',
    categoryEn: 'Weekly Divine Liturgy',
    categoryAm: 'የሰንበት ቅዳሴ',
    dateEn: ukDateFormatter.format(nextSunday),
    dateAm: formatAmharicGregorianDate(nextSunday),
    time: '07:30 – 11:30',
    isToday: false,
  };
}
