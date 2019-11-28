import { Component } from '@angular/core';

import { DialogRef, ModalComponent, CloseGuard } from 'ngx-modialog';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';

/**
 * A Sample of how simple it is to create a new window, with its own injects.
 */
@Component({
  selector: 'osc-base-app-modal',
  templateUrl: 'base-modal.component.html',
  styleUrls: ['base-modal.component.css'],
})
export class BaseModalComponent implements CloseGuard, ModalComponent<BSModalContext> {
  context: BSModalContext;

  constructor(public dialog: DialogRef<BSModalContext>) {
    this.context = dialog.context;
    dialog.setCloseGuard(this);
  }

  beforeDismiss(): boolean {
    return false;
  }

  beforeClose(): boolean {
    return false;
    // return this.checked;
  }
  closeModal() {
    this.dialog.close();
  }
}
