export interface ApiResponse<T> {
  isSuccess: boolean;
  value: T | null;
  message: string;
  errors: string[];
  statusCode: number;
}
