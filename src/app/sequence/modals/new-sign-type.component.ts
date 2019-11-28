import { Component } from '@angular/core';

import { DialogRef, ModalComponent, CloseGuard } from 'ngx-modialog';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';

import { ApolloDetectionVxService } from '../../shared/api-services/apollo'
import { ApolloSignType } from '../../shared/api-services/apollo/models';

export class CustomModalContext extends BSModalContext {
  public signsList: any;
}

/**
 * A Sample of how simple it is to create a new window, with its own injects.
 */
@Component({
  selector: 'osc-new-sign-type-modal',
  templateUrl: 'new-sign-type.component.html',
  styleUrls: ['../../shared/modals/base-modal.component.css'],
})
export class NewSignTypeModalComponent implements CloseGuard, ModalComponent<CustomModalContext> {
  context: CustomModalContext;

  public checked: boolean;
  private signTitleMinLength = 6;
  public signTitle: string;
  public signTitleError = false;
  public signTitleErrorDetails = '';

  private signInternalNameMinLength = 6;
  public signInternalName: string;
  public signInternalNameError = false;
  public signInternalNameRegExError = false;
  public signCategory: string;
  public signRegion: string;
  public signDescription: string;

  public submitInProgress = false;
  public submitError = false;

  public signsList = null;


  constructor(public dialog: DialogRef<CustomModalContext>, public apolloDetectionsService: ApolloDetectionVxService) {
    this.context = dialog.context;
    this.signsList = this.context.signsList;
    if (this.signsList) {
      if (this.signsList.categories.length > 0) {
        this.signCategory = this.signsList.categories[0];
      }
      if (this.signsList.regionsArray.length > 0) {
        this.signRegion = this.signsList.regionsArray[0].name;
      }
    }
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
    if (this.submitInProgress) {
      return;
    }
    this.signTitleError = false;
    this.signTitleErrorDetails = '';
    this.signInternalNameError = false;
    this.signInternalNameRegExError = false;
    this.submitError = false;

    if (!this.signTitle || this.signTitle.trim().length < this.signTitleMinLength) {
      this.signTitleError = true;
      return false;
    }
    if (!this.signInternalName || this.signInternalName.trim().length < this.signInternalNameMinLength) {
      this.signInternalNameError = true;
      return false;
    }
    if (!/^([A-Z0-9_]{5,})$/.test(this.signInternalName.trim())) {
      this.signInternalNameRegExError = true;
      return false;
    }
    this.submitInProgress = true;
    const newSignType = new ApolloSignType();
    newSignType.name = this.signTitle;
    newSignType.internalName = this.signInternalName;
    newSignType.region = this.signRegion;
    newSignType.type = this.signCategory;
    newSignType.description = this.signDescription;
    this.apolloDetectionsService.createSignType(newSignType).subscribe(
      result => {
        this.submitInProgress = false;
        this.dialog.close({ submit: true, value: this.checked });
      },
      error => {
        this.signTitleErrorDetails = error;
        this.submitInProgress = false;
        this.submitError = true;
      }
    );

  }
}
