export type ReceiverDashboardStats = {
  totalExpected: number;
  inTransit: number;
  delivered: number;
  awaitingConfirmation: number;
  arrivingToday: number;
};

export type ApiResponse<T> = {
  status: "success" | "fail" | "error";
  data: T;
};
