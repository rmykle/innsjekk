export const getMonday = () => {
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  const daysFromMonday = monday.getDay() === 0 ? 6 : monday.getDay() - 1;
  monday.setDate(monday.getDate() - daysFromMonday);
  return monday;
};

export const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
};

export const nextTick = () => {
  const nextTick = new Date();
  nextTick.setHours(nextTick.getHours() + 1, 0, 0, 0);
  return nextTick;
};
