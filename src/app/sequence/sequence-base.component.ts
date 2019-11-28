import { Component, ViewChild, OnInit, HostBinding, NgZone, HostListener } from '@angular/core';
import { overlayConfigFactory } from 'ngx-modialog';
import { Modal, BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarConfigInterface, PerfectScrollbarComponent, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';

import { environment } from 'environments/environment';

import {
  OsmEditingModalContentComponent, OsmAlertModalContentComponent, IdAlertModalContentComponent
} from '../shared/modals';
import { ConfirmModalComponent } from '../shared/modals';


import { SequenceImageGalleryComponent } from './profile';

import { SequenceVxService, PhotoVxService } from '../shared/api-services/osc';
import { ApolloDetectionVxService } from '../shared/api-services/apollo'

import { AuthProviderService } from '../shared/auth/authProvider.service';
import { PhotosIterator } from '../shared/photos-iterator';


import { AuthModalComponent, AuthModalContext } from '../shared/modals/auth-modal.component';

import {
  IApolloDetection, ApolloAuthor, ApolloDetection, ApolloContribution, IApolloContribution, ApolloUpdateDetection
} from '../shared/api-services/apollo/models';

import {
  IRectangle
} from '../shared/api-services/common/models';


import { ISequence, Sequence, IPhoto, Photo, IUploadHistory, UploadHistory } from '../shared/api-services/osc/models';

export abstract class SequenceBaseComponent {
  @HostBinding('class.mobile-screen-enabled') mobileScreenEnabled = true;
  detectionsEnabled = true;
  detectionsNewDetection = true;
  taggingEnabled = true;

  sidebarTab = 'track-info'; // track-info/edit-osm/detections

  public perfectScrollbarOptions: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
    useBothWheelAxes: true,
    wheelSpeed: 0.5
  };


  josmLoading = false;
  isLoading = false;
  errorFound = false;
  errorMessage;
  sequenceData: ISequence;
  uploadHistory: IUploadHistory;
  currentSequenceId = 0;

  currentPhotoCache: IPhoto = null;
  currentDetectionContributorsCache: IApolloContribution[];

  showFullSizePhotos = false;
  showFullSizeWrapped360 = false;

  panAndZoomToDetectionEnabled = false;
  panoramaViewerEnabled = false;

  rotationAngles = [0, 90, 180, 270];
  @HostBinding('class.rotate-enabled') rotationStarted = false;
  rotationDirection = 0;
  rotationIndex = 0;
  currentMarker: any = { lat: 0, lng: 0, zoom: 19, enabled: false, autoCenter: true };
  currentMarkerRendererRotationDelta = 0;
  currentMarkerRendererRotationDeltaTimeout = null;
  addSelectionInProgress = false;
  addSelectionInProgressParent = null;
  selectionInProgressRegion = null;
  onEditSelection = false;
  staticAlertClosed = false;
  openedIDWindow;
  @ViewChild('imageGallery') imageGallery: SequenceImageGalleryComponent;

  photosIterator: PhotosIterator;

  public signsList;
  temporaryLoading = false;
  temporaryLoadingMessage = '';

  constructor(public sequenceService: SequenceVxService, public photoService: PhotoVxService,
    public apolloDetectionsService: ApolloDetectionVxService, public modal: Modal,
    public modalService: NgbModal, public auth: AuthProviderService) {

  }
  protected initComponentBaseComponent() {
    this.photosIterator.panoramaViewerEnabled.subscribe(value => {
      this.panoramaViewerEnabled = value;
    });
    this.photosIterator.currentDetection.subscribe(detection => {
      // this.currentDetectionContributorsCache = null;
      if (detection) {
        this.apolloDetectionsService.getContributors(detection.id).subscribe(contributors => {
          this.currentDetectionContributorsCache = contributors;
        });
        this.apolloDetectionsService.get(detection.id).subscribe(detectionData => {
          detection.author = detectionData.author;
          detection.creationTimestamp = detectionData.creationTimestamp;
          detection.editStatus = detectionData.editStatus;
          detection.validationStatus = detectionData.validationStatus;
          detection.sign = detectionData.sign;
          detection.locationOnPhoto = detectionData.locationOnPhoto;
        });
      }
    });
  }

  protected _showLoading() {
    this.isLoading = true;
  }

  protected _hideLoading() {
    this.isLoading = false;
  }

  checkMobileSwitch() {
    this.mobileScreenEnabled = (window.innerWidth <= 959);
    if (this.mobileScreenEnabled) {
      if (this.addSelectionInProgress) {
        this.disableAddSelection();
      }
      if (this.onEditSelection) {
        this.disableEditSelection();
      }
    }
  }

  editinDetectionInApp(appName, detection) {
    if (!this.detectionsEnabled) {
      return false;
    }
    const modalRef = this.modalService.open(OsmEditingModalContentComponent, { size: 'sm' });
    modalRef.componentInstance.title = (appName === 'josm') ? 'OSM review status' : 'ID review status';
    modalRef.componentInstance.save.subscribe((editStatusData) => {
      if (this.auth.isLoggedIn()) {
        if (this.auth.getProvider().getName() !== 'openstreetmap') {
          modalRef.componentInstance.error = true;
          modalRef.componentInstance.errorMessage = 'You have to be logged in with OpenStreetMap account!';
        } else {
          const updateDetection = new ApolloUpdateDetection();
          const changedDetection = new ApolloDetection();
          changedDetection.id = detection.id;
          changedDetection.editStatus = editStatusData.editStatus;
          detection.editStatus = editStatusData.editStatus;
          updateDetection.detection = changedDetection;
          updateDetection.contribution = this.getContribution();
          updateDetection.contribution.comment = editStatusData.editStatusReason;
          this.apolloDetectionsService.update(updateDetection).subscribe(updateDetectionData => {
            this.photosIterator.updateDetection(detection);
            modalRef.componentInstance.error = false;
            this.showAlert('success', 'Change has been saved!');
            modalRef.close();
          }, error => {
            modalRef.componentInstance.error = true;
            modalRef.componentInstance.errorMessage = 'Server error! Please try again later!';
          });
        }
      } else {
        modalRef.componentInstance.error = true;
        modalRef.componentInstance.errorMessage = 'You have to be logged in to save the changes!';
      }
    });
  }

  openInJOSM() {
    const currentPhoto = this.photosIterator.getCurrentPhoto();
    if (!currentPhoto) {
      return false;
    }
    const detection = this.photosIterator.getCurrentDetection();
    const url = 'http://127.0.0.1:8111/load_and_zoom?left=' +
      (currentPhoto.lng * 1 - 0.002) + '&right=' +
      (currentPhoto.lng * 1 + 0.002) + '&top=' +
      (currentPhoto.lat * 1 + 0.001) + '&bottom=' +
      (currentPhoto.lat * 1 - 0.001);
    $.get(url, {}, (data) => {
      if (detection && detection.id) {
        window.setTimeout(() => {
          this.josmLoading = false;
          this.editinDetectionInApp('josm', detection);
        }, 1000);
      }
    }).fail(() => {
      this.josmLoading = false;
      const modalRef = this.modalService.open(OsmAlertModalContentComponent);
    });
  }

  openInId() {
    const currentPhoto = this.photosIterator.getCurrentPhoto();
    if (!currentPhoto) {
      return false;
    }
    const detection = this.photosIterator.getCurrentDetection();
    if (detection && detection.id) {
      this.editinDetectionInApp('id', detection);
    }
    const idUrl = environment.idUrl + '?v=' + Date.now() + '#map=24/' + currentPhoto.lat + '/' + currentPhoto.lng;
    this.openedIDWindow = window.open(idUrl, 'org_openstreetmap_edit_osc');
    this.openedIDWindow.location.reload(false);
  }

  deletePhoto() {
    const currentPhoto = this.photosIterator.getCurrentPhoto();
    if (!currentPhoto) {
      return false;
    }
    const dialog = this.modal.open(ConfirmModalComponent, overlayConfigFactory({
      modalTitle: 'Delete photo',
      modalBody: 'Are you sure you want to delete this photo?',
      cancelButtonText: 'Cancel',
      submitButtonText: 'Delete',
      submitButtonClass: 'btn-danger',
      size: 'sm'
    }, BSModalContext));
    dialog.result
      .then((r: any) => {
        if (r && r.submit) {
          this.photoService.delete(currentPhoto.id).subscribe((response) => {
            if (response) {
              this.imageGallery.removeFromCache(currentPhoto.id);
              this.photosIterator.removePhotoById(currentPhoto.id);
              console.log('delete photo');
              // delete photo
            } else {
              this.modal.alert().showClose(false).title('Error').body('Photo cannot be deleted!').open();
            }
          }, error => {
            this.modal.alert().showClose(false).title('Error').body('Photo cannot be deleted! ' + error).open();
          });
        } else {
          // TODO: when photo delete is canceled
          console.log('delete cancel');
        }
      }, error => {
        console.log('Dialog ended with failure: ', error);
      });

  }

  showTemporaryLoading(message) {
    this.temporaryLoading = true;
    this.temporaryLoadingMessage = message;
  }

  hideTemporaryLoading() {
    this.temporaryLoading = false;
  }

  saveRotation() {
    if (this.rotationStarted) {
      this.showTemporaryLoading('Image rotate');
      this.photoService.rotate(
        this.currentPhotoCache.sequenceId, this.currentPhotoCache.id, this.currentPhotoCache.sequenceIndex,
        this.rotationAngles[this.rotationIndex], false
      ).subscribe(result => {
        this.taggingEnabled = true;
        this.photosIterator.enableSwitching();
        this.rotationStarted = false;
        this.rotationIndex = 0;
        this.rotationDirection = 0;
        this.imageGallery.reloadCurrentPhoto(false);
        this.modal.alert().showClose(false).title('Success').body('Rotation succeed!').open();
        this.hideTemporaryLoading();
      }, error => {
        this.modal.alert().showClose(false).title('Error').body('Rotation failed!').open();
        this.hideTemporaryLoading();
      });
    }
  }

  resetRotation() {
    if (this.rotationStarted) {
      this.photosIterator.enableSwitching();
      this.taggingEnabled = true;
      this.rotationStarted = false;
      this.rotationIndex = 0;
      this.rotationDirection = 0;
      this.imageGallery.resetRotation();
    }
  }

  fixRotationIndex() {
    if (this.rotationIndex < 0) {
      this.rotationIndex = this.rotationAngles.length - 1;
    }
    if (this.rotationIndex > this.rotationAngles.length - 1) {
      this.rotationIndex = 0;
    }
  }

  rotatePhotoRight() {
    if (!this.rotationStarted) {
      this.rotationStarted = true;
    }
    if (this.photosIterator.switchingEnabled()) {
      this.photosIterator.disableSwitching();
    }
    this.taggingEnabled = false;
    this.rotationIndex += 1;
    this.fixRotationIndex();
    this.rotationDirection = 1;
    this.imageGallery.rotateRight();
  }

  rotatePhotoLeft() {
    if (!this.rotationStarted) {
      this.rotationStarted = true;
    }
    if (this.photosIterator.switchingEnabled()) {
      this.photosIterator.disableSwitching();
    }
    this.taggingEnabled = false;
    this.rotationIndex -= 1;
    this.fixRotationIndex();
    this.rotationDirection = -1;
    this.imageGallery.rotateLeft();
  }

  sequenceIndexChange(event) {
    if (!this.rotationStarted || (this.rotationStarted && confirm('Are you sure to cancel the changes?'))) {
      this.resetRotation();
    }
  }

  imageGalleryEvent(event) {
    if (event.type === 'hq') {
      this.showFullSizePhotos = !this.showFullSizePhotos;
    } else if (event.type === 'wrapped-360') {
      this.showFullSizeWrapped360 = !this.showFullSizeWrapped360;
    } else if (event.type === 'detection-auto-zoom') {
      this.panAndZoomToDetectionEnabled = !this.panAndZoomToDetectionEnabled;
      if (this.panAndZoomToDetectionEnabled && this.photosIterator.isDetectionSelected()) {
        this.imageGallery.panAndZoomToDetection(this.photosIterator.getCurrentDetection());
      } else if (!this.panAndZoomToDetectionEnabled && this.photosIterator.isDetectionSelected()) {
        this.imageGallery.resetOrientationAndZoom(true);
      }
    } else if (event.type === 'validate-detection') {
      this.confirmDetection(event.detection, event.callback);
    } else if (event.type === 'invalidate-detection') {
      this.invalidDetection(event.detection, event.callback);
    } else if (event.type === 'reviewlater-detection') {
      this.reviewLaterDetection(event.detection, event.callback);
    } else if (event.type === 'update-detection-rectangle') {
      this.updateDetectionRectangle(event.detection, event.rectangle, event.callback);
    } else if (event.type === 'rotate-left') {
      this.rotatePhotoLeft();
    } else if (event.type === 'rotate-right') {
      this.rotatePhotoRight();
    } else if (event.type === 'delete') {
      this.deletePhoto();
    } else if (event.type === 'josm') {
      this.openInJOSM();
    } else if (event.type === 'id') {
      this.openInId();
    } else if (event.type === 'complete-sign-selection') {
      this.imageGallery.completeSignSelection();
    } else if (event.type === 'start-add-sign-selection') {
      this.enableAddSelection();
    } else if (event.type === 'start-add-sign-component-selection') {
      this.enableAddSelection(event.detection);
    } else if (event.type === 'cancel-add-sign-selection') {
      this.disableAddSelection();
    } else if (event.type === 'show-login-screen') {
      this.showLoginModal();
    } else if (event.type === 'selection-region') {
      this.selectionInProgressRegion = event.locationOnPhoto;
    } else if (event.type === 'cancel-photo-rotation') {
      this.resetRotation();
    } else if (event.type === 'save-photo-rotation') {
      this.saveRotation();
    } else if (event.type === 'reload-signs-list') {
      this.reloadSignsList();
    }
  }

  public reloadSignsList() {
    this.apolloDetectionsService.getSignsList().subscribe(
      (signsList) => {
        this.signsList = signsList;
        setTimeout(() => {
          this.imageGallery.reloadSignsInMemory();
        }, 1);
      },
      () => {
      });

  }

  public getContribution(): IApolloContribution {
    const contribution = new ApolloContribution();
    const author = new ApolloAuthor();
    author.externalId = this.auth.getExternalUserId();
    author.username = this.auth.getUsername();
    author.oscId = this.auth.getUserId().toString();
    author.type = this.auth.getProvider().getApolloName().toUpperCase();
    contribution.author = author;
    return contribution;
  }

  enableAddSelection(subcomponentParent = null) {
    if (!this.addSelectionInProgress && !this.auth.isLoggedIn()) {
      this.showLoginModal();
      return;
    }
    this.addSelectionInProgress = true;
    this.selectionInProgressRegion = null;
    this.addSelectionInProgressParent = subcomponentParent;
    $(window).trigger('resize');
    if (this.imageGallery) {
      this.imageGallery.enableAddSelection(subcomponentParent);
    }
  }

  disableAddSelection() {
    this.addSelectionInProgress = false;
    this.selectionInProgressRegion = null;
    if (this.imageGallery) {
      this.imageGallery.disableAddSelection();
    }
  }

  enableEditSelection() {
    if (this.photosIterator.getCurrentDetection()) {
      this.onEditSelection = true;
      $(window).trigger('resize');
      if (this.imageGallery) {
        this.imageGallery.enableEditSelection(this.photosIterator.getCurrentDetection());
      }
    }
  }

  disableEditSelection() {
    this.onEditSelection = false;
    if (this.imageGallery) {
      this.imageGallery.disableEditSelection();
    }
  }


  toggleAddSelection() {
    if (!environment.apollo.signDetectionsNewDetection) {
      return;
    }
    if (!this.onEditSelection && this.taggingEnabled) {
      if (!this.addSelectionInProgress) {
        this.enableAddSelection();
      } else {
        this.disableAddSelection();
      }
    }
  }

  toggleEditSelection() {
    if (!environment.apollo.signDetectionsNewDetection) {
      return;
    }
    if (!this.addSelectionInProgress && this.photosIterator.currentStats.detectionId && this.taggingEnabled) {
      if (!this.onEditSelection) {
        this.enableEditSelection();
      } else {
        this.disableEditSelection();
      }
    }
  }

  confirmDetection(detection: IApolloDetection = null, callback: Function = null) {
    if (!this.auth.isLoggedIn()) {
      this.showLoginModal();
      return;
    }
    if (this.detectionsEnabled && this.taggingEnabled) {
      let foundDetection = this.photosIterator.getCurrentDetection();
      if (
        !(this.onEditSelection || this.addSelectionInProgress) &&
        (
          !detection && this.photosIterator.currentStats.detectionId && foundDetection && foundDetection.validationStatus !== 'CONFIRMED'
        )
      ) {
        // nothing to do yet
      } else if (detection) {
        foundDetection = detection;
      }
      if (foundDetection && foundDetection.validationStatus !== 'CONFIRMED') {
        const newDetection = foundDetection.clone();
        newDetection.validationStatus = 'CONFIRMED';
        const updateDetection = new ApolloUpdateDetection();
        updateDetection.contribution = this.getContribution();
        updateDetection.detection.id = newDetection.id;
        updateDetection.detection.validationStatus = 'CONFIRMED';
        this.apolloDetectionsService.update(updateDetection).subscribe(data => {
          this.apolloDetectionsService.get(newDetection.id).subscribe(detectionData => {
            this.photosIterator.updateDetection(detectionData);
            if (callback) {
              callback();
            }
          });
        }, error => {
          if (error.indexOf('Invalid validationStatus') >= 0) {
            this.apolloDetectionsService.get(newDetection.id).subscribe(detectionData => {
              this.photosIterator.updateDetection(detectionData);
              if (callback) {
                callback();
              }
            });
          } else {
            this.showAlert('error', 'Error on saving changes. Try again later.');
          }
        });
      }
    }
  }

  invalidDetection(detection: IApolloDetection = null, callback: Function = null) {
    if (!this.auth.isLoggedIn()) {
      this.showLoginModal();
      return;
    }
    if (this.detectionsEnabled && this.taggingEnabled) {
      let foundDetection = this.photosIterator.getCurrentDetection();
      if (
        !(this.onEditSelection || this.addSelectionInProgress) &&
        (
          !detection && this.photosIterator.currentStats.detectionId && foundDetection && foundDetection.validationStatus !== 'REMOVED'
        )
      ) {
        // nothing to do yet
      } else if (detection) {
        foundDetection = detection;
      }

      if (foundDetection && foundDetection.validationStatus !== 'REMOVED') {
        const newDetection = foundDetection.clone(); // we need to clone it for change detection to work
        newDetection.validationStatus = 'REMOVED';
        const updateDetection = new ApolloUpdateDetection();
        updateDetection.contribution = this.getContribution();
        updateDetection.detection.id = newDetection.id;
        updateDetection.detection.validationStatus = 'REMOVED';
        this.apolloDetectionsService.update(updateDetection).subscribe(data => {
          this.apolloDetectionsService.get(newDetection.id).subscribe(detectionData => {
            this.photosIterator.updateDetection(detectionData);
            if (callback) {
              callback();
            }
          });
        }, error => {
          if (error.indexOf('Invalid validationStatus') >= 0) {
            this.apolloDetectionsService.get(newDetection.id).subscribe(detectionData => {
              this.photosIterator.updateDetection(detectionData);
              if (callback) {
                callback();
              }
            });
          } else {
            this.showAlert('error', error);
          }
        });
      }
    }
  }

  reviewLaterDetection(detection: IApolloDetection = null, callback: Function = null) {
    if (!this.auth.isLoggedIn()) {
      this.showLoginModal();
      return;
    }
    if (this.detectionsEnabled && this.taggingEnabled) {
      let foundDetection = this.photosIterator.getCurrentDetection();
      if (
        !(this.onEditSelection || this.addSelectionInProgress) &&
        (
          !detection && this.photosIterator.currentStats.detectionId && foundDetection &&
          foundDetection.validationStatus !== 'TO_BE_REVIEWED_LATER'
        )
      ) {
        // nothing to do yet
      } else if (detection) {
        foundDetection = detection;
      }

      if (foundDetection && foundDetection.validationStatus !== 'TO_BE_REVIEWED_LATER') {
        const newDetection = foundDetection.clone(); // we need to clone it for change detection to work
        newDetection.validationStatus = 'TO_BE_REVIEWED_LATER';
        const updateDetection = new ApolloUpdateDetection();
        updateDetection.contribution = this.getContribution();
        updateDetection.detection.id = newDetection.id;
        updateDetection.detection.validationStatus = 'TO_BE_REVIEWED_LATER';
        this.apolloDetectionsService.update(updateDetection).subscribe(data => {
          this.apolloDetectionsService.get(newDetection.id).subscribe(detectionData => {
            this.photosIterator.updateDetection(detectionData);
            if (callback) {
              callback();
            }
          });
        }, error => {
          if (error.indexOf('Invalid validationStatus') >= 0) {
            this.apolloDetectionsService.get(newDetection.id).subscribe(detectionData => {
              this.photosIterator.updateDetection(detectionData);
              if (callback) {
                callback();
              }
            });
          } else {
            this.showAlert('error', error);
          }
        });
      }
    }
  }

  updateDetectionRectangle(detection: IApolloDetection, rectangle: IRectangle, callback: Function = null) {
    if (!this.auth.isLoggedIn()) {
      this.showLoginModal();
      return;
    }
    if (this.detectionsEnabled && this.taggingEnabled) {
      let foundDetection = this.photosIterator.getCurrentDetection();
      if (
        !(this.onEditSelection || this.addSelectionInProgress) &&
        (
          !detection && this.photosIterator.currentStats.detectionId && foundDetection && foundDetection.validationStatus !== 'REMOVED'
        )
      ) {
        // nothing to do yet
      } else if (detection) {
        foundDetection = detection;
      }

      if (foundDetection) {
        const newDetection = foundDetection.clone(); // we need to clone it for change detection to work
        const updateDetection = new ApolloUpdateDetection();
        updateDetection.contribution = this.getContribution();
        updateDetection.detection.id = newDetection.id;
        updateDetection.detection.locationOnPhoto = rectangle;
        this.apolloDetectionsService.update(updateDetection).subscribe(data => {
          this.apolloDetectionsService.get(newDetection.id).subscribe(detectionData => {
            this.photosIterator.updateDetection(detectionData);
            if (callback) {
              callback();
            }
          });
        }, error => {
          this.showAlert('error', 'Error on saving changes. Try again later.');
        });
      }
    }
  }

  showAlert(type, message) {
    this.modal.alert().showClose(false).body(message).open();
  }

  showLoginModal() {
    const dialog = this.modal.open(AuthModalComponent, overlayConfigFactory({ size: 'sm', showDescription: true }, AuthModalContext));
    dialog.result
      .then((r) => {
      }, (error) => {
        console.log('Dialog ended with failure: ', error);
      });
  }

  setCurrentMarkerRotationDelta(rotationDelta: number) {
    clearTimeout(this.currentMarkerRendererRotationDeltaTimeout);
    this.currentMarkerRendererRotationDeltaTimeout = setTimeout(() => {
      this.currentMarkerRendererRotationDelta = rotationDelta;
    }, 5);
  }

}
