import { Component, Input } from '@angular/core';

/**
 * This class represents the lazy loaded UserComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-user-driver-topbar',
  templateUrl: 'driver-topbar.component.html',
  styleUrls: ['driver-topbar.component.css']
})
export class UserDriverTopBarComponent {

  @Input()
  userData: any = {};

  /**
   * Creates an instance of the UserDriverTopBarComponent
   */
  constructor() {
  }

}
