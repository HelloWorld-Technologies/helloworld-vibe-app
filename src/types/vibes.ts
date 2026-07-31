export type Vibe = {
  id: number;
  code: string;
  display_name: string;
};

export type VibesApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};
