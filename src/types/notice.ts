export type NoticeConfirmStatus = 'Unread' | 'Read' | 'UnConfirm' | 'Allow' | 'NotAllow';

export interface Notice {
  ID: number;
  Content: string;
  Time: string;
  ConfirmStat: NoticeConfirmStatus;
}

export interface NoticeResponse {
  action: string;
  success: boolean;
  message: string;
  config_data?: Notice[];
}

export interface NoticeRequest {
  action: string;
  page?: number;
  page_size?: number;
  config_data?: Notice;
  confirm?: boolean;
}
