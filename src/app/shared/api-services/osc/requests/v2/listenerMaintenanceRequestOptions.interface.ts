import { IApiOSCV2RequestOptions } from './apiOSCV2RequestOptions.interface';

export enum EListenerMaintenanceLevel {
  WARNING = 'warning',
  ERROR = 'error',
  NOTICE = 'notice'
}

export enum EListenerMaintenanceComponent {
  FRONTEND = 'frontend',
  DASHBOARD = 'dashboard'
}

export enum EListenerMaintenanceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface IApiOSCListenerMaintenanceRequestOptions extends IApiOSCV2RequestOptions {
  startDate?: string;
  endDate?: string;
  level?: EListenerMaintenanceLevel;
  component?: EListenerMaintenanceComponent;
  status?: EListenerMaintenanceStatus;
}
