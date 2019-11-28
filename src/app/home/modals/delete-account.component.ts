import { Component } from '@angular/core';

import { DialogRef, ModalComponent, CloseGuard } from 'ngx-modialog';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';

export class CustomModalContext extends BSModalContext {
  public checked: boolean;
}

/**
 * A Sample of how simple it is to create a new window, with its own injects.
 */
@Component({
  selector: 'osc-delete-account-modal',
  templateUrl: 'delete-account.component.html',
  styleUrls: ['../../shared/modals/base-modal.component.css'],
})
export class DeleteAccountModalComponent implements CloseGuard, ModalComponent<CustomModalContext> {
  context: CustomModalContext;

  public checked: boolean;

  constructor(public dialog: DialogRef<CustomModalContext>) {
    this.context = dialog.context;
    this.checked = true;
    dialog.setCloseGuard(this);
  }

  deleteModalCheckbox(value) {
    this.checked = value;
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
    this.dialog.close({ submit: true, value: this.checked });
  }
}
