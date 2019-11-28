import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'osc-osm-alert-modal-content',
  templateUrl: 'osm-alert-modal-content.component.html',
  styleUrls: ['modal-content.component.css'],
})
export class OsmAlertModalContentComponent {
  constructor(public activeModal: NgbActiveModal) { }
}
