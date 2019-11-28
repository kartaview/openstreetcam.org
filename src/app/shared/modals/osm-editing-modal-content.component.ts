import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export enum EditStatus {
  FIXED = 'FIXED',
  ALREADY_FIXED = 'ALREADY_FIXED',
  BAD_SIGN = 'BAD_SIGN',
  OTHER = 'OTHER',
}

@Component({
  selector: 'osc-osmediting-modal-content',
  templateUrl: 'osm-editing-modal-content.component.html',
  styleUrls: ['modal-content.component.css'],
})
export class OsmEditingModalContentComponent implements OnInit {
  @Input() title: string;
  @Input() error = false;
  @Input() errorMessage = '';
  @Output() save = new EventEmitter<any>();
  EditStatus = EditStatus;
  editStatus: EditStatus;
  editStatusReason = '';
  subGroup = false;

  constructor(public activeModal: NgbActiveModal) { }
  onSave() {
    this.save.emit({ editStatus: this.editStatus, editStatusReason: this.editStatusReason });
  }

  ngOnInit() {
    this.editStatus = EditStatus.FIXED;
    this.editStatusReason = '';
  }

  hideSubGroup() {
    this.subGroup = false;
  }

  showSubGroup() {
    this.subGroup = true;
    this.editStatus = EditStatus.BAD_SIGN;
  }
}
