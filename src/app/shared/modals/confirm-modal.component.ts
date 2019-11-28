import { Component } from '@angular/core';

import { DialogRef, ModalComponent, CloseGuard } from 'ngx-modialog';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';

export class ConfirmModalContext extends BSModalContext {
  modalTitle = 'Confirm';
  modalBody = 'Are you sure?';
  cancelButtonText = 'Cancel';
  submitButtonText = 'Submit';
  submitButtonClass = 'btn-success';
}

/**
 * A Sample of how simple it is to create a new window, with its own injects.
 */
@Component({
  selector: 'osc-confirm-modal',
  templateUrl: 'confirm-modal.component.html',
  styleUrls: ['../../shared/modals/base-modal.component.css'],
})
export class ConfirmModalComponent implements CloseGuard, ModalComponent<ConfirmModalContext> {
  context: ConfirmModalContext;

  constructor(public dialog: DialogRef<ConfirmModalContext>) {
    this.context = dialog.context;
    dialog.setCloseGuard(this);
  }

  beforeDismiss(): boolean {
    return false;
  }

  beforeClose(): boolean {
    return false;
  }

  closeModal() {
    this.dialog.close({ submit: false });
  }

  submitModal() {
    this.dialog.close({ submit: true });
  }
}
