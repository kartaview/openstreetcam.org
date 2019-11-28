import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'osc-id-alert-modal-content',
  templateUrl: 'id-alert-modal-content.component.html',
  styleUrls: ['modal-content.component.css'],
})
export class IdAlertModalContentComponent {
  constructor(public activeModal: NgbActiveModal) { }
}
