import { Component } from '@angular/core';
import { BaseModalComponent } from './base-modal.component';
/**
 * A Sample of how simple it is to create a new window, with its own injects.
 */
@Component({
  selector: 'osc-get-app-modal',
  templateUrl: 'get-app.component.html',
  styleUrls: ['get-app.component.css'],
})
export class GetAppModalComponent extends BaseModalComponent {
  closeModal() {
    super.closeModal();
  }
}
