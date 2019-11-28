import { Component, Input } from '@angular/core';


/**
 * This class represents the lazy loaded UserComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-user-topbar-common',
  templateUrl: 'topbar-common.component.html',
  styleUrls: ['topbar-common.component.css']
})
export class UserTopBarComponent {
  @Input() userData: any;

  /**
   * Creates an instance of the UserTopBarComponent
   */
  constructor() {

  }
}
