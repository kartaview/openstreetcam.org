import { IListenerMaintenance, IListenerMaintenanceMetadata } from './listenerMaintenance.interface';

export class ListenerMaintenance implements IListenerMaintenance {
  id;
  title;
  description;
  level;
  component;
  startDate;
  endDate;
  dateAdded;
  status;

  matchAPIResponseV2(response: any): IListenerMaintenance {
    this.id = response.api;
    this.title = response.title;
    this.description = response.description;
    this.level = response.level;
    this.component = response.component;
    this.startDate = response.startDate;
    this.endDate = response.endDate;
    this.dateAdded = response.dateAdded;
    this.status = response.status;
    this.status = response.status;
    return this;
  }
}

export class ListenerMaintenanceMetadata implements IListenerMaintenanceMetadata {
  hasMoreData = false;
  data = [];

  matchAPIResponseV2(response: any): IListenerMaintenanceMetadata {
    this.data = [];
    this.hasMoreData = false;
    if (response) {
      response.data.forEach((responseItem: any) => {
        const listenerMaintenance = new ListenerMaintenance();
        this.data.push(listenerMaintenance.matchAPIResponseV2(responseItem));
      });
      this.hasMoreData = response.hasMoreData;
    }
    return this;
  }
}
