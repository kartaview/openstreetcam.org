import { Component, Input, Output, HostBinding, ViewChild, HostListener, NgZone, OnInit, EventEmitter } from '@angular/core';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import * as THREE from 'three/build/three.min.js';
import { PerfectScrollbarConfigInterface, PerfectScrollbarComponent, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';

import { AuthProviderService } from '../../shared/auth/authProvider.service';

import { IPhoto } from '../../shared/api-services/osc/models';
import { IApolloDetection, ApolloDetection, IApolloSign, ApolloSign } from '../../shared/api-services/apollo/models';
import { Rectangle, IRectangle } from '../../shared/api-services/common/models';
import { OSCFrameRender } from '../../shared/renderer/osc-framerenderer';
import { UIGLImageCache } from '../../shared/renderer/detection-base';
import { PhotosIterator } from '../../shared/photos-iterator';

import { PhotosCache } from './photos-cache';

import { RoadSignUrlPipe } from '../../shared/pipes';
import { ApolloDetectionSelection } from 'app/shared/renderer';

/**
 * This class represents the lazy loaded SequenceImageGalleryComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-sequence-image-gallery',
  templateUrl: 'image-gallery.component.html',
  styleUrls: ['image-gallery.component.css']
})
export class SequenceImageGalleryComponent implements OnInit {
  @HostBinding('class.add-sign-selection') addSignEnabled = false;

  public perfectScrollbarOptions: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
    wheelSpeed: 0.25
  };

  @ViewChild(PerfectScrollbarComponent) componentScroll: PerfectScrollbarComponent;
  @ViewChild(PerfectScrollbarDirective) directiveScroll: PerfectScrollbarDirective;

  private scrollToDetectionTimeout = null;

  dragStarted = false;
  dragStartedDiff = 0;
  dragStartedXY = [0, 0];
  addSignStarted = false;
  addSignFinished = false;
  editSignStarted = false;
  addSignX = 0;
  addSignY = 0;
  addSignX1 = 0;
  addSignY1 = 0;
  addSignX2 = 0;
  addSignY2 = 0;
  addSignWidth = 0;
  addSignHeight = 0;

  addSignRectangleRestriction: IRectangle = null;

  controlsVisible = true;
  noImageErrorMessage = 'No image found!';
  noImageError = false;


  @Input() selectDetectionByClick = false;

  @Input() sequenceData;

  @Input() signsList: any = {};
  @Input() showSignIcon = false;
  private signsListLoaded = false;

  @Output() imageGalleryEvent = new EventEmitter();
  @Output() updateMarkerRenderRotationDelta = new EventEmitter();
  @Input() rotationDirection = 0;

  @Input() panAndZoomToDetectionEnabled = false;

  currentPhotoValue: IPhoto;
  private _showFullSizeWrapped360 = false;
  @Input()
  set showFullSizeWrapped360(showFullSizeWrapped360: boolean) {
    this._showFullSizeWrapped360 = showFullSizeWrapped360;
    if (this.frameRenderer) {
      this.resetPhotosCache();
    }
  }
  get showFullSizeWrapped360(): boolean {
    return this._showFullSizeWrapped360;
  };

  private _showFullSizePhotos = false;
  @Input()
  set showFullSizePhotos(showFullSizePhotos: boolean) {
    this._showFullSizePhotos = showFullSizePhotos;
    if (this.frameRenderer) {
      this.resetPhotosCache();
    }
  }
  get showFullSizePhotos(): boolean {
    return this._showFullSizePhotos;
  };

  photosCache: PhotosCache = new PhotosCache();
  _signsCache: any = {};

  private _lastProjection = null;
  private _lastProjectionFieldOfView = null;
  public frameRenderer = null;
  public isPanorama = false;

  public loadingTimeout = null;
  public imagesLoading = 0;
  public imagesLoaded = 0;
  public imagesLoadedErrors = 0;

  public loadingPhoto = false;

  public currentDetection = null;

  public debugScreenCenter = false;

  @Input() photosIterator: PhotosIterator;
  currentPhotoDetectionsCache: IApolloDetection[] = [];


  /**
 * Creates an instance of the SequenceImageGalleryComponent
 */
  constructor(ngZone: NgZone, public modal: Modal, public auth: AuthProviderService) {
    this.addSignRectangleRestriction = new Rectangle();
    this.addSignRectangleRestriction.x = 0;
    this.addSignRectangleRestriction.y = 0;
    this.addSignRectangleRestriction.width = 1;
    this.addSignRectangleRestriction.height = 1;
    window.onresize = (e) => {
      ngZone.run(() => {
        if (this.frameRenderer) {
          this.frameRenderer.resize();
        }
      });
    };
  }

  public addUISelectionSprite(id: string, fileName: string, autoload: boolean = true) {
    if (typeof this._signsCache[id] === 'undefined') {
      let loader = null;
      this._signsCache[id] = new UIGLImageCache(id);
      const loadCallback = (() => {
        loader = new THREE.TextureLoader();
        loader.crossOrigin = '';
        loader.setCrossOrigin('');
        const isSVG = (fileName.split('.').pop().toLowerCase() === 'svg');
        if (isSVG) {
          const svgImage = new Image();
          svgImage.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (svgImage.width < 200 && svgImage.height < 200) {
              canvas.width = svgImage.width * 4;
              canvas.height = svgImage.height * 4;
            } else {
              canvas.width = svgImage.width;
              canvas.height = svgImage.height;
            }
            context.drawImage(svgImage, 0, 0, canvas.width, canvas.height);
            const glPhoto = loader.load(canvas.toDataURL('image/png'), () => {
              if (this._signsCache[id]) {
                this._signsCache[id].width = glPhoto.image.width;
                this._signsCache[id].height = glPhoto.image.height;
                this._signsCache[id].loaded = true;
                this._signsCache[id].loading = false;
                if (this._signsCache[id].observer) {
                  this._signsCache[id].observer.next(this._signsCache[id]);
                }
                this.frameRenderer.manualRender();
              }
            }, (xhr) => {

            }, (xhr) => {
              if (this._signsCache[id]) {
                this._signsCache[id].loading = false;
                this._signsCache[id].error = true;
                if (this._signsCache[id].observer) {
                  this._signsCache[id].observer.next(this._signsCache[id]);
                }
              }
            });
            glPhoto.minFilter = THREE.NearestFilter;
            this._signsCache[id].image = glPhoto;
          }
          svgImage.src = fileName;
        } else {
          const glPhoto = loader.load(fileName, () => {
            if (this._signsCache[id]) {
              this._signsCache[id].width = glPhoto.image.width;
              this._signsCache[id].height = glPhoto.image.height;
              this._signsCache[id].loaded = true;
              this._signsCache[id].loading = false;
              if (this._signsCache[id].observer) {
                this._signsCache[id].observer.next(this._signsCache[id]);
              }
              this.frameRenderer.manualRender();
            }
          }, (xhr) => {

          }, (xhr) => {
            if (this._signsCache[id]) {
              this._signsCache[id].loading = false;
              this._signsCache[id].error = true;
              if (this._signsCache[id].observer) {
                this._signsCache[id].observer.next(this._signsCache[id]);
              }
            }
            console.log(xhr);
          });
          glPhoto.minFilter = THREE.NearestFilter;
          this._signsCache[id].image = glPhoto;
        }
      });
      if (autoload) {
        this._signsCache[id].loading = true;
        loadCallback();
      } else {
        this._signsCache[id].loadCallback = loadCallback;
      }
    }
  }

  reloadSignsInMemory() {
    const signIconNamePipe = new RoadSignUrlPipe();
    this.signsListLoaded = true;
    if (this.signsList && this.signsList.regions) {
      this.signsList.regionsArray.forEach(region => {
        if (this.signsList.regions[region.name]) {
          this.signsList.regions[region.name].ALL.forEach(signCategory => {
            signCategory.signs.forEach(sign => {
              this.addUISelectionSprite('sign_' + sign.internalName, signIconNamePipe.transform(sign), false);
            });
          });
        }
      });
    }
    if (this.signsList && this.signsList.components) {
      Object.keys(this.signsList.components).forEach(key => {
        this.signsList.components[key].forEach(sign => {
          this.addUISelectionSprite('sign_' + sign.internalName, signIconNamePipe.transform(sign), false);
        });
      });
    }

  }

  ngOnInit() {
    this.buildWebGLRenderer();
    this.addUISelectionSprite('_CORE_SIGN_CONFIRMED', 'assets/signs/core/sign-confirmed.png', true);
    this.addUISelectionSprite('_CORE_SIGN_REMOVED', 'assets/signs/core/sign-removed.png', true);
    this.addUISelectionSprite('_CORE_SIGN_RESIZE_POINT', 'assets/signs/core/sign-resize-point.png', true);
    if (this.showSignIcon && !this.signsListLoaded) {
      this.reloadSignsInMemory();
    }
    this.photosIterator.currentPhoto.subscribe(photoData => {
      if (photoData) {
        this.noImageError = false;
        console.log('photo change');
        this.currentPhotoValue = photoData;
        this.changePhoto(photoData);
      } else {
        this.noImageError = true;
        this.hidePhoto();
      }
    });
    this.photosIterator.currentPhotoDetections.subscribe(photoDetections => {
      setTimeout(() => {
        this.currentPhotoDetectionsCache = photoDetections;
        this.processDetections();
      }, 1);
    });
    let lastDetectionSequenceId = null;
    let lastDetectionSequenceIndex = null;
    this.photosIterator.currentDetection.subscribe(detection => {
      this.processDetections();
      if (detection) {
        if (this.panAndZoomToDetectionEnabled) {
          this.panAndZoomToDetection(detection,
            (detection.sequenceId === lastDetectionSequenceId && detection.sequenceIndex === lastDetectionSequenceIndex)
          );
        }
        lastDetectionSequenceId = detection.sequenceId;
        lastDetectionSequenceIndex = detection.sequenceIndex;
      } else {

      }
    });
  }

  panAndZoomToDetection(detection, animate = false) {
    this.frameRenderer.panAndZoomToImageRectangle(
      detection.locationOnPhoto.x,
      detection.locationOnPhoto.y,
      detection.locationOnPhoto.width,
      detection.locationOnPhoto.height
      , animate);
  }

  buildWebGLRenderer() {
    if (this.frameRenderer === null) {
      this.frameRenderer = new OSCFrameRender('#streetGalleryRenderer',
        () => { // loading starting
          this.showLoading();
        },
        () => { // loading ending
          clearTimeout(this.loadingTimeout);
          this.processDetections();
          this.hideLoading();
        });
    }
    this.frameRenderer.panningChange.subscribe(panning => {
      if (panning && typeof panning.rotateX !== 'undefined') {
        this.updateMarkerRenderRotationDelta.emit(panning.rotateX);
      }
    });
    this.frameRenderer.resize();
  }

  switchToPlane() {
    this.isPanorama = false;
    this.photosIterator.panoramaViewerEnabled.next(false);
    this.buildWebGLRenderer();
    this.frameRenderer.switchToPlaneObject();
  }

  switchToCylinder() {
    this.photosIterator.panoramaViewerEnabled.next(true);
    this.isPanorama = true;
    this.buildWebGLRenderer();
    this.frameRenderer.switchToCylinderObject();
  }

  switchToPanorama(fieldOfView = null) {
    this.photosIterator.panoramaViewerEnabled.next(true);
    this.isPanorama = true;
    this.buildWebGLRenderer();
    this.frameRenderer.switchToSphereObject(fieldOfView);
  }

  preloadPhoto(photo, photoId, showErrors) {
    this.imagesLoading++;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = '';
    loader.setCrossOrigin('');
    const fileName = (this._showFullSizeWrapped360 && photo.wrappedUrl ? photo.wrappedUrl :
      (this._showFullSizePhotos ? photo.procUrl : photo.lthUrl)) + '?v=' + Date.now();
    const glPhoto = loader.load(fileName, () => {
      if (this.photosCache.getPhoto(photoId)) {
        const currentPhotoCache = this.photosCache.getPhoto(photoId);
        currentPhotoCache.width = glPhoto.image.width;
        currentPhotoCache.height = glPhoto.image.height;
        currentPhotoCache.loaded = true;
        currentPhotoCache.loading = false;
        this.imagesLoaded++;
        if (this.imagesLoading === this.imagesLoaded + this.imagesLoadedErrors) {
          this.imagesLoading = 0;
          this.imagesLoaded = 0;
          this.imagesLoadedErrors = 0;
        }
        if (currentPhotoCache.observer) {
          currentPhotoCache.observer.next(currentPhotoCache);
        }
      }
    }, (xhr) => {

    }, (xhr) => {
      this.imagesLoadedErrors++;
      if (this.photosCache.getPhoto(photoId)) {
        const currentPhotoCache = this.photosCache.getPhoto(photoId);
        currentPhotoCache.error = true;
        currentPhotoCache.loading = false;
        if (currentPhotoCache.observer) {
          currentPhotoCache.observer.next(currentPhotoCache);
        }
      }
      if (showErrors) {
        this.modal.alert().showClose(false).body(`Cannot load image from server. Might be CORS related.`).open();
      }
    });
    glPhoto.minFilter = THREE.NearestFilter;
    this.photosCache.addPhoto(photoId, glPhoto, photo.projection, photo.fieldOfView, photo.isUnwrapped);
  }

  preloadNextPhotos(photoId) {
    this.photosIterator.findPhotos(photoId, 5).forEach((photo) => {
      if (!this.photosCache.getPhoto(photo.id)) {
        this.preloadPhoto(photo, photo.id, false);
      }
    })
  }

  changePhoto(photoData) {
    if (this.frameRenderer) {
      this.frameRenderer.show();
    }
    let keepOrientation = false;
    switch (photoData.projection) {
      case 'PLANE':
        this.switchToPlane();
        break;
      case 'CYLINDER':
        this.switchToCylinder();
        break;
      case 'SPHERE':
        if (photoData.isUnwrapped && !this._showFullSizeWrapped360) {
          this.switchToPlane();
        } else {
          if (this._lastProjection === 'SPHERE' && this._lastProjection === photoData.projection &&
            this._lastProjectionFieldOfView === photoData.fieldOfView) {
            keepOrientation = true;
          }
          this.switchToPanorama(photoData.fieldOfView);
          // (photoData.fieldOfView === 180 ? 180 : photoData.fieldOfView)
          this._lastProjectionFieldOfView = photoData.fieldOfView;
        }
        break;
    }
    this._lastProjection = photoData.projection;
    if (!this.photosCache.getPhoto(photoData.id)) {
      this.preloadPhoto(photoData, photoData.id, true);
    }
    if (!keepOrientation) {
      this.frameRenderer.resetOrientation();
      this.frameRenderer.resetZoom();
    }
    this.frameRenderer.setTexture(this.photosCache.getPhoto(photoData.id), keepOrientation);
    this.preloadNextPhotos(photoData.id);
  }

  cancelRotation() {
    this.callImageGalleryEvent({
      type: 'cancel-photo-rotation'
    });
  }

  saveRotation() {
    this.callImageGalleryEvent({
      type: 'save-photo-rotation'
    });
  }

  hidePhoto() {
    if (this.frameRenderer) {
      this.frameRenderer.hide();
    }
  }

  rotateRight() {
    this.frameRenderer.rotateRight();
  }

  rotateLeft() {
    this.frameRenderer.rotateLeft();
  }

  resetRotation() {
    this.frameRenderer.resetRotation();
  }

  zoomIn() {
    this.frameRenderer.zoomIn();
  }

  zoomOut() {
    this.frameRenderer.zoomOut();
  }

  callImageGalleryEvent(event) {
    this.imageGalleryEvent.emit(event);
  }

  showLoading() {
    this.loadingTimeout = setTimeout(() => {
      this.loadingPhoto = true;
    }, 100);
  }

  hideLoading() {
    this.loadingPhoto = false;
  }

  resetOrientationAndZoom(animate = false) {
    this.frameRenderer.resetOrientation(animate);
    this.frameRenderer.resetZoom(animate);
  }

  resetPhotosCache() {
    if (this.frameRenderer) {
      this.photosCache.clear();
      this.changePhoto(this.currentPhotoValue)
      /* this.reloadCurrentPhoto(true);
      this.preloadNextPhotos(this.photosIterator.currentStats.photoId); */
    }
  }

  reloadCurrentPhoto(keepOrientation) {
    this.photosCache.removePhoto(this.photosIterator.currentStats.photoId);
    this.frameRenderer.setDefaultTexture();
    const photo = this.photosIterator.getCurrentPhoto();
    if (!photo || !photo.lthUrl) {
      return;
    }

    this.preloadPhoto(photo, this.photosIterator.currentStats.photoId, true);
    this.frameRenderer.setTexture(this.photosCache.getPhoto(this.photosIterator.currentStats.photoId), keepOrientation);
  }

  removeFromCache(photoId) {
    this.photosCache.removePhoto(photoId);
  }

  processDetection(detection: IApolloDetection) {
    const detectionSelected = (this.photosIterator.currentStats.childDetectionId ?
      this.photosIterator.currentStats.childDetectionId === detection.id :
      this.photosIterator.currentStats.detectionId === detection.id);
    const sprites = [];
    const buttons = [];
    if (this.showSignIcon) {
      if (this._signsCache['sign_' + detection.sign.internalName]) {
        sprites.push({
          image: this._signsCache['sign_' + detection.sign.internalName],
          position: [
            'right', 'top'
          ]
        });
      }
    }
    if (detectionSelected) {
      // if (detection.validationStatus !== 'CONFIRMED') {
      buttons.push({
        image: this._signsCache['_CORE_SIGN_CONFIRMED'],
        callback: (detectionSelection: ApolloDetectionSelection) => {
          detectionSelection.saveResize();
          this.updateSignDetectionRectangle(detection, detectionSelection.getPhotoLocation());
          // this.validateSignDetection(detection);
        }
      });
      // }
      // if (detection.validationStatus !== 'REMOVED') {
      buttons.push({
        image: this._signsCache['_CORE_SIGN_REMOVED'],
        callback: (detectionSelection: ApolloDetectionSelection) => {
          detectionSelection.cancelResize();
          // this.invalidateSignDetection(detection);
        }
      });
      // }
    }
    const automatic_suffix = (detection.mode === 'AUTOMATIC' ? '_automatic' : '');
    this.frameRenderer.addUISelection(
      detection.locationOnPhoto,
      detectionSelected ? 'selected' + automatic_suffix : 'default' + automatic_suffix,
      sprites,
      buttons,
      this.auth.isLoggedIn() && detectionSelected,
      this._signsCache['_CORE_SIGN_RESIZE_POINT']
    );
  }

  processDetections() {
    if (!this.frameRenderer) {
      return;
    }

    this.frameRenderer.clearUISelections();

    if (this.isPanorama) {
      return;
    }

    if (this.currentPhotoDetectionsCache) {
      this.currentPhotoDetectionsCache.forEach(detection => {
        this.processDetection(detection);
        if (detection.components) {
          detection.components.forEach(childDetection => {
            this.processDetection(childDetection);
          });
        }
      });
      this.frameRenderer.manualRender();
    }
  }

  findDetection(x, y) {
    let foundDetection = null;
    this.currentPhotoDetectionsCache.forEach(detection => {
      if (detection.locationOnPhoto.x <= x &&
        detection.locationOnPhoto.y <= y &&
        detection.locationOnPhoto.x + detection.locationOnPhoto.width >= x &&
        detection.locationOnPhoto.y + detection.locationOnPhoto.height >= y
      ) {
        foundDetection = detection;
        return true;
      }
    });
    return foundDetection;
  }

  public enableAddSelection(detection: IApolloDetection = null): boolean {
    this.disableSelectionOptions();
    if (detection) {
      this.restrictNewDetectionRegion(
        detection.locationOnPhoto.x, detection.locationOnPhoto.y,
        detection.locationOnPhoto.width, detection.locationOnPhoto.height
      );
    } else {
      this.restrictNewDetectionRegion(0, 0, 1, 1);
    }
    this.editSignStarted = false;
    this.addSignEnabled = true;
    this.frameRenderer.enablePan(false);
    this.frameRenderer.enableZoom(false);
    this.controlsVisible = false;
    console.log('enabled add');
    return true;
  }

  public disableAddSelection(): boolean {
    this.enableSelectionOptions();
    this.addSignEnabled = false;
    this.addSignStarted = false;
    this.addSignFinished = false;
    this.frameRenderer.enablePan(true);
    this.frameRenderer.enableZoom(true);
    this.controlsVisible = true;
    this.processDetections();
    console.log('disabled add');
    return true;
  }

  public enableEditSelection(detection: IApolloDetection): boolean {
    this.editSignStarted = true;
    this.addSignEnabled = false;
    this.addSignStarted = false;
    this.addSignFinished = false;
    this.frameRenderer.enablePan(false);
    this.frameRenderer.enableZoom(false);
    this.controlsVisible = false;
    this.currentDetection = JSON.parse(JSON.stringify(detection));
    const topLeft = this.frameRenderer.convert3DXYZTo2DXY(this.frameRenderer.XYImagePercentTo3DXYZ(
      this.currentDetection.locationOnPhoto.x,
      this.currentDetection.locationOnPhoto.y
    ));
    const bottomRight = this.frameRenderer.convert3DXYZTo2DXY(this.frameRenderer.XYImagePercentTo3DXYZ(
      this.currentDetection.locationOnPhoto.x + this.currentDetection.locationOnPhoto.width,
      this.currentDetection.locationOnPhoto.y + this.currentDetection.locationOnPhoto.height
    ));
    this.addSignX = topLeft.x - 2;
    this.addSignY = topLeft.y;
    this.addSignWidth = bottomRight.x - topLeft.x + 4;
    this.addSignHeight = bottomRight.y - topLeft.y;
    this.scrollToDetection();
    console.log('enabled edit');
    return true;
  }

  public disableEditSelection(): boolean {
    this.editSignStarted = false;
    this.addSignEnabled = false;
    this.addSignStarted = false;
    this.addSignFinished = false;
    this.frameRenderer.enablePan(true);
    this.frameRenderer.enableZoom(true);
    this.controlsVisible = true;
    this.processDetections();
    console.log('disabled edit');
    return true;
  }

  public updateSignDetectionRectangle(detection: IApolloDetection, rectangle: IRectangle) {
    this.callImageGalleryEvent({
      type: 'update-detection-rectangle', detection, rectangle, callback: () => {
        console.log('selection rectangle changed');
      }
    });
    return true;
  }

  public invalidateSignDetection(detection: ApolloDetection): boolean {
    this.callImageGalleryEvent({
      type: 'invalidate-detection', detection, callback: () => {
        console.log('selection invalidated');
      }
    });
    return true;
  }

  public validateSignDetection(detection: any): boolean {
    this.callImageGalleryEvent({
      type: 'validate-detection', detection, callback: () => {
        console.log('selection validated');
      }
    });
    return true;
  }

  private _addSignMouseDown(x, y) {
    this.processDetections();
    this.addSignFinished = false;
    this.addSignStarted = true;
    this.addSignX = this.addSignX2 = this.addSignX1 = x;
    this.addSignY = this.addSignY2 = this.addSignY1 = y;
    this.addSignWidth = 0;
    this.addSignHeight = 0;
  }

  private _addSignMouseMove(viewport, x, y) {
    this.addSignX2 = x;
    this.addSignY2 = y;
    if (this.addSignX2 < 0) {
      this.addSignX2 = 0
    } else if (this.addSignX2 > viewport.width()) {
      this.addSignX2 = viewport.width()
    }
    if (this.addSignY2 < 0) {
      this.addSignY2 = 0
    } else if (this.addSignY2 > viewport.height()) {
      this.addSignY2 = viewport.height()
    }

    this.addSignX = (this.addSignX1 > this.addSignX2 ? this.addSignX2 : this.addSignX1);
    this.addSignY = (this.addSignY1 > this.addSignY2 ? this.addSignY2 : this.addSignY1);
    this.addSignWidth = (this.addSignX1 > this.addSignX2 ? this.addSignX1 : this.addSignX2) - this.addSignX;
    this.addSignHeight = (this.addSignY1 > this.addSignY2 ? this.addSignY1 : this.addSignY2) - this.addSignY;
  }

  private _addSignMouseUp(viewport, x, y, isTouch = false) {
    if (!isTouch) {
      this.addSignX2 = x;
      this.addSignY2 = y;
    }
    if (this.addSignX2 < 0) {
      this.addSignX2 = 0
    } else if (this.addSignX2 > viewport.width()) {
      this.addSignX2 = viewport.width()
    }
    if (this.addSignY2 < 0) {
      this.addSignY2 = 0
    } else if (this.addSignY2 > viewport.height()) {
      this.addSignY2 = viewport.height()
    }
    this.addSignX = (this.addSignX1 > this.addSignX2 ? this.addSignX2 : this.addSignX1);
    this.addSignY = (this.addSignY1 > this.addSignY2 ? this.addSignY2 : this.addSignY1);
    this.addSignWidth = (this.addSignX1 > this.addSignX2 ? this.addSignX1 : this.addSignX2) - this.addSignX;
    this.addSignHeight = (this.addSignY1 > this.addSignY2 ? this.addSignY1 : this.addSignY2) - this.addSignY;
    this.addSignStarted = false;

    const x1y1 = this.frameRenderer.XYToImagePercents(
      this.frameRenderer.calculateMousePosition(this.addSignX, this.addSignY)
    );
    const x2y2 = this.frameRenderer.XYToImagePercents(
      this.frameRenderer.calculateMousePosition(this.addSignX + this.addSignWidth, this.addSignY + this.addSignHeight)
    );

    let detectionGenerated = false;

    if (x1y1 && x2y2) { // [top|left] and bottom right corners are found - inner selection
      this.createDetectionRectangle(x1y1.x, x1y1.y, x2y2.x - x1y1.x, x2y2.y - x1y1.y);
      detectionGenerated = true;
    } else if (x1y1) { // [top|left] corner is found - partial inner selection
      const x2y1 = this.frameRenderer.XYToImagePercents(
        this.frameRenderer.calculateMousePosition(this.addSignX + this.addSignWidth, this.addSignY)
      );
      if (x2y1) { // [top|right] corner is found. Fill selection to [bottom].
        this.createDetectionRectangle(x1y1.x, x1y1.y, x2y1.x - x1y1.x, 1 - x1y1.y);
        detectionGenerated = true;
      } else {
        const x1y2 = this.frameRenderer.XYToImagePercents(
          this.frameRenderer.calculateMousePosition(this.addSignX, this.addSignY + this.addSignHeight)
        );
        if (x1y2) { // [bottom|left] corner is found. Fill selection to [right].
          this.createDetectionRectangle(x1y1.x, x1y1.y, 1 - x1y1.x, x1y2.y - x1y1.y);
          detectionGenerated = true;
        } else { // no other corner is found. Fill selection to [bottom|right].
          this.createDetectionRectangle(x1y1.x, x1y1.y, 1 - x1y1.x, 1 - x1y1.y);
          detectionGenerated = true;
        }
      }
    } else if (x2y2) { // [bottom|right] corner is found - partial inner selection
      const x1y2 = this.frameRenderer.XYToImagePercents(
        this.frameRenderer.calculateMousePosition(this.addSignX, this.addSignY + this.addSignHeight)
      );
      if (x1y2) { // [bottom|left] corner is found. Fill selection to [top].
        this.createDetectionRectangle(x1y2.x, 0, x2y2.x - x1y2.x, x2y2.y);
        detectionGenerated = true;
      } else {
        const x2y1 = this.frameRenderer.XYToImagePercents(
          this.frameRenderer.calculateMousePosition(this.addSignX + this.addSignWidth, this.addSignY)
        );
        if (x2y1) { // [top|right] corner is found. Fill selection to [bottom].
          this.createDetectionRectangle(0, x2y1.y, x2y2.x, x2y2.y - x2y1.y);
          detectionGenerated = true;
        } else { // no other corner is found. Fill selection to [top|left]
          this.createDetectionRectangle(0, 0, x2y2.x, x2y2.y);
          detectionGenerated = true;
        }
      }
    } else { // no [top|left] or [bottom|right] corners can be found. Switching to [bottom|left] and [top|right] corners
      const x1y2 = this.frameRenderer.XYToImagePercents(
        this.frameRenderer.calculateMousePosition(this.addSignX, this.addSignY + this.addSignHeight)
      );
      if (x1y2) { // [bottom|left] corner is found. Fill selection [top|right]

        this.createDetectionRectangle(x1y2.x, 0, 1 - x1y2.x, x1y2.y);
        detectionGenerated = true;
      } else {
        const x2y1 = this.frameRenderer.XYToImagePercents(
          this.frameRenderer.calculateMousePosition(this.addSignX + this.addSignWidth, this.addSignY)
        );
        if (x2y1) { // [top|right] corner is found. Fill selection to [bottom|left]
          this.createDetectionRectangle(0, x2y1.y, x2y1.x, 1 - x2y1.y);
          detectionGenerated = true;
        } else {
          // Outher selection. Impossible to select part of the image!
        }
      }
    }
    if (detectionGenerated) {
      const sprites = [];
      if (this.showSignIcon && this.currentDetection && this.currentDetection.sign) {
        sprites.push({
          image: this._signsCache['sign_' + this.currentDetection.sign.internalName],
          position: [
            'right', 'top'
          ]
        });
      }
      const buttons = [];
      const detectionSelected = (this.photosIterator.currentStats.childDetectionId ?
        this.photosIterator.currentStats.childDetectionId === this.currentDetection.id :
        this.photosIterator.currentStats.detectionId === this.currentDetection.id);

      this.frameRenderer.addUISelection(
        this.currentDetection.locationOnPhoto,
        detectionSelected ? 'selected' : 'default',
        sprites,
        buttons,
        (this.auth.isLoggedIn() && detectionSelected),
        this._signsCache['_CORE_SIGN_RESIZE_POINT']
      );
      const topLeft = this.frameRenderer.convert3DXYZTo2DXY(this.frameRenderer.XYImagePercentTo3DXYZ(
        this.currentDetection.locationOnPhoto.x,
        this.currentDetection.locationOnPhoto.y
      ));
      const bottomRight = this.frameRenderer.convert3DXYZTo2DXY(this.frameRenderer.XYImagePercentTo3DXYZ(
        this.currentDetection.locationOnPhoto.x + this.currentDetection.locationOnPhoto.width,
        this.currentDetection.locationOnPhoto.y + this.currentDetection.locationOnPhoto.height
      ));
      this.addSignX = topLeft.x - 2;
      this.addSignY = topLeft.y;
      this.addSignWidth = bottomRight.x - topLeft.x + 4;
      this.addSignHeight = bottomRight.y - topLeft.y;
      this.frameRenderer.manualRender();
    }
  }

  public addSignMouseDown(event) {
    this.dragStarted = false;
    this.dragStartedDiff = 0;
    this.dragStartedXY = [event.pageX, event.pageY];
    if (this.addSignEnabled && event.which === 1) {
      this._addSignMouseDown(event.offsetX, event.offsetY)
    }
  }

  public addSignMouseMove(event) {
    this.dragStarted = true;
    this.dragStartedDiff = Math.sqrt(Math.pow(this.dragStartedXY[0] - event.pageX, 2) + Math.pow(this.dragStartedXY[1] - event.pageY, 2));
    if (this.addSignEnabled && this.addSignStarted) {
      event.preventDefault();
      event.stopPropagation();
      const viewport = $('.new-selection-viewport');
      this._addSignMouseMove(viewport, event.pageX - viewport.offset().left, event.pageY - viewport.offset().top);
    }
  }

  public addSignMouseUp(event) {
    if (this.addSignEnabled && this.addSignStarted) {
      event.preventDefault();
      event.stopPropagation();
      const viewport = $('.new-selection-viewport');
      this._addSignMouseUp(viewport, event.pageX - viewport.offset().left, event.pageY - viewport.offset().top, true);
    }
  }

  public addSignTouchStart(event) {
    this.dragStarted = false;
    this.dragStartedDiff = 0;
    this.dragStartedXY = [event.touches[0].pageX, event.touches[0].pageY];
    if (this.addSignEnabled && event.touches.length === 1) {
      event.preventDefault();
      // event.stopPropagation();
      const viewport = $('.street-gallery-renderer');
      this._addSignMouseDown(event.touches[0].pageX - viewport.offset().left, event.touches[0].pageY - viewport.offset().top)
    }
  }

  public addSignTouchMove(event) {
    this.dragStarted = true;
    this.dragStartedDiff = Math.sqrt(
      Math.pow(this.dragStartedXY[0] - event.touches[0].pageX, 2) +
      Math.pow(this.dragStartedXY[1] - event.touches[0].pageY, 2)
    );
    if (this.addSignEnabled && this.addSignStarted && event.touches.length === 1) {
      event.stopPropagation();
      const viewport = $('.new-selection-viewport');
      this._addSignMouseMove(viewport, event.touches[0].pageX - viewport.offset().left, event.touches[0].pageY - viewport.offset().top);
    }
  }

  public addSignTouchUp(event) {
    if (this.addSignEnabled && this.addSignStarted) {
      event.preventDefault();
      event.stopPropagation();
      const viewport = $('.new-selection-viewport');
      this._addSignMouseUp(viewport, 0, 0, true);
      // event.touches[0].pageX - viewport.offset().left, event.touches[0].pageY - viewport.offset().top
    }
  }


  protected createDetectionRectangle(x, y, width, height) {
    const newX = (x < this.addSignRectangleRestriction.x ? this.addSignRectangleRestriction.x : x);
    const newY = (y < this.addSignRectangleRestriction.y ? this.addSignRectangleRestriction.y : y);
    const tempWidth = newX + (x + width - newX);
    const tempHeight = newY + (y + height - newY);
    const tempWidthDest = this.addSignRectangleRestriction.x + this.addSignRectangleRestriction.width;
    const tempHeightDest = this.addSignRectangleRestriction.y + this.addSignRectangleRestriction.height;
    const newWidth = (tempWidth > tempWidthDest ? width - (tempWidth - tempWidthDest) : tempWidth - newX);
    const newHeight = (tempHeight > tempHeightDest ? height - (tempHeight - tempHeightDest) : tempHeight - newY);
    this.addSignFinished = true;
    this.currentDetection = new ApolloDetection();
    this.currentDetection.locationOnPhoto = new Rectangle();
    this.currentDetection.locationOnPhoto.x = newX;
    this.currentDetection.locationOnPhoto.y = newY;
    this.currentDetection.locationOnPhoto.width = newWidth;
    this.currentDetection.locationOnPhoto.height = newHeight;
    const locationOnPhoto = new Rectangle();
    locationOnPhoto.x = newX;
    locationOnPhoto.y = newY;
    locationOnPhoto.width = newWidth;
    locationOnPhoto.height = newHeight;
    this.imageGalleryEvent.emit({
      type: 'selection-region',
      locationOnPhoto: locationOnPhoto
    });

  }

  public completeSignSelection() {
    this.addSignFinished = false;
    this.addSignStarted = false;
    delete this.currentDetection;
    this.currentDetection = null;
    this.processDetections();
  }

  public editSignDialogVisible() {
    return this.addSignFinished || this.editSignStarted;
  }

  carouselItemVisible(jqueryElement): any {
    if (jqueryElement.length > 0) {
      const componentHeightDiff = 10;
      const scrollTop = $('.sign-selection-content-wrapper > div')[0].scrollTop;
      const scrollHeight = $('.sign-selection-content-wrapper').height();
      const elementTop = jqueryElement[0].offsetTop;
      const elementHeight = jqueryElement.outerHeight();
      if (elementTop >= scrollTop && elementTop + elementHeight + componentHeightDiff <= scrollTop + scrollHeight) {
        return {
          visible: true
        }
      } else {
        if (elementTop < scrollTop) {
          return {
            visible: false,
            scrollToY: elementTop - componentHeightDiff
          }
        } else if (elementTop + elementHeight + componentHeightDiff > scrollTop + scrollHeight) {
          return {
            visible: false,
            scrollToY: (elementTop - scrollHeight) + elementHeight + componentHeightDiff
          }
        }
      }
      throw new Error('something went wrong on carouselItemVisible!');
    } else {
      return {
        visible: true
      }
    }
  }

  scrollToDetection() {
    const detection = this.photosIterator.getCurrentDetection();
    if (detection) {
      clearTimeout(this.scrollToDetectionTimeout);
      this.scrollToDetectionTimeout = setTimeout(() => {
        const foundItem = this.carouselItemVisible($(`#sign-selection-id-${detection.sign.internalName}`));
        if (!foundItem.visible) {
          this.componentScroll.directiveRef.scrollToY(foundItem.scrollToY);
        }
      }, 1);
    }
  }

  _proceedDetectionSelectionByClick(x, y) {
    if (!this.frameRenderer.clickDetectionOptions(x, y)) {
      const xy = this.frameRenderer.XYToImagePercents(
        this.frameRenderer.calculateMousePosition(x, y)
      );
      if (xy) {
        this.photosIterator.switchToDetectionByXY(xy.x, xy.y);
      }
    }
  }

  proceedDetectionSelectionByClick(event) {
    if (this.frameRenderer.selectionOptionsEnabled && this.selectDetectionByClick && this.frameRenderer.panEnabled &&
      this.dragStartedDiff < 5) {
      const viewport = $('#streetGalleryRenderer');
      this._proceedDetectionSelectionByClick(event.pageX - viewport.offset().left, event.pageY - viewport.offset().top);
    }
  }

  disableSelectionOptions() {
    if (this.frameRenderer) {
      this.frameRenderer.disableSelectionOptions();
    }
  }

  enableSelectionOptions() {
    if (this.frameRenderer) {
      this.frameRenderer.enableSelectionOptions();
    }
  }

  restrictNewDetectionRegion(x, y, width, height) {
    this.addSignRectangleRestriction.x = x;
    this.addSignRectangleRestriction.y = y;
    this.addSignRectangleRestriction.width = width;
    this.addSignRectangleRestriction.height = height;
  }

}
