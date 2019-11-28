import { Component, Input, OnInit, EventEmitter, Output, HostListener } from '@angular/core';

import { PhotosIterator } from '../../shared/photos-iterator';
import { ApolloSign, IApolloSign } from '../../shared/api-services/apollo/models';

@Component({
  moduleId: module.id,
  selector: 'osc-sequence-add-sign-component',
  templateUrl: 'add-sign-component.component.html',
  styleUrls: ['add-sign-component.component.css']
})
export class SequenceAddSignChildComponent implements OnInit {

  @Input() photosIterator: PhotosIterator;
  @Input() signComponentsList: IApolloSign[] = [];
  @Input() currentSign: IApolloSign = null;
  @Output() signChange = new EventEmitter();

  public addSignFlowSelectedSign: IApolloSign = null;
  public addSignFlowSaving = false;

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event) {
    if ($('input:focus').length === 0) {
      if (!(event.ctrlKey || event.metaKey)) {
        if (event.keyCode === 27) { // ESC - Cancel add
          event.preventDefault();
          this.cancelSign();
        }
      }
    }
  }
  constructor() { }

  ngOnInit() {
    if (this.currentSign) {
      this.addSignFlowSelectedSign = this.currentSign.clone();
    }
  }

  switchToSign(sign: IApolloSign) {
    this.addSignFlowSelectedSign = sign;
  }

  switchToSignQuickSelection(quickSelectSign: IApolloSign) {
    const sign = new ApolloSign();
    sign.cloneFrom(quickSelectSign);
    this.addSignFlowSelectedSign = sign.clone();
  }

  saveSign() {
    if (this.addSignFlowSelectedSign) {
      this.signChange.emit({
        type: 'save',
        sign: this.addSignFlowSelectedSign.clone()
      });
    }
  }

  cancelSign() {
    this.signChange.emit({
      type: 'cancel'
    });
  }

}
