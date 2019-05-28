export const shortDateTime = date => {
  return `${date.getHours() < 10 ? "0" : ""}${date.getHours()}:${
    date.getMinutes() < 10 ? "0" : ""
  }${date.getMinutes()}`;
};

export const isSameDate = (a, b) => {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
};
