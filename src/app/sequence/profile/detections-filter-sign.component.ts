import {
  Component, Input, Output, EventEmitter, ViewChild, OnInit
} from '@angular/core';
import { PerfectScrollbarConfigInterface, PerfectScrollbarComponent, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';

import { environment } from 'environments/environment';

@Component({
  selector: 'osc-detections-filter-sign',
  templateUrl: './detections-filter-sign.component.html',
  styleUrls: ['./detections-filter-sign.component.css']
})
export class DetectionsFilterSignComponent implements OnInit {
  @Input() signsList = null;
  @Input() objectValue = {};
  @Input() arrayValue = [];
  @Output() change = new EventEmitter();
  public _signFilterSelectedRegion = environment.apollo.apiDefaultRegion;
  @Input()
  set signFilterSelectedRegion(signRegion) {
    if (!signRegion) {
      signRegion = environment.apollo.apiDefaultRegion;
    }
    this._signFilterSelectedRegion = signRegion;
  }
  get signFilterSelectedRegion() {
    return this._signFilterSelectedRegion;
  }

  @Output() signFilterSelectedRegionChange = new EventEmitter();

  @Input() allPhotosSelectionValue = false;
  allPhotosSelectionValueTemp = false;

  signSelectionVisible = false;
  objectValueTemp = {};
  arrayValueTemp = [];


  public perfectScrollbarOptions: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
    wheelSpeed: 0.25
  };

  @ViewChild(PerfectScrollbarComponent) componentScroll: PerfectScrollbarComponent;
  @ViewChild(PerfectScrollbarDirective) directiveScroll: PerfectScrollbarDirective;


  constructor() { }

  ngOnInit() {
  }

  switchSignsList() {
    if (!this.signSelectionVisible) {
      this.showSignsList();
    } else {
      this.cancelSignSelection();
    }
  }
  showSignsList() {
    if (!this.signSelectionVisible) {
      this.signSelectionVisible = true;
      this.objectValueTemp = JSON.parse(JSON.stringify(this.objectValue));
      this.arrayValueTemp = JSON.parse(JSON.stringify(this.arrayValue));
      this.allPhotosSelectionValueTemp = this.allPhotosSelectionValue;
    }
  }

  cancelSignSelection() {
    this.signSelectionVisible = false;
  }

  compareArrays(array1, array2) {
    if (array1.length !== array2.length) {
      return false;
    }
    for (let i = 0; i < array2.length; i++) {
      if (array1[i].compare) { // To test values in nested arrays
        if (!array1[i].compare(array2[i])) {
          return false;
        }
      } else if (array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  }

  saveSignSelection() {
    this.signSelectionVisible = false;
    if (
      !this.compareArrays(this.arrayValue.sort(), this.arrayValueTemp.sort()) ||
      this.allPhotosSelectionValue !== this.allPhotosSelectionValueTemp
    ) {

      this.objectValue = JSON.parse(JSON.stringify(this.objectValueTemp));
      this.arrayValue = JSON.parse(JSON.stringify(this.arrayValueTemp));
      this.allPhotosSelectionValue = this.allPhotosSelectionValueTemp;
      this.change.emit({
        objectData: this.objectValue,
        arrayData: this.arrayValue,
        allPhotoDetections: this.allPhotosSelectionValue
      });
      this.signFilterSelectedRegionChange.emit({ signRegion: this._signFilterSelectedRegion });
    }
  }

  selectSign(sign) {
    if (this.objectValueTemp[sign.internalName]) {
      if (this.arrayValueTemp.indexOf(sign.internalName) > -1) {
        const index = this.arrayValueTemp.indexOf(sign.internalName);
        if (index > -1) {
          this.arrayValueTemp.splice(index, 1);
        }
      }
      delete this.objectValueTemp[sign.internalName];
    } else {
      this.objectValueTemp[sign.internalName] = true
      this.arrayValueTemp.push(sign.internalName);
    }
  }

  /*selectAll() {
    this.signsList.forEach(signCategory => {
      signCategory.signs.forEach(sign => {
        if (!this.objectValueTemp[sign.internalName]) {
          this.objectValueTemp[sign.internalName] = true;
          this.arrayValueTemp.push(sign.internalName);
        }
      });
    });
  }*/

  selectNone() {
    this.arrayValueTemp = [];
    this.objectValueTemp = {}
  }

  switchToSignRegionUI(signRegion) {
    if (this._signFilterSelectedRegion !== signRegion.name) {
      this.selectNone();
      this._signFilterSelectedRegion = signRegion.name;
    }
  }

  changeAllPhotosSelectionValue() {
    this.allPhotosSelectionValueTemp = !this.allPhotosSelectionValueTemp;
  }

}
