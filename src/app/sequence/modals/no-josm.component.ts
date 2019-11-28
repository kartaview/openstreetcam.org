import { Component } from '@angular/core';
import { BaseModalComponent } from '../../shared/modals';

/**
 * A Sample of how simple it is to create a new window, with its own injects.
 */
@Component({
  selector: 'osc-no-josm-modal',
  templateUrl: 'no-josm.component.html',
  styleUrls: ['../../shared/modals/base-modal.component.css'],
})
export class NoJOSMModalComponent extends BaseModalComponent {
  closeModal() {
    super.closeModal();
  }
}
