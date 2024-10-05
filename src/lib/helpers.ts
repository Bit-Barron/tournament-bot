export function getStatusColor(status: string): number {
  switch (status) {
    case "PENDING":
      return 0xffa500;
    case "ONGOING":
      return 0x00ff00;
    case "COMPLETED":
      return 0x0000ff;
    case "CANCELLED":
      return 0xff0000;
    default:
      return 0x808080;
  }
}

export function calculateDuration(startDate: Date): string {
  const endDate = new Date();
  const durationMs = endDate.getTime() - startDate.getTime();
  const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  return `${days} days, ${hours} hours`;
}
