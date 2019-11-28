import { Component, HostBinding } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { Overlay } from 'ngx-modialog';
import { Modal } from 'ngx-modialog/plugins/bootstrap';

import { ListenerVxService } from './shared/api-services/osc';
import {
  EListenerMaintenanceLevel, EListenerMaintenanceComponent, EListenerMaintenanceStatus
} from './shared/api-services/osc/requests/v2';
import { environment } from 'environments/environment';

@Component({
  selector: 'osc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public maintenanceMessageEnabled = false;
  public maintenanceMessage: string = null;
  public maintenanceMessageLevel: string = null;
  @HostBinding('class.dark-theme') private blackBackground = false;
  @HostBinding('class.lightgray-theme') private lightGrayBackground = false;

  constructor(private router: Router, overlay: Overlay, public modal: Modal, private listenerVxService: ListenerVxService) {

    this.checkMaintenance();

    router.events.subscribe(val => {
      if (val instanceof RoutesRecognized) {
        this.blackBackground = val.state.root.children[0].data['pageTheme'] === 'dark'
          || val.state.root.children[0].data['pageTheme'] === 'dark-custom';
        this.lightGrayBackground = val.state.root.children[0].data['pageTheme'] === 'light-gray';
      }
    });
  }

  closeMaintenanceAlert() {
    setTimeout(() => {
      this.maintenanceMessageEnabled = false;
    }, 300);
  }

  private checkMaintenance() {
    if (environment.maintenance && environment.maintenance.enabled) {
      this.maintenanceMessage = environment.maintenance.message;
      if (environment.maintenance.level === 'error') {
        this.maintenanceMessageLevel = 'danger';
      } else {
        this.maintenanceMessageLevel = 'warning';
      }
      this.maintenanceMessageEnabled = true;
    } else {
      setTimeout(() => {
        this.listenerVxService.getMaintenances({
          orderBy: 'endDate', component: EListenerMaintenanceComponent.FRONTEND,
          status: EListenerMaintenanceStatus.ACTIVE
        }).subscribe(maintenanceData => {
          if (maintenanceData.data && maintenanceData.data.length > 0) {
            maintenanceData.data.some(maintenanceItem => {
              this.maintenanceMessage = maintenanceItem.description;
              if (maintenanceItem.level === EListenerMaintenanceLevel.ERROR) {
                this.maintenanceMessageLevel = 'danger';
              } else {
                this.maintenanceMessageLevel = 'warning';
              }
              this.maintenanceMessageEnabled = true;
              return true;
            })
          }
        });
      }, 50);
    }
  }
}
