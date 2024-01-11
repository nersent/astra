export const createThrottle = (time: number) => {
  let last = 0;
  return () => {
    if (last + time < performance.now()) {
      last = performance.now();
      return true;
    }
    return false;
  };
};
