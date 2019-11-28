import { EListenerMaintenanceLevel, EListenerMaintenanceComponent, EListenerMaintenanceStatus } from '../requests/v2';
export interface IListenerMaintenance {
  id: number;
  title: string;
  description: string;
  level: EListenerMaintenanceLevel;
  component: EListenerMaintenanceComponent;
  startDate: string;
  endDate: string;
  dateAdded: string;
  status: EListenerMaintenanceStatus;
  matchAPIResponseV2(response: any): IListenerMaintenance;
}

export interface IListenerMaintenanceMetadata {
  hasMoreData: boolean;
  data: IListenerMaintenance[];

  matchAPIResponseV2(response: any[]): IListenerMaintenanceMetadata;
}
