export const delay = (ms: number): Promise<void> => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

export const prettifyTime = (ms: number): string => {
  const hours = Math.floor(ms / 1000 / 60 / 60);
  const minutes = Math.floor((ms / 1000 / 60 / 60 - hours) * 60);
  const seconds = Math.floor(
    ((ms / 1000 / 60 / 60 - hours) * 60 - minutes) * 60,
  );

  let str = "";

  if (hours > 0) {
    str += `${hours}h `;
  }

  if (minutes > 0) {
    str += `${minutes}m `;
  }

  if (seconds > 0) {
    str += `${seconds}s`;
  }

  if (str.length === 0) {
    str = `${Math.round(ms)}ms`;
  }

  return str;
};

export const secondsToMs = (seconds: number): number => {
  return seconds * 1000;
};

export const minutesToMs = (minutes: number): number => {
  return secondsToMs(minutes * 60);
};

export const hoursToMs = (hours: number): number => {
  return minutesToMs(hours * 60);
};

export const daysToMs = (days: number): number => {
  return hoursToMs(days * 24);
};

export const monthsToMs = (months: number): number => {
  return daysToMs(months * 30);
};

export const yearsToMs = (years: number): number => {
  return monthsToMs(years * 12);
};

export const formatDateShortHeader = (date: Date): string => {
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const isYesterday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate() - 1;
  const isThisWeek =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() >= now.getDate() - now.getDay();
  const isThisYear = date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "numeric",
    });
  } else if (isYesterday) {
    return `Yesterday, ${date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "numeric",
    })}`;
  } else if (isThisWeek) {
    return date.toLocaleDateString([], {
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
    });
  } else if (isThisYear) {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  } else {
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }
};

export const formatDateShortPast = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff >= hoursToMs(24 * 7)) {
    return `${Math.floor(diff / hoursToMs(24 * 7))}w`;
  } else if (diff >= hoursToMs(24)) {
    return `${Math.floor(diff / hoursToMs(24))}d`;
  } else if (diff >= minutesToMs(60)) {
    return `${Math.floor(diff / minutesToMs(60))}h`;
  } else if (diff >= secondsToMs(60)) {
    return `${Math.floor(diff / secondsToMs(60))}m`;
  } else if (diff > 30) {
    return `${Math.floor(diff / 1000)}s`;
  }
  return "now";
};

export const getTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export class TimeoutError extends Error {
  constructor() {
    super("Timeout");
  }
}

export const withTimeout = async <T>(
  promise: () => Promise<T>,
  ms: number,
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError());
    }, ms);

    promise()
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};
