import { Component, Input, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { overlayConfigFactory } from 'ngx-modialog';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Modal, BSModalContext } from 'ngx-modialog/plugins/bootstrap';

import { PhotosIterator } from '../../shared/photos-iterator';
import {
  ApolloDetection, IApolloDetection, IApolloSign, IApolloContribution, ApolloContribution, ApolloUpdateDetection, IApolloAuthor,
  ApolloAuthor
} from '../../shared/api-services/apollo/models';
import {
  Point
} from '../../shared/api-services/common/models';

import { ApolloDetectionVxService } from '../../shared/api-services/apollo'
import { AuthProviderService } from '../../shared/auth/authProvider.service';
import { environment } from '../../../environments/environment';
import { NewSignTypeModalComponent } from '../modals';


@Component({
  moduleId: module.id,
  selector: 'osc-sequence-tab-detections',
  templateUrl: 'tab-detections.component.html',
  styleUrls: ['tabs-base.css']
})
export class SequenceTabDetectionsComponent implements OnInit {

  @Input() photosIterator: PhotosIterator;
  @Input() signFilterEnabled = false;
  @Input() addSelectionInProgress = false;
  @Input() signsList = null;

  @Input() selectionInProgressRegion = null;
  @Input() addSelectionInProgressParent: IApolloDetection = null;
  @Input() defaultCountryCode = null;
  @Output() imageGalleryEvent = new EventEmitter();

  protected _contributors: IApolloContribution[] = null;
  @Input()
  set contributors(list: IApolloContribution[]) {
    this._contributors = list;
    this.currentDetectionContribution = null;
    this.osmContribution = null;
    this.oscContribution = null
    if (this._contributors) {
      for (const contribution of this._contributors) {
        for (const edit of contribution.edits) {
          if (edit.type === 'EDIT_STATUS_CHANGE') {
            if (!this.osmContribution) {
              this.osmContribution = contribution;
            }
          }
          if (edit.type === 'SIGN_CHANGE' || edit.type === 'VALIDATION_STATUS_CHANGE' || edit.type === 'LOCATION_ON_PHOTO_CHANGE') {
            if (!this.oscContribution) {
              this.oscContribution = contribution;
            }
          }
        }
      }
    }
  }
  get contributors(): IApolloContribution[] {
    return this._contributors;
  }

  public imagesValidationVerifiedVisible = true;

  public validationVerifiedVisible = true;

  public addSignFlowEnabled = environment.apollo.signDetectionsNewDetection;
  public addSignTypeFlowEnabled = environment.apollo.signDetectionsNewSignType;

  public editSignFlowStarted = false;
  public editSignFlowEnabled = environment.apollo.signDetectionsNewDetection;

  public currentDetection: IApolloDetection = null;
  public currentDetectionContribution: IApolloContribution = null;
  public currentDetectionLabels = null;


  osmContribution: IApolloContribution;
  oscContribution: IApolloContribution;

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event) {
    if ($('input:focus').length === 0 && !(this.modal.overlay.stackLength > 0 ||
      (this.modalService as any)._modalStack._applicationRef.viewCount > 1)) {
      if (this.addSignTypeFlowEnabled && this.selectionInProgressRegion && event.shiftKey
        && event.keyCode === 78) { // New sign type - SHIFT + N
        this.startAddSignTypeFlow();
      }
    }
  }

  constructor(public apolloDetectionsService: ApolloDetectionVxService, public auth: AuthProviderService, public modal: Modal,
    public modalService: NgbModal) {
  }

  ngOnInit() {
    this.photosIterator.currentDetection.subscribe(detection => {
      this.editSignFlowStarted = false;
      if (this.currentDetection !== detection) {
        this.currentDetection = detection;
        if (detection) {
          this.currentDetectionLabels = {
            validationStatus: this.currentDetection.getValidationStatusLabel(),
          };
        }
      }
    });
    this.photosIterator.panoramaViewerEnabled.subscribe(value => {
      if (value) {
        setTimeout(() => {
          if (this.addSignFlowEnabled && !this.addSelectionInProgress) {
            this.addSelectionInProgress = false;
          } else if (this.addSelectionInProgress) {
            this.closeAddSignFlow();
          }
        });
      }
    });
  }

  startAddSignComponentFlow() {
    if (this.addSignFlowEnabled && !this.addSelectionInProgress) {
      if (!this.auth.isLoggedIn()) {
        this.callImageGalleryEvent({ type: 'show-login-screen' });
        return;
      }
      this.callImageGalleryEvent({ type: 'start-add-sign-component-selection', detection: this.currentDetection });
    }
  }

  startAddSignTypeFlow() {
    const dialog = this.modal.open(NewSignTypeModalComponent, overlayConfigFactory({
      size: 'md',
      signsList: this.signsList
    }, BSModalContext));
    dialog.result
      .then((r: any) => {
        if (r && r.submit) {
          this.callImageGalleryEvent({ type: 'reload-signs-list' });
        }
      }, (error) => {
        // failure
        console.log('Dialog ended with failure: ', error);
      });

  }

  startAddSignFlow() {
    if (this.addSignFlowEnabled && !this.addSelectionInProgress) {
      if (!this.auth.isLoggedIn()) {
        this.callImageGalleryEvent({ type: 'show-login-screen' });
        return;
      }
      this.callImageGalleryEvent({ type: 'start-add-sign-selection' });
    }
  }

  closeAddSignFlow() {
    if (this.addSelectionInProgress) {
      this.callImageGalleryEvent({ type: 'cancel-add-sign-selection' });
    }
  }

  startEditSignFlow() {
    if (this.editSignFlowEnabled && !this.editSignFlowStarted) {
      if (!this.auth.isLoggedIn()) {
        this.callImageGalleryEvent({ type: 'show-login-screen' });
        return;
      }
      this.editSignFlowStarted = true;
    }
  }

  closeEditSignFlow() {
    if (this.editSignFlowStarted) {
      this.editSignFlowStarted = false;
    }
  }

  closeDetectionDetails() {
    this.photosIterator.clearCurrentDetection();
  }

  addSignEvent(event) {
    if (event.type === 'save') {
      if (this.addSelectionInProgress) {
        const createdDetection = this.getCreateDetection(event.sign);
        if (this.addSelectionInProgressParent) {
          createdDetection.parentId = this.addSelectionInProgressParent.id;
        }
        createdDetection.locationOnPhoto = this.selectionInProgressRegion;
        this.apolloDetectionsService.create(createdDetection).subscribe(detectionId => {
          // this.showAlert('success', 'Change has been saved!');
          this.callImageGalleryEvent({ type: 'complete-sign-selection' });
          // createdDetection.id = detectionId;
          this.apolloDetectionsService.get(detectionId).subscribe(detectionInfo => {
            this.photosIterator.addDetection(detectionInfo);
          });
          this.callImageGalleryEvent({ type: 'cancel-add-sign-selection' });
        }, error => {
          this.showAlert('error', error ? error : 'Error on saving changes. Try again later.');
        });
      }
    } else if (event.type === 'cancel') {
      this.closeAddSignFlow();
    }
  }

  editSignChange(event) {
    if (event.type === 'save') {
      const updateDetection = new ApolloUpdateDetection();
      const editedDetection = new ApolloDetection();
      editedDetection.id = this.currentDetection.id;
      if (this.currentDetection.parentId) {
        editedDetection.parentId = this.currentDetection.parentId;
      }
      editedDetection.sign = event.sign.clone();
      /* if (detection.validationStatus !== 'CHANGED') {
        editedDetection.validationStatus = 'CHANGED';
      }*/
      updateDetection.detection = editedDetection;
      updateDetection.contribution = this.getContribution();
      this.apolloDetectionsService.update(updateDetection).subscribe(data => {
        this.currentDetection.sign = event.sign.clone();
        // this.showAlert('success', 'Change has been saved!');
        // this.toggleEditSelection();
        this.callImageGalleryEvent({ type: 'complete-sign-selection' });
        this.currentDetection.validationStatus = 'CHANGED';
        this.photosIterator.updateDetection(this.currentDetection);
        // this.disableEditSelection();
      }, error => {
        this.showAlert('error', 'Error on saving changes. Try again later.');
      });
    } else if (event.type === 'cancel') {
      this.closeEditSignFlow();
    }
  }

  validateDetection() {
    this.callImageGalleryEvent({ type: 'validate-detection', detection: this.currentDetection });
  }

  invalidateDetection() {
    this.callImageGalleryEvent({ type: 'invalidate-detection', detection: this.currentDetection });
  }

  reviewLaterDetection() {
    this.callImageGalleryEvent({ type: 'reviewlater-detection', detection: this.currentDetection });
  }

  getCreateDetection(sign: IApolloSign): IApolloDetection {
    const detection = new ApolloDetection();
    detection.sign = sign.clone();
    detection.sequenceId = this.photosIterator.getCurrentPhoto().sequenceId;
    detection.sequenceIndex = this.photosIterator.getCurrentPhoto().sequenceIndex;
    const point = new Point();
    point.lat = this.photosIterator.getCurrentPhoto().lat;
    point.lon = this.photosIterator.getCurrentPhoto().lng;
    detection.point = point;
    detection.mode = 'MANUAL';
    detection.author = this.getContributionAuthor();
    return detection;
  }

  public getContributionAuthor(): IApolloAuthor {
    const author = new ApolloAuthor();
    author.externalId = this.auth.getExternalUserId();
    author.username = this.auth.getUsername();
    author.oscId = this.auth.getUserId().toString();
    author.type = this.auth.getProvider().getApolloName().toUpperCase();
    return author;
  }

  public getContribution(): IApolloContribution {
    const contribution = new ApolloContribution();
    contribution.author = this.getContributionAuthor();
    return contribution;
  }

  callImageGalleryEvent(event) {
    this.imageGalleryEvent.emit(event);
  }

  showAlert(type, message) {
    this.modal.alert().showClose(false).body(message).open();
  }

}
