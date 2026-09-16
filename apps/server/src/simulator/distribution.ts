export function standardNormal(random: () => number): number {
  const u1 = Math.max(random(), Number.EPSILON);
  const u2 = Math.max(random(), Number.EPSILON);

  return Math.sqrt(-2 * Math.log(u1))
    * Math.cos(2 * Math.PI * u2);
}