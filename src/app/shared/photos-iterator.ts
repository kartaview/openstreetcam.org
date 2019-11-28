import { BehaviorSubject } from 'rxjs/Rx';

import { IPhoto } from './api-services/osc/models';
import { IApolloDetection, IApolloPhoto } from './api-services/apollo/models';

import { PhotosIteratorFiltersCount } from './photos-iterator-filters-count';
import { PhotosIteratorFilters } from './photos-iterator-filters';

declare let L: any;

export class PhotosIterator {
  protected _photos: IPhoto[] = [];
  protected filteredPhotosCache: IPhoto[] = [];
  protected filteredPhotos: BehaviorSubject<IPhoto[]> = new BehaviorSubject([]);

  protected _detections: IApolloDetection[] = [];
  public filteredDetectionsCache: IApolloDetection[] = [];
  public filteredDetections: BehaviorSubject<IApolloDetection[]> = new BehaviorSubject([]);
  public filteredDetectionsStreamCache: IApolloDetection[] = [];
  public filteredDetectionsStream: BehaviorSubject<IApolloDetection[]> = new BehaviorSubject([]);
  private _orphanDetections: IApolloDetection[] = [];

  protected currentPhotoCache: IPhoto = null;
  public currentPhoto: BehaviorSubject<IPhoto> = new BehaviorSubject(null);
  protected currentPhotoDetectionsCache: IApolloDetection[] = [];
  public currentPhotoDetections: BehaviorSubject<IApolloDetection[]> = new BehaviorSubject([]);
  protected currentDetectionCache: IApolloDetection = null;
  public currentDetection: BehaviorSubject<IApolloDetection> = new BehaviorSubject(null);

  public panoramaViewerEnabled: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public trackData = [];

  private maxStreamDetections = 50;

  public currentStats = {
    /* Common properties */
    photoId: -1,
    detectionId: null,
    childDetectionId: null,
    sequenceId: -1,
    sequenceIndex: -1,


    /* Filtered properties */
    photoIndex: -1,
    progress: 0,
    photosCount: 0,
    detectionIndex: -1,
    detectionsCount: 0,
    childDetectionIndex: -1,


    /* All storage properties */
    allPhotosIndex: -1,
    allPhotosProgress: 0,
    allPhotosCount: 0,
    allDetectionsIndex: -1,
    allDetectionsCount: 0,

    streamDetectionsIndexStart: 0,
    streamDetectionsGenerated: false
  };

  private _switchingEnabled = true;
  private _switchingCallback: Function = null;
  private _hasSwitchingCallback = null;
  private _switchingCallbackRequestHandled = false;

  private hasMap = true;

  public sequencePhotosMode = true;
  public autoSelectDetection = true;
  public optimisationsEnabled = true;
  public showAllPhotoDetections = false;

  hasCustomFiltersCallback = false;
  customFiltersCallback = null;
  public filtersCounts = new PhotosIteratorFiltersCount();
  public filters = new PhotosIteratorFilters(() => { // regenerate detections
    console.log('regenerate filters');
    if (this.hasCustomFiltersCallback) {
      this.customFiltersCallback();
    } else {
      this.filterDetections();
      this.fixDetectionIndex();
    }
  });

  constructor(photos: IPhoto[] = null, detections: IApolloDetection[] = null, hasMap = true, customFiltersCallback = null) {
    if (photos) {
      this._updatePhotos(photos);
    }
    if (detections) {
      this._updateDetections(detections);
    }
    this.hasMap = hasMap;
    if (customFiltersCallback) {
      this.hasCustomFiltersCallback = true;
      this.customFiltersCallback = customFiltersCallback;
    }
  }

  public refreshFilters() {
    console.log('start refresh filters');
    this.rebuildPhotoDetections();
    this.generateFiltersCount();
    this.filterDetections();
    console.log('end refresh filters');
  }

  private rebuildTrackMap() {
    this.trackData = [];
    this._photos.forEach(photo => {
      this.trackData.push(new L.LatLng(photo.lat, photo.lng));
    });
  }

  public switchingEnabled() {
    return this._switchingEnabled;
  }

  public enableSwitching() {
    this._switchingEnabled = true;
  }

  public disableSwitching() {
    this._switchingEnabled = false;
  }

  public registerSwitchingCallback(callback: Function) {
    this._switchingCallback = callback;
    this._hasSwitchingCallback = true;
  }

  private handleSwitching() {
    return new Promise((resolve, reject) => {
      if (this._hasSwitchingCallback && !this._switchingCallbackRequestHandled) {
        this._switchingCallbackRequestHandled = true;
        this._switchingCallback().then(
          () => {
            this._switchingCallbackRequestHandled = false;
            resolve();
          },
          error => {
            this._switchingCallbackRequestHandled = false;
            reject();
          });
      } else {
        reject();
      }
    });
  }

  /* GENERAL PHOTOS STUFFS */
  public updateApolloPhotos(photos: IPhoto[], detections: IApolloDetection[]) {
    if (this.switchingEnabled()) {
      this._updatePhotos(photos);
      this._updateDetections(detections);
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._updatePhotos(photos);
            this._updateDetections(detections);
          },
          error => {
          });
      }
    }
  }

  public appendApolloPhotos(photos: IPhoto[], detections: IApolloDetection[]) {
    if (this.switchingEnabled()) {
      this._appendPhotos(photos);
      this._appendDetections(detections);
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._appendPhotos(photos);
            this._appendDetections(detections);
          },
          error => {
          });
      }
    }
  }


  public updatePhotos(photos: IPhoto[]) {
    if (this.switchingEnabled()) {
      this._updatePhotos(photos);
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._updatePhotos(photos);
          },
          error => {
          });
      }
    }
  }

  protected _updatePhotos(photos: IPhoto[]) {
    this._photos = photos;
    this.currentStats.photoId = null;
    this.currentStats.photoIndex = null;
    this.currentStats.allPhotosIndex = null;
    this.currentStats.sequenceId = null;
    this.currentStats.sequenceIndex = null;
    this.currentStats.allPhotosCount = photos.length;
    this.generatePhotosFilters();
    if (this.hasMap) {
      this.rebuildTrackMap();
    }
    if (photos.length === 0) {
      this.currentPhoto.next(null);
    }
  }

  public appendPhotos(photos: IPhoto[]) {
    if (this.switchingEnabled()) {
      this._appendPhotos(photos);
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._appendPhotos(photos);
          },
          error => {
          });
      }
    }
  }

  protected _appendPhotos(photos: IPhoto[]) {
    if (photos.length > 0) {
      this._photos = this._photos.concat(photos);
      this.currentStats.allPhotosCount = photos.length;
      this.generatePhotosFilters();
      this.currentStats.progress = (this.currentStats.photoIndex) / ((this.currentStats.photosCount - 1) / 100);
      if (this.hasMap) {
        this.rebuildTrackMap();
      }
    }
  }

  private generatePhotosFilters() {
    this.filteredPhotosCache = this._photos;
    this.filteredPhotos.next(this._photos);
    this.currentStats.photosCount = this.filteredPhotosCache.length;
  }

  protected switchToPhotoIndex(index, detectionId = null, detection = null, forceDetectionChange = false, childDetection = null) {
    const lastIndex = this.currentStats.photoIndex;
    const lastDetectionId = (this.currentStats.childDetectionId ? this.currentStats.childDetectionId : this.currentStats.detectionId);
    this.currentPhotoCache = this.filteredPhotosCache[index];
    this.currentStats.photoIndex = index;
    this.currentStats.photoId = this.currentPhotoCache.id;
    this.currentStats.sequenceId = this.currentPhotoCache.sequenceId;
    this.currentStats.sequenceIndex = this.currentPhotoCache.sequenceIndex;
    if (this.filteredPhotosCache.length === 1) {
      this.currentStats.progress = 100;
    } else {
      this.currentStats.progress = (index) / ((this.filteredPhotosCache.length - 1) / 100);
    }
    const photoChanged = lastIndex !== this.currentStats.photoIndex;
    if (photoChanged) {
      this._clearCurrentDetection();
      this.currentPhoto.next(this.currentPhotoCache);
      this.rebuildPhotoDetections();
    }
    this.changeCurrentDetection(detectionId, photoChanged, lastIndex, lastDetectionId, detection, forceDetectionChange,
      childDetection);
    this.updateFilteredDetectionsStream();
  }

  public switchToFirstPhoto() {
    if (this.switchingEnabled()) {
      this._switchToFirstPhoto();
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._switchToFirstPhoto();
          },
          error => {
          });
      }
    }
  }

  protected _switchToFirstPhoto() {
    if (this.filteredPhotosCache.length > 0) {
      this.switchToPhotoIndex(0);
    }
  }

  private switchToLastPhoto() {
    if (this.filteredPhotosCache.length > 0) {
      this.switchToPhotoIndex(this.filteredPhotosCache.length - 1);
    }
  }

  public switchToPrevPhoto() {
    if (this.switchingEnabled()) {
      this._switchToPrevPhoto();
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._switchToPrevPhoto();
          },
          error => {
          });
      }
    }
  }

  protected _switchToPrevPhoto() {
    let currentIndex = this.currentStats.photoIndex;
    currentIndex--;
    if (currentIndex < 0) {
      currentIndex = this.filteredPhotosCache.length - 1;
    }
    this.switchToPhotoIndex(currentIndex);
  }

  public switchToNextPhoto() {
    if (this.switchingEnabled()) {
      this._switchToNextPhoto();
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._switchToNextPhoto();
          },
          error => {
          });
      }
    }
  }

  protected _switchToNextPhoto() {
    let currentIndex = this.currentStats.photoIndex;
    currentIndex++;
    if (currentIndex >= this.filteredPhotosCache.length) {
      currentIndex = 0;
    }
    this.switchToPhotoIndex(currentIndex);
  }

  public switchToPhotoSequenceIndex(sequenceId: number, sequenceIndex: number, detectionId = null, detection = null,
    childDetection = null) {
    if (this.switchingEnabled()) {
      this._switchToPhotoSequenceIndex(sequenceId, sequenceIndex, detectionId, detection, false, childDetection);
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._switchToPhotoSequenceIndex(sequenceId, sequenceIndex, detectionId, detection, false, childDetection);
          },
          error => {
          });
      }
    }
  }

  protected _switchToPhotoSequenceIndex(sequenceId: number, sequenceIndex: number, detectionId = null, detection = null,
    forceDetectionChange = false, childDetection = null) {
    let index = -1;
    let foundPhoto = null;
    this.filteredPhotosCache.some(photo => {
      index++;
      if (photo.sequenceId === sequenceId && photo.sequenceIndex === sequenceIndex) {
        foundPhoto = photo;
        this.switchToPhotoIndex(index, detectionId, detection, forceDetectionChange, childDetection);
        return true;
      }
    });
  }

  /* switchToPhotoId(photoId: number) { // not used yet
    let index = -1;
    let foundPhoto = null;
    this.filteredPhotosCache.some(photo => {
      index++;
      if (photo.id === photoId) {
        foundPhoto = photo;
        this.switchToPhotoIndex(index);
        return true;
      }
    });
  }*/

  public switchToPhotoPercent(percent) {
    if (this.switchingEnabled()) {
      this._switchToPhotoPercent(percent);
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._switchToPhotoPercent(percent);
          },
          error => {
          });
      }
    }
  }

  protected _switchToPhotoPercent(percent: number) {
    percent = (percent < 0 ? 0 : (percent > 100 ? 100 : percent));
    this.switchToPhotoIndex(Math.round((this.filteredPhotosCache.length - 1) * (percent / 100)))
  }

  private findPhotoBySequenceIndex(sequenceId, sequenceIndex) {
    let index = -1;
    let foundPhoto = null;
    this.filteredPhotosCache.some(photo => {
      index++;
      if (photo.sequenceId === sequenceId && photo.sequenceIndex === sequenceIndex) {
        foundPhoto = photo;
        return true;
      }
    });
    return foundPhoto;
  }

  public findPhotos(photoId: number, count: number): IPhoto[] {
    const result = [];
    let photoIndex = null;
    let index = -1;
    this.filteredPhotosCache.some(photo => {
      index++;
      if (photo.id === photoId) {
        photoIndex = index;
        return true;
      }
    });
    let currentCount = 0;
    if (photoIndex !== null) {
      for (let i = index; i < this.filteredPhotosCache.length; i++) {
        result.push(this.filteredPhotosCache[i]);
        currentCount++;
        if (currentCount >= count) {
          break;
        }
      }
    }
    return result;
  }

  public getCurrentPhoto(): IPhoto {
    return this.currentPhotoCache;
  }

  public removePhotoById(photoId: number) {
    if (this.switchingEnabled()) {
      this._removePhotoById(photoId);
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._removePhotoById(photoId);
          },
          error => {
          });
      }
    }
  }

  protected _removePhotoById(photoId: number) {
    let index = -1;
    let foundPhoto = null;
    this.filteredPhotosCache.some(photo => {
      index++;
      if (photo.id === photoId) {
        this.removeDetectionsByPhoto(photo.sequenceId, photo.sequenceIndex);
        this.filteredPhotosCache.splice(index, 1);
        this.trackData.splice(index, 1);
        const tempTrackData = this.trackData;
        this.trackData = [];
        setTimeout(() => {
          this.trackData = tempTrackData;
        }, 1);
        this.currentStats.allPhotosCount = this._photos.length;
        this.currentStats.allDetectionsCount = this._detections.length;
        this.generatePhotosFilters();
        this.filterDetections();
        foundPhoto = photo;
        this.currentStats.photoIndex = -1;
        this.switchToPhotoIndex(this.currentStats.photosCount <= index ? this.currentStats.photosCount - 1 : index);
        return true;
      }
    });
  }


  private rebuildPhotoDetections() {
    const noPhotoDetections = this.currentPhotoDetectionsCache.length === 0;
    this.currentPhotoDetectionsCache = [];
    if (this.currentPhotoCache) {
      (this.showAllPhotoDetections ? this._detections : this.filteredDetectionsCache).forEach(detection => {
        if (detection.sequenceId === this.currentPhotoCache.sequenceId
          && detection.sequenceIndex === this.currentPhotoCache.sequenceIndex
        ) {
          this.currentPhotoDetectionsCache.push(detection);
        }
      });
    }
    if (!(noPhotoDetections && this.currentPhotoDetectionsCache.length === 0)) {
      this.currentPhotoDetections.next(this.currentPhotoDetectionsCache);
    }
  }

  /* END OF GENERAL PHOTOS STUFFS */

  /* GENERAL DETECTIONS STUFFS */

  private generateFiltersCount() {
    if (!this.filtersCounts.offlineCountEnabled) {
      return;
    }
    this.filtersCounts.reset();
    this._detections.forEach(detection => {
      if (detection.validationStatus === 'CONFIRMED') {
        this.filtersCounts.incrementValidationConfirmed();
      } else if (detection.validationStatus === 'REMOVED') {
        this.filtersCounts.incrementValidationRemoved();
      } else if (detection.validationStatus === 'TO_BE_REVIEWED_LATER') {
        this.filtersCounts.incrementValidationNotSure();
      } else if (detection.validationStatus === 'CHANGED') {
        this.filtersCounts.incrementValidationChanged();
      } else if (
        detection.validationStatus === 'TO_BE_CHECKED') { // || detection.mode === 'MANUAL'
        this.filtersCounts.incrementValidationToBeChecked();
      }


      if ((detection.osmComparison === 'NEW' || detection.osmComparison === 'CHANGED') && detection.editStatus === 'OPEN') {
        this.filtersCounts.incrementOSMNeedReview();
      }
      if (detection.osmComparison === 'SAME') {
        this.filtersCounts.incrementOSMSameData();
      }
      if (detection.editStatus === 'FIXED') {
        this.filtersCounts.incrementOSMFixed();
      }
      if (detection.editStatus === 'ALREADY_FIXED') {
        this.filtersCounts.incrementOSMAlreadyFixed();
      }
      if (detection.editStatus === 'BAD_SIGN' || detection.editStatus === 'OTHER') {
        this.filtersCounts.incrementOSMNotFixed();
      }
      if (detection.osmComparison === 'UNKNOWN') {
        this.filtersCounts.incrementOSMUnknown();
      }
      if (detection.mode === 'AUTOMATIC') {
        this.filtersCounts.incrementDetectionTypeAutomatic();
      }
      if (detection.mode === 'MANUAL') {
        this.filtersCounts.incrementDetectionTypeManual();
      }
    });
  }

  public updateDetections(detections) {
    if (this.switchingEnabled()) {
      this._updateDetections(detections);
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._updateDetections(detections);
          },
          error => {
          });
      }
    }
  }

  protected _updateDetections(detections) {
    this._detections = [];
    this._appendDetections(detections);
  }

  public appendDetections(detections) {
    if (this.switchingEnabled()) {
      this._appendDetections(detections);
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._appendDetections(detections);
          },
          error => {
          });
      }
    }
  }

  protected _appendDetections(detections) {
    console.log('append start');
    const newDetections = [];
    const newChildDetections = [];
    if (this._photos.length > 0) {
      for (let i = detections.length - 1; i >= 0; i--) {
        if (detections[i].parentId) {
          newChildDetections.push(detections[i]);
        } else if (!this.findPhotoBySequenceIndex(detections[i].sequenceId, detections[i].sequenceIndex)) {
          // detections.splice(i, 1);
        } else {
          newDetections.push(detections[i]);
        }
      }
    }
    console.log('start concat');
    this._detections = this._detections.concat(newDetections.reverse());
    console.log('end concat');
    if (newChildDetections.length > 0 || this._orphanDetections.length > 0) {
      for (let i = this._detections.length - 1; i >= 0; i--) {
        const detection = this._detections[i];
        for (let j = newChildDetections.length - 1; j >= 0; j--) {
          if (newChildDetections[j].parentId === detection.id) {
            if (!detection.components) {
              detection.components = [];
            }
            detection.components.push(newChildDetections[j]);
            newChildDetections[j].parentDetection = detection;
            newChildDetections.splice(j, 1);
          }
        }
        for (let j = this._orphanDetections.length - 1; j >= 0; j--) {
          if (this._orphanDetections[j].parentId === detection.id) {
            if (!detection.components) {
              detection.components = [];
            }
            detection.components.push(this._orphanDetections[j]);
            this._orphanDetections[j].parentDetection = detection;
            this._orphanDetections.splice(j, 1);
          }
        }
        if (newChildDetections.length === 0 && this._orphanDetections.length === 0) {
          break;
        }
      }
      if (newChildDetections.length > 0) {
        this._orphanDetections = this._orphanDetections.concat(newChildDetections);
      }
    }
    console.log('childs end');
    this.currentStats.allDetectionsCount = this._detections.length;
    console.log('start filters count');
    this.rebuildPhotoDetections();
    this.generateFiltersCount();
    console.log('start filters');
    this.filterDetections();
    console.log('end filters');
  }

  protected filterDetections() {
    if (this.sequencePhotosMode) {
      const newDetections = [];
      this._detections.forEach(detection => {
        if (this.filters.detectionFiltered(detection)) {
          newDetections.push(detection);
        }
      });
      this.filteredDetectionsCache = newDetections;
      this.currentStats.detectionsCount = this.filteredDetectionsCache.length;
      this.filteredDetections.next(this.filteredDetectionsCache);
      this.updateFilteredDetectionsStream();
      if (!this.showAllPhotoDetections) {
        this.rebuildPhotoDetections();
      }
    } else {
      this.filteredDetectionsCache = this._detections;
      this.currentStats.detectionsCount = this.filteredDetectionsCache.length;
      this.filteredDetections.next(this.filteredDetectionsCache);
      this.updateFilteredDetectionsStream();
      if (!this.showAllPhotoDetections) {
        this.rebuildPhotoDetections();
      }
    }
  }

  protected updateFilteredDetectionsStream() {
    if (!this.optimisationsEnabled) {
      this.filteredDetectionsStreamCache = this.filteredDetectionsCache;
      this.filteredDetectionsStream.next(this.filteredDetectionsCache);
      this.currentStats.streamDetectionsIndexStart = 0;
      return;
    }
    this.currentStats.streamDetectionsGenerated = true;
    let currentIndex = this.currentStats.detectionIndex;
    if (this.currentStats.detectionIndex === null) {
      currentIndex = this.findDetectionByPhotoIdForward();
      if (currentIndex === -1) {
        currentIndex = this.findDetectionByPhotoIdBackward();
        if (currentIndex === -1) {
          currentIndex = null;
        }
      }
    }
    this.filteredDetectionsStreamCache = [];
    if (!currentIndex || currentIndex <= this.maxStreamDetections) {
      this.currentStats.streamDetectionsIndexStart = 0;
      this.filteredDetectionsStreamCache = this.filteredDetectionsCache.slice(this.currentStats.streamDetectionsIndexStart,
        this.currentStats.streamDetectionsIndexStart + (this.maxStreamDetections * 2));
    } else {
      this.currentStats.streamDetectionsIndexStart = currentIndex - this.maxStreamDetections;
      this.filteredDetectionsStreamCache = this.filteredDetectionsCache.slice(this.currentStats.streamDetectionsIndexStart,
        this.currentStats.streamDetectionsIndexStart + (this.maxStreamDetections * 2));
    }
    this.filteredDetectionsStream.next(this.filteredDetectionsStreamCache);
  }

  public clearCurrentDetection() { // TODO: handle situations when you need to confirm current detection discard
    this._clearCurrentDetection();
    this.currentDetection.next(null);
  }

  protected _clearCurrentDetection() {
    this.currentStats.detectionId = null;
    this.currentStats.detectionIndex = null;

    this.currentStats.childDetectionId = null;
    this.currentStats.childDetectionIndex = null;
  }

  protected fixDetectionIndex(autoSelectAnother = true) {
    if (this.currentStats.detectionId) {
      let foundIndex = this.findDetectionIndexById(this.currentStats.detectionId);
      if (foundIndex > -1) {
        this.switchToDetectionIndex(foundIndex);
        // this.currentStats.detectionIndex = foundIndex;
      } else {
        if (this.autoSelectDetection) {
          foundIndex = this.findDetectionIndexBySequenceId(this.currentStats.sequenceId, this.currentStats.sequenceIndex);
          if (foundIndex > -1) {
            this.switchToDetectionIndex(foundIndex);
          } else {
            if (!this.switchToFirstDetection()) {
              this._clearCurrentDetection();
              this.currentDetection.next(null);
            }
          }
        } else {
          this._clearCurrentDetection();
          this.currentDetection.next(null);
        }
      }
    } else {
      this._clearCurrentDetection();
      this.currentDetection.next(null);
    }
  }

  protected findDetectionIndexById(detectionId: number) {
    let index = -1;
    let inc = -1;
    this.filteredDetectionsCache.some(detection => {
      inc++;
      if (detection.id === detectionId) {
        index = inc;
        return true;
      }
    });
    return index;
  }

  protected findDetectionIndexBySequenceId(sequenceId, sequenceIndex) {
    let index = -1;
    let inc = -1;
    this.filteredDetectionsCache.some(detection => {
      inc++;
      if (detection.sequenceId === sequenceId && detection.sequenceIndex === sequenceIndex) {
        index = inc;
        return true;
      }
    });
    return index;
  }

  private changeCurrentDetection(detectionId, photoChanged = false, lastIndex, lastDetectionId, detection = null,
    forceDetectionChange = false, childDetection = null) {
    if (photoChanged) {
      this.rebuildPhotoDetections();
    }
    let detectionChanged = false;
    this.currentDetectionCache = null;
    this.currentStats.childDetectionId = null;
    this.currentStats.childDetectionIndex = null;

    if (this.autoSelectDetection || forceDetectionChange) {
      if (childDetection) {
        this.currentStats.detectionId = childDetection.parentDetection.id;
        this.currentStats.detectionIndex = this.filteredDetectionsCache.indexOf(childDetection.parentDetection);

        this.currentStats.childDetectionId = childDetection.id;
        this.currentStats.childDetectionIndex = childDetection.parentDetection.components.indexOf(childDetection);

        this.currentDetectionCache = childDetection;
        detectionChanged = true;
      } else if (detection) {
        this.currentStats.detectionId = detection.id;
        this.currentStats.detectionIndex = this.filteredDetectionsCache.indexOf(detection);
        this.currentDetectionCache = detection;
        detectionChanged = true;
      } else {
        if (detectionId !== null) {
          this.currentPhotoDetectionsCache.some(foundDetection => {
            if (foundDetection.id === detectionId) {
              this.currentStats.detectionId = foundDetection.id;
              this.currentStats.detectionIndex = this.filteredDetectionsCache.indexOf(foundDetection);
              this.currentDetectionCache = foundDetection;
              detectionChanged = true;
              return true;
            }
          });
        } else {
          if (this.currentPhotoDetectionsCache.length > 0) {
            if (lastIndex > this.currentStats.photoIndex) {
              const foundDetection = this.currentPhotoDetectionsCache[this.currentPhotoDetectionsCache.length - 1];
              this.currentStats.detectionId = foundDetection.id;
              this.currentStats.detectionIndex = this.filteredDetectionsCache.indexOf(foundDetection);
              this.currentDetectionCache = foundDetection;
              detectionChanged = true;
            } else {
              const foundDetection = this.currentPhotoDetectionsCache[0];
              this.currentStats.detectionId = foundDetection.id;
              this.currentStats.detectionIndex = this.filteredDetectionsCache.indexOf(foundDetection);
              this.currentDetectionCache = foundDetection;
              detectionChanged = true;
            }
          }
        }
      }
      if ((detectionChanged || (!detectionChanged && lastDetectionId !== null) || photoChanged) &&
        (childDetection ? lastDetectionId !== this.currentStats.childDetectionId :
          lastDetectionId !== this.currentStats.detectionId)) {
        this.currentDetection.next(this.currentDetectionCache);
        if (!this.currentStats.streamDetectionsGenerated) {
          this.updateFilteredDetectionsStream();
        }
      }
    } else {
      if (lastDetectionId) {
        this.currentDetection.next(null);
      }
    }
  }

  private removeDetectionsByPhoto(sequenceId, sequenceIndex) {
    let removedCount = 0;
    for (let i = this._detections.length - 1; i >= 0; i--) {
      const detection = this._detections[i];
      if (detection.sequenceId === sequenceId && detection.sequenceIndex === sequenceIndex) {
        this._detections.splice(i, 1);
        removedCount++;
      }
    }
    return removedCount;
  }

  public switchToDetectionByXY(x, y) {
    if (this.switchingEnabled()) {
      this._switchToDetectionByXY(x, y);
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._switchToDetectionByXY(x, y);
          },
          error => {
          });
      }
    }

  }

  protected _switchToDetectionByXY(x, y) {
    this.currentPhotoDetectionsCache.some(detection => {
      if (detection.components && detection.components instanceof Array) {
        if (detection.components.some(childDetection => {
          if (childDetection.locationOnPhoto.x <= x && childDetection.locationOnPhoto.y <= y
            && childDetection.locationOnPhoto.x + childDetection.locationOnPhoto.width >= x
            && childDetection.locationOnPhoto.y + childDetection.locationOnPhoto.height >= y) {
            this._switchToPhotoSequenceIndex(detection.sequenceId, detection.sequenceIndex, detection.id, detection,
              true, childDetection);
            return true;
          }
        })) {
          return true;
        }
      }
      if (detection.locationOnPhoto.x <= x && detection.locationOnPhoto.y <= y
        && detection.locationOnPhoto.x + detection.locationOnPhoto.width >= x
        && detection.locationOnPhoto.y + detection.locationOnPhoto.height >= y) {
        this._switchToPhotoSequenceIndex(detection.sequenceId, detection.sequenceIndex, detection.id, detection, true);
        return true;
      }
    });
  }

  protected switchToFirstDetection() {
    if (this.filteredDetectionsCache.length > 0) {
      this.switchToDetectionIndex(0);
      return true;
    }
    return false;
  }

  public switchToNextDetection() {
    if (this.switchingEnabled()) {
      this._switchToNextDetection();
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._switchToNextDetection();
          },
          error => {
          });
      }
    }
  }

  protected _switchToNextDetection() {
    if (this.currentStats.detectionIndex === null) {
      const newIndex = this.findDetectionByPhotoIdForward();
      if (newIndex > -1) {
        this.switchToDetectionIndex(newIndex);
      }
    } else {
      let nextDetectionIndex = this.currentStats.detectionIndex + 1;
      if (nextDetectionIndex > this.filteredDetectionsCache.length - 1) {
        nextDetectionIndex = 0;
      }
      this.switchToDetectionIndex(nextDetectionIndex);
    }
  }

  public switchToPrevDetection() {
    if (this.switchingEnabled()) {
      this._switchToPrevDetection();
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._switchToPrevDetection();
          },
          error => {
          });
      }
    }
  }

  protected _switchToPrevDetection() {
    if (this.currentStats.detectionIndex === null) {
      const newIndex = this.findDetectionByPhotoIdBackward();
      if (newIndex > -1) {
        this.switchToDetectionIndex(newIndex);
      }
    } else {
      let nextDetectionIndex = this.currentStats.detectionIndex - 1;
      if (nextDetectionIndex < 0) {
        nextDetectionIndex = this.filteredDetectionsCache.length - 1;
      }
      this.switchToDetectionIndex(nextDetectionIndex);
    }
  }

  private findDetectionByPhotoIdBackward() {
    let result = -1;
    if (this.sequencePhotosMode) {
      for (let inc = this.filteredDetectionsCache.length - 1; inc >= 0; inc--) {
        const detection = this.filteredDetectionsCache[inc];
        if (detection.sequenceIndex <= this.currentStats.sequenceIndex) {
          result = inc;
          // this.switchToDetectionIndex(inc)
          return inc;
        }
      }
    } else {
      // let found = false;
      if (this.currentStats.detectionIndex === null) {
        if (this.currentStats.photoIndex > 0) {
          const prevPhoto = this.filteredPhotosCache[this.currentStats.photoIndex - 1];
          let lastGoodDetection = null;
          let lastGoodDetectionIndex = null;
          let inc = -1;
          this.filteredDetectionsCache.some(detection => {
            inc++;
            if (detection.sequenceId === prevPhoto.sequenceId && detection.sequenceIndex === prevPhoto.sequenceIndex) {
              lastGoodDetection = detection;
              lastGoodDetectionIndex = inc;
            } else if (lastGoodDetection) {
              result = lastGoodDetectionIndex;
              // this.switchToDetectionIndex(lastGoodDetectionIndex);
              // found = true;
              return true;
            }
          });
        }
      } else if (this.currentStats.detectionIndex > 0) {
        result = this.currentStats.detectionIndex - 1;
        // this.switchToDetectionIndex(this.currentStats.detectionIndex - 1);
        // found = true;
      }
    }
    return result;
  }

  private findDetectionByPhotoIdForward(): number {
    let result = -1;
    if (this.sequencePhotosMode) {
      for (let inc = 0; inc <= this.filteredDetectionsCache.length - 1; inc++) {
        const detection = this.filteredDetectionsCache[inc];
        if (detection.sequenceIndex >= this.currentStats.sequenceIndex) {
          // result = inc;
          // this.switchToDetectionIndex(inc)
          return inc;
        }
      }
    } else {
      // let found = false;
      if (this.currentStats.detectionIndex === null) {
        let inc = -1;
        this.filteredDetectionsCache.some(detection => {
          inc++;
          if (detection.sequenceId === this.currentStats.sequenceId && detection.sequenceIndex === this.currentStats.sequenceIndex) {
            result = inc;
            // this.switchToDetectionIndex(inc);
            // found = true;
            return true;
          }
        });
      } else if (this.currentStats.detectionIndex < this.currentStats.detectionsCount - 1) {
        result = this.currentStats.detectionIndex + 1;
        // this.switchToDetectionIndex(this.currentStats.detectionIndex + 1);
        // found = true;
      }
    }
    return result;
  }

  public isDetectionSelected() {
    return this.currentStats.detectionId !== null;
  }

  public getCurrentDetection(): IApolloDetection {
    return this.currentDetectionCache;
  }

  private switchToDetectionIndex(detectionIndex: number) {
    if (this.filteredDetectionsCache[detectionIndex]) {
      const detection = this.filteredDetectionsCache[detectionIndex];
      this._switchToPhotoSequenceIndex(detection.sequenceId, detection.sequenceIndex, detection.id, detection, true);
    }
  }

  public switchToDetectionId(detectionId: number, forceDetectionChange = false, childDetection = null) {
    if (this.switchingEnabled()) {
      this._switchToDetectionId(detectionId, forceDetectionChange, childDetection);
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._switchToDetectionId(detectionId, forceDetectionChange, childDetection);
          },
          error => {
          });
      }
    }
  }

  protected _switchToDetectionId(detectionId: number, forceDetectionChange = false, childDetection = null) {
    this.filteredDetectionsCache.some(detection => {
      if (detection.id === detectionId) {
        this._switchToPhotoSequenceIndex(detection.sequenceId, detection.sequenceIndex, detection.id, detection, forceDetectionChange,
          childDetection);
        return true;
      }
    });
  }

  public addDetection(detection: IApolloDetection) {
    let found = false;
    let prevIndex = -1;
    if (detection.parentId) {
      this._detections.some(parentDetection => {
        if (parentDetection.id === detection.parentId) {
          if (!parentDetection.components) {
            parentDetection.components = [];
          }
          detection.parentDetection = parentDetection;
          parentDetection.components.push(detection);
          // this.switchToDetectionId(parentDetection.id, true, detection);
          this.rebuildPhotoDetections();
          return true;
        }
      })
    } else if (this.sequencePhotosMode) {
      if (this.currentStats.detectionIndex !== null) {
        this._detections.splice(this.currentStats.detectionIndex, 0, detection);
        prevIndex = this.currentStats.detectionIndex;
        found = true;
      } else {
        for (let i = this._detections.length - 1; i >= 0; i--) {
          if (this._detections[i].sequenceIndex <= detection.sequenceIndex) {
            prevIndex = i + 1;
            break;
          }
        }
        if (prevIndex === -1) {
          this._detections.splice(0, 0, detection);
          prevIndex = 0;
          found = true;
        } else {
          this._detections.splice(prevIndex, 0, detection);
          found = true;
        }
      }
    } else {

      let inc = -1;
      this.filteredDetectionsCache.some(parsedDetection => {
        inc++;
        if (parsedDetection.sequenceId === this.currentStats.sequenceId &&
          parsedDetection.sequenceIndex === this.currentStats.sequenceIndex) {
          prevIndex = inc;
          found = true;
          return true;
        }
      });
      if (found) {
        this._detections.splice(prevIndex, 0, detection);
      } else {
        prevIndex = this.findPrevPhotoWithDetectionsLastDetectionIndex(this.currentStats.sequenceId, this.currentStats.sequenceIndex);
        if (prevIndex) {
          this._detections.splice(prevIndex, 0, detection);
          found = true;
        } else {
          this._detections.splice(0, 0, detection);
          prevIndex = 0;
          found = true;
        }
      }
    }
    if (found && !detection.parentId) {
      this.currentStats.allDetectionsCount = this._detections.length;
      this.rebuildPhotoDetections();
      this.generateFiltersCount();
      this.filterDetections();
      this.switchToDetectionIndex(prevIndex);
    } else if (detection.parentId) {
      // switch to det
    }
  }

  public findPrevPhotoWithDetectionsLastDetectionIndex(sequenceId, sequenceIndex): number {
    let result = null;
    let found = false;
    let inc = -1;
    this._detections.some(detection => {
      inc++;
      if (detection.sequenceId === sequenceId && detection.sequenceIndex === sequenceIndex) {
        result = inc;
        found = true;
      } else if (found) {
        return true;
      }
    });
    return result;
  }

  public updateDetection(updatedDetection: IApolloDetection) {
    if (this.switchingEnabled()) {
      this._updateDetection(updatedDetection);
    } else {
      if (this._hasSwitchingCallback) {
        this.handleSwitching().then(
          () => {
            this._updateDetection(updatedDetection);
          },
          error => {
          });
      }
    }
  }

  protected _updateDetection(updatedDetection: IApolloDetection) {
    let inc = -1;
    this._detections.some(detection => {
      inc++;
      if (updatedDetection.parentId) {
        if (detection.id === updatedDetection.parentId) {
          if (detection.components) {
            let childInc = -1;
            detection.components.some(childDetection => {
              childInc++;
              if (childDetection.id === updatedDetection.id) {
                const currentDetection = this.getCurrentDetection();
                const reloadCurrentDetection = currentDetection.id === updatedDetection.id;
                detection.components[childInc] = updatedDetection;
                updatedDetection.parentDetection = detection;
                if (reloadCurrentDetection) {
                  this.currentDetectionCache = updatedDetection;
                  this.currentDetection.next(this.currentDetectionCache);
                }
                return true;
              }
            });
          }
          return true;
        }
      } else if (detection.id === updatedDetection.id) {
        const currentDetection = this.getCurrentDetection();
        const reloadCurrentDetection = currentDetection.id === updatedDetection.id;
        if (this._detections[inc].components && this._detections[inc].components instanceof Array &&
          this._detections[inc].components.length > 0) {
          updatedDetection.components = this._detections[inc].components;
          updatedDetection.components.forEach(childDetection => {
            childDetection.parentDetection = updatedDetection;
          });
        }
        this._detections[inc] = updatedDetection;
        this.generateFiltersCount();
        this.refreshFilters();
        if (reloadCurrentDetection) {
          const currentIndex = this.findDetectionIndexById(updatedDetection.id);
          if (currentIndex >= -1) {
            this.currentDetectionCache = updatedDetection;
            this.currentDetection.next(this.currentDetectionCache);
          } else {
            this.fixDetectionIndex();
          }
        }
        return true;
      }
    });

  }
  /* END OF GENERAL DETECTIONS STUFFS */

}
