import { Component, NgZone, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { overlayConfigFactory } from 'ngx-modialog';
import { Modal, BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SequenceVxService, PhotoVxService } from '../shared/api-services/osc';
import { ApolloDetectionVxService, ApolloStatisticsVxService } from '../shared/api-services/apollo'
import { ConfirmModalComponent } from '../shared/modals';

import { IApolloDetection } from '../shared/api-services/apollo/models';
import { IPhoto } from '../shared/api-services/osc/models';

import { environment } from 'environments/environment';
import { NavbarService } from '../shared/navbar/navbar.service';

import { AuthProviderService } from '../shared/auth/authProvider.service';
import { PhotosIterator } from '../shared/photos-iterator';

import { SequenceBaseComponent } from './sequence-base.component';

@Component({
  moduleId: module.id,
  selector: 'osc-sign-view',
  templateUrl: 'sign-view.component.html',
  styleUrls: ['sequence-base.component.css', 'sign-view.component.css']
})
export class SignViewComponent extends SequenceBaseComponent {

  errorMessage = 'Photos cannot be loaded...';
  errorReload = true;

  currentPage = 1;
  hasMorePages = false;
  morePagesLoading = false;
  loadMorePagesTimeout = null;

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event) {
    if (this.modal.overlay.stackLength > 0 || (this.modalService as any)._modalStack._applicationRef.viewCount > 1
      || $('input:focus').length === 1) {
      // VERY DIRTY HACK FOR NGBMODAL SERVICE
      return;
    }
    if (event.ctrlKey || event.metaKey) {
      if (!this.panoramaViewerEnabled) {
        if (event.keyCode === 37) { // left
          event.preventDefault();
          this.photosIterator.switchToPrevDetection();
        } else if (event.keyCode === 39) { // right
          event.preventDefault();
          this.photosIterator.switchToNextDetection();
        } else if (event.keyCode === 38) { // up
          event.preventDefault();
          this.confirmDetection();
        } else if (event.keyCode === 40) { // down
          event.preventDefault();
          this.invalidDetection();
        } else if (event.keyCode === 89) { // Y - confirm
          event.preventDefault();
          this.confirmDetection();
        } else if (event.keyCode === 78) { // N - invalid
          console.log('invalid');
          event.preventDefault();
          this.invalidDetection();
        } else if (event.keyCode === 191) { // ? - review later
          event.preventDefault();
          this.reviewLaterDetection();
        } else if (event.keyCode === 48) { // 0 - Reset pan/zoom
          event.preventDefault();
          this.imageGallery.resetOrientationAndZoom(true);
        } else if (event.keyCode === 189) { // '-' - Zoom Out
          event.preventDefault();
          this.imageGallery.zoomOut();
        } else if (event.keyCode === 187) { // '=' - Zoom in
          event.preventDefault();
          const detection = this.photosIterator.getCurrentDetection();
          if (detection) {
            this.imageGallery.panAndZoomToDetection(detection, true);
          } else {
            this.imageGallery.zoomIn();
          }
        }
      }
    } else {
      if (event.keyCode === 65 && !this.panoramaViewerEnabled) { // A - Add
        event.preventDefault();
        this.toggleAddSelection();
      } else if (event.keyCode === 69 && !this.panoramaViewerEnabled) { // E - edit
        event.preventDefault();
        this.toggleEditSelection();
      } else if (event.keyCode === 89 && !this.panoramaViewerEnabled) { // Y - confirm
        event.preventDefault();
        this.confirmDetection();
      } else if (event.keyCode === 78 && !this.panoramaViewerEnabled) { // N - invalid
        event.preventDefault();
        this.invalidDetection();
      } else if (event.keyCode === 38 || event.keyCode === 39) {
        event.preventDefault();
        this.photosIterator.switchToNextPhoto();
      } else if (event.keyCode === 40 || event.keyCode === 37) {
        event.preventDefault();
        this.photosIterator.switchToPrevPhoto();
      } else if (event.keyCode === 27 && !this.panoramaViewerEnabled) { // ESC - Cancel add
        if (!this.imageGallery.editSignDialogVisible()) {
          event.preventDefault();
          if (this.addSelectionInProgress) {
            this.disableAddSelection();
          }
        }
      }

    }
  }

  constructor(public sequenceService: SequenceVxService, public photoService: PhotoVxService,
    public apolloDetectionsService: ApolloDetectionVxService, ngZone: NgZone,
    public route: ActivatedRoute, public modal: Modal, public navbarService: NavbarService, public location: Location,
    public modalService: NgbModal, public auth: AuthProviderService, public statisticsService: ApolloStatisticsVxService
  ) {
    super(sequenceService, photoService, apolloDetectionsService, modal, modalService, auth);
    this.photosIterator = new PhotosIterator(null, null, false, () => {
      this.reloadFilters();
    });
    this.photosIterator.optimisationsEnabled = false;
    this.photosIterator.sequencePhotosMode = false;
    this.photosIterator.autoSelectDetection = false;
    this.photosIterator.filtersCounts.offlineCountEnabled = false;
    this.photosIterator.registerSwitchingCallback(() => {
      return new Promise((resolve, reject) => {
        if (this.rotationStarted) {
          const dialog = this.modal.open(ConfirmModalComponent, overlayConfigFactory({
            modalTitle: 'Cancel rotation',
            modalBody: 'Are you sure to cancel the changes?',
            cancelButtonText: 'Close',
            submitButtonText: 'Ok',
            submitButtonClass: 'btn-danger',
            size: 'sm'
          }, BSModalContext));
          dialog.result
            .then((r: any) => {
              if (r && r.submit) {
                this.resetRotation();
                resolve();
              } else {
                reject();
              }
            }, (error) => {
              reject();
              console.log('Dialog ended with failure: ', error);
            });
        } else {
          resolve();
        }
      })
    });


    if (!environment.apollo.signDetectionsEnabled) {
      this.errorFound = true;
      this.errorMessage = 'Detections disabled!';
      this.errorReload = false;
      return;
    }
    $(window).resize((e) => {
      ngZone.run(() => {
        this.checkMobileSwitch();
      });
    });
    this.checkMobileSwitch();
    this.detectionsEnabled = true;
    this.detectionsNewDetection = environment.apollo.signDetectionsNewDetection
    if (this.detectionsEnabled) {
      this._showLoading();
      apolloDetectionsService.getSignsList().subscribe(
        (signsList) => {
          this.signsList = signsList;
          this.initComponent()
        },
        () => {
          this.initComponent()
        });
    } else {
      this.initComponent()
    }
  }

  initComponent() {
    this.initComponentBaseComponent();
    this.photosIterator.currentPhoto.subscribe(photoData => {
      if (this.photosIterator.currentStats.photoIndex + 1 > this.photosIterator.currentStats.photosCount - 5 &&
        !this.morePagesLoading && this.hasMorePages) {
        this.morePagesLoading = true;
        this.currentPage++;
        this._internalLoadPhotos(false, false);
        console.log('loading more pages');
      }
      if (this.addSelectionInProgress) {
        this.disableAddSelection();
      }
      if (this.onEditSelection) {
        this.disableEditSelection();
      }
      this.currentPhotoCache = photoData;
      if (photoData) {
        this.location.replaceState('/sign-view/' + photoData.sequenceId + '/' + photoData.sequenceIndex);
        this.currentMarker = {
          lat: photoData.lat,
          lng: photoData.lng,
          enabled: true,
          rotation: photoData.heading,
          image: '/assets/images/map/direction.png',
          autoCenter: true
        };
      }
    });
    this.route
      .params
      .subscribe(params => {
        // this.currentSequenceId = parseInt(params['id'], 10);
        this._loadSignsData();
        // this._loadSequence(params['id'], (typeof params['imageId'] !== 'undefined' ? parseInt(params['imageId'], 10) : null));
      });
    this.disableAddSelection();
    this.disableEditSelection();

    this.photosIterator.filters.validationFiltersEnabled = true;
    this.photosIterator.filters.OSMComparisonFiltersEnabled = false
    this.photosIterator.refreshFilters();
  }

  protected reloadFilters() {
    this.currentPage = 1;
    this.hasMorePages = true;
    this.temporaryLoading = true;
    this._internalLoadPhotos(false, true, true);
  }

  reloadFiltersCounts() {
    this.statisticsService.retrieveOverallStatistics({
      signInternalNames: this.photosIterator.filters.signSelectionArray
    }).subscribe(response => {
      this.photosIterator.filtersCounts.setValidation(
        response.totalDetections,
        response.toBeCheckedDetections,
        response.confirmedDetections,
        response.removedDetection,
        response.notSureDetections,
        response.changedDetections,
        response.automaticDetections,
        response.manualDetections,
      );
    });
  }

  protected _internalLoadPhotos(firstPage = false, forceReload = false, forceErrors = false) {
    if (firstPage) {
      this.errorFound = false;
      this._showLoading();
      this.currentPage = 1;
      this.hasMorePages = true;
    }
    this.apolloDetectionsService.getAllByPhotos(this.currentPage, this.photosIterator.filters.allPhotoDetections,
      this.photosIterator.filters.signSelectionArray, this.photosIterator.filters.getValidationStatuses(),
      this.photosIterator.filters.getEditStatuses(), this.photosIterator.filters.getOSMComparison(),
      this.photosIterator.filters.getDetectionTypes()).subscribe(
        apolloPhotos => {
          const detections: IApolloDetection[] = []
          const photosRequest = [];
          apolloPhotos.forEach(apolloPhoto => {
            photosRequest.push([apolloPhoto.sequenceId, apolloPhoto.sequenceIndex])
            apolloPhoto.detections.forEach(apolloDetection => {
              detections.push(apolloDetection);
            });
          });
          if (photosRequest.length > 0) {
            this.photoService.getAllBySequenceIndexes(photosRequest).subscribe(
              photos => {
                const newPhotos = this.orderPhotos(photos, photosRequest);
                if (forceReload && this.imageGallery) {
                  this.imageGallery.resetPhotosCache();
                }
                if (firstPage || forceReload) {
                  this.photosIterator.updateApolloPhotos(newPhotos, detections);
                  this.reloadFiltersCounts();
                  this.photosIterator.switchToFirstPhoto();
                  this._hideLoading();
                } else {
                  this.photosIterator.appendApolloPhotos(newPhotos, detections);
                }
                this.temporaryLoading = false;
                this.morePagesLoading = false;
              },
              error => {
                if (firstPage || forceErrors) {
                  this._hideLoading();
                  this.errorFound = true;
                  this.errorMessage = error;
                }
                this.hasMorePages = false;
                this.temporaryLoading = false;
                this.morePagesLoading = false;
              }
            );
          } else {
            if (firstPage) {
              this._hideLoading();
              this.errorFound = true;
              this.errorMessage = 'No data found!';
            } else if (forceErrors) {
              this.photosIterator.updateApolloPhotos([], []);
              // this.errorFound = true;
              // this.errorMessage = 'No data found!';
              // this.modal.alert().showClose(false).title('Error').body('No data found!').open();
            }
            this.hasMorePages = false;
            this.temporaryLoading = false;
            this.morePagesLoading = false;
          }
        },
        error => {
          if (firstPage || forceErrors) {
            this._hideLoading();
            this.errorFound = true;
            this.errorMessage = 'No data found!';
          } else if (forceErrors) {
            this.photosIterator.updateApolloPhotos([], []);
          }
          this.hasMorePages = false;
          this.temporaryLoading = false;
          this.morePagesLoading = false;
        });
  }

  protected _loadSignsData() {
    this._internalLoadPhotos(true);
  }

  private orderPhotos(photos, photosRequest): IPhoto[] {
    const output = [];
    photosRequest.forEach(index => {
      photos.some(photo => {
        if (photo.sequenceId === index[0] && photo.sequenceIndex === index[1]) {
          output.push(photo);
          return true;
        }
      });
    });
    return output;
  }

  public onDetectionsScrollEnd() {
    if (!this.morePagesLoading && this.hasMorePages) {
      clearTimeout(this.loadMorePagesTimeout)
      this.loadMorePagesTimeout = setTimeout(() => {
        this.morePagesLoading = true;
        this.currentPage++;
        this._internalLoadPhotos(false, false);
        console.log('loading more pages');
      });
    }
  }

}
