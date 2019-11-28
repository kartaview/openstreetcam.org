import { Component, Input } from '@angular/core';

/**
 * This class represents the navigation bar component.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-loading',
  templateUrl: 'loading.component.html',
  styleUrls: ['loading.component.css'],
})
export class AppLoadingComponent {
  @Input() title = 'Loading...';

  constructor() {
  }
}
