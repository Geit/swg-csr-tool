export const typeTagToString = (typeTag: number) => {
  return [
    (typeTag & 0xff000000) >> 24,
    (typeTag & 0x00ff0000) >> 16,
    (typeTag & 0x0000ff00) >> 8,
    typeTag & 0x000000ff,
  ].reduce((acc, cur) => `${acc}${String.fromCharCode(cur)}`, '');
};
