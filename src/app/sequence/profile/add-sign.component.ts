import { Component, Input, OnInit, EventEmitter, Output, HostListener } from '@angular/core';
import { LocalStorage, LocalStorageService } from 'ngx-webstorage';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PhotosIterator } from '../../shared/photos-iterator';
import { ApolloSign, IApolloSign } from '../../shared/api-services/apollo/models';
import { environment } from 'environments/environment';

@Component({
  moduleId: module.id,
  selector: 'osc-sequence-add-sign',
  templateUrl: 'add-sign.component.html',
  styleUrls: ['add-sign.component.css']
})
export class SequenceAddSignComponent implements OnInit {

  @Input() photosIterator: PhotosIterator;
  @Input() signsList = null;
  @Input() currentSign: IApolloSign = null;
  @Output() signChange = new EventEmitter();
  @LocalStorage('quickSelection', []) public quickSelection;

  public addSignFlowSelectedRegion = environment.apollo.apiDefaultRegion;
  public addSignFlowSelectedCategory = null;
  public addSignFlowSelectedSign: IApolloSign = null;
  public addSignFlowSaving = false;

  public addSignSearchEnabled = true;
  public addSignSearchStarted = false;
  public addSignSearchLoading = false;
  public _addSignSearchText = '';
  public addSignSearchTextTags = [];

  public _defaultCountryCode: string = null;

  public categoryName = null;

  @Input()
  set addSignSearchText(text: string) {
    if (text.trim().length > 0) {
      this._addSignSearchText = text;
      this.addSignSearchTextTags = this._addSignSearchText.trim().toLowerCase().split(' ');
      this.addSignSearchStarted = true;
    } else {
      this._addSignSearchText = '';
      this.addSignSearchTextTags = [];
      this.addSignSearchStarted = false;
    }
  }
  get addSignSearchText() {
    return this._addSignSearchText;
  }

  @Input()
  set defaultCountryCode(defaultCountryCode: string) {
    if (defaultCountryCode && this._defaultCountryCode !== defaultCountryCode) {
      this.signsList.regionsArray.some(region => {
        if (region.enabled && region.visible) {
          if (region.countryCodes.indexOf(defaultCountryCode) > -1) {
            this.addSignFlowSelectedRegion = region.name;
            return true;
          }
        }
      });
    }
    this._defaultCountryCode = defaultCountryCode;
  }
  get defaultCountryCode() {
    return this._defaultCountryCode;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event) {
    if ($('input:focus').length === 0 && !(this.modal.overlay.stackLength > 0 ||
      (this.modalService as any)._modalStack._applicationRef.viewCount > 1)) {
      if (!(event.ctrlKey || event.metaKey)) {
        if (event.keyCode === 27) { // ESC - Cancel add
          event.preventDefault();
          this.cancelSign();
        } else if (event.keyCode === 13) { // ENTER - Save add
          event.preventDefault();
          // this.cancelSign();
        }
      }
      if (this.addSignSearchEnabled) {
        if ((event.ctrlKey || event.metaKey) && event.keyCode === 70) { // Search focus
          event.preventDefault();
          $('#search-sign-type').focus();
        }
      }
    }
  }
  constructor(private localStorage: LocalStorageService, public modal: Modal, public modalService: NgbModal) {
  }

  ngOnInit() {
    if (this.currentSign) {
      this.switchToSignRegion(this.currentSign.region);
      this.switchToSignCategory(this.currentSign.type);
      this.addSignFlowSelectedSign = this.currentSign.clone();
    }
    if (this.quickSelection && this.quickSelection instanceof Array && this.quickSelection.length > 0) {

    } else {
      this.quickSelection = [];
    }
  }

  updateQuickSelection(sign: IApolloSign) {
    let index = 0;
    this.quickSelection.some(currentSign => {
      if (currentSign.internalName === sign.internalName) {
        this.quickSelection.splice(index, 1);
      }
      index++;
    });
    this.quickSelection.unshift(sign);
    this.localStorage.store('quickSelection', this.quickSelection.slice(0, 12));
  }

  switchToSignRegionUI(signRegion) {
    if (signRegion.enabled) {
      this.switchToSignRegion(signRegion.name);
    }
  }

  switchToSignRegion(region) {
    this.addSignFlowSelectedRegion = region;
    this.addSignFlowSelectedCategory = null;
    this.addSignFlowSelectedSign = null;
  }

  switchToSignCategory(category) {
    this.addSignFlowSelectedCategory = category;
    this.addSignFlowSelectedSign = null;
    if (!category) {
      this.categoryName = null;
    } else {
      this.categoryName = this.signsList.regions[this.addSignFlowSelectedRegion][category].name;
    }
  }

  switchToSign(sign: IApolloSign) {
    this.addSignFlowSelectedSign = sign;
  }

  switchToSignQuickSelection(quickSelectSign: IApolloSign) {
    const sign = new ApolloSign();
    sign.cloneFrom(quickSelectSign);
    this.switchToSignRegion(sign.region);
    this.switchToSignCategory(sign.type);
    this.addSignFlowSelectedSign = sign.clone();
  }

  switchToSignSearch(selectSign) {
    const sign = new ApolloSign();
    sign.cloneFrom(selectSign);
    this.switchToSignRegion(sign.region);
    this.switchToSignCategory(sign.type);
    this.addSignFlowSelectedSign = sign.clone();
    this.clearSearchText();
  }

  saveSign() {
    if (this.addSignFlowSelectedSign) {
      this.updateQuickSelection(this.addSignFlowSelectedSign);
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


  textBoxKeyPress(event) {
  }

  clearSearchText() {
    this._addSignSearchText = '';
    this.addSignSearchTextTags = [];
    this.addSignSearchStarted = false;
  }

}
