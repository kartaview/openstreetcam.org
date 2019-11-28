import { Component, Input, Output, EventEmitter } from '@angular/core';
import { overlayConfigFactory } from 'ngx-modialog';
import { Modal, BSModalContext } from 'ngx-modialog/plugins/bootstrap';

import { SequenceVxService } from '../../shared/api-services/osc/sequenceVx.service';
import { AuthProviderService } from '../../shared/auth/authProvider.service';

import { ConfirmModalComponent } from '../../shared/modals';

@Component({
  moduleId: module.id,
  selector: 'osc-user-sequences-list',
  templateUrl: 'sequences-list.component.html',
  styleUrls: ['sequences-list.component.css']
})
export class UserSequencesListComponent {

  @Input() userSequences: any = {};
  @Output() sequencesScrollDown: EventEmitter<any> = new EventEmitter();

  constructor(protected sequenceService: SequenceVxService, protected auth: AuthProviderService, protected modal: Modal) {
  }

  onScrollDown() {
    this.sequencesScrollDown.emit(null);
  }

  deleteSequence(event, sequence) {
    event.stopPropagation();
    const dialog = this.modal.open(ConfirmModalComponent, overlayConfigFactory({
      modalTitle: 'Deletion confirm',
      modalBody: 'Do you want to permanently remove this track?',
      cancelButtonText: 'Cancel',
      submitButtonText: 'Delete',
      submitButtonClass: 'btn-danger',
      size: 'sm'
    }, BSModalContext));

    dialog.result
      .then((r: any) => {
        if (r && r.submit) {
          this.sequenceService.delete(sequence.id)
            .subscribe(
            deleteResult => {
              if (deleteResult) {
                this.internalRemove(sequence)
              } else {
                this.modal.alert().showClose(false).title('Error').body('There was a problem deleting sequence!').open();
              }
            },
            error => {
              this.modal.alert().showClose(false).title('Error').body('There was a problem deleting sequence!').open();
            }
            );
        } else {
          // TODO: when photo delete is canceled
          console.log('delete cancel');
        }
      }, (error) => {
        console.log('Dialog ended with failure: ', error);
      });
  }

  internalRemove(sequence) {
    const index = this.userSequences.indexOf(sequence);
    if (index > -1) {
      this.userSequences.splice(index, 1);
    }
  }

}
