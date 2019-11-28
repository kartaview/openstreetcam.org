import * as $ from 'jquery';
import * as THREE from 'three/build/three.min.js';
import { BehaviorSubject } from 'rxjs/Rx';

import { ApolloDetectionSelection } from './detection-selection';
import { IUISelectionSprite, IUIGLImageCache, IUISelectionButton, UISelectionTemplate } from './detection-base';
import { Rectangle } from '../api-services/common/models';

export class OSCFrameRender {
  private container;
  private onLoadStart;
  private onLoadEnd;
  private manualRendering = true;

  private currentCursor = null;
  /** 3D Panning */
  private isCursorPanning = false;
  private onPointerDownPointerX = 0;
  private onPointerDownPointerY = 0;
  private onPointerDownLon = 0;
  private onPointerDownLat = 0;
  private lon = 0;
  private lat = 0;
  private phi = 0;
  private theta = 0;

  private isCursorResizing = false;
  private cursorResizeType = null;
  private cursorResizeSelection: ApolloDetectionSelection = null;
  public selectionOptionsEnabled = true;

  /** Default 3D objects */
  private camera = null;
  private scene = null;
  private renderer = null;
  private raycaster = null;

  /** DEFAULT 3D objects and data */
  private material = null;
  private defaultTexture = null;
  private meshType = 'INVALID';

  private planeDetectionLinesGroup = null;
  private planeGeometry = null;
  private planeMesh = null;


  private cylinderGeometry = null;
  private cylinderMesh = null;
  private sphereGeometry = null;
  private sphereMesh = null;
  private sphereMeshFieldOfView = 360;

  /** 3D camera orientation */
  private fovZoom = true;

  private cameraFov = 30;
  private defaultCameraFov = 39;
  private minFov = 5;
  private maxFov = 40;

  private maxZoom = 10;
  private minZoom = 2;
  private cameraZoom = 4;
  private defaultCameraZoom = 1;



  fixedPan = false;
  maxPanWidth = 25;
  maxPanHeight = 25;
  currentPhotoWidth = 0;
  currentPhotoHeight = 0;
  currentPhotoRatio = 1;
  rotationAngle = 0;
  currentPhotoId = null;
  resizetimeout = null;
  panEnabled = true;
  zoomEnabled = true;

  zoomSpeed = 150;

  /** Transitions */
  private animatedZoomEnabled = true;
  private animatedZoomInterval = 150;
  private animatedZoomStarted = false
  private animatedZoomStart = 0;
  private animatedZoomEnd = 0;
  private animatedZoomStartFov = 0;
  private animatedZoomEndFov = 0;
  private animatedZoomStartTime = null;

  private animatedPanEnabled = true;
  private animatedPanInterval = 150;
  private animatedPanStarted = false
  private animatedPanStartLon = 0;
  private animatedPanEndLon = 0;
  private animatedPanStartLat = 0;
  private animatedPanEndLat = 0;
  private animatedPanStartTime = null;

  private animationIntervalStarted = false;
  private animationIntervalHandle = null;

  private canvasMouseMoveTimeout = null;

  private afterZoomTimeout = null;

  panningChange = new BehaviorSubject(null);

  /** 3D Detections */
  private UIDetectionSelections = [];
  constructor(containerId, onLoadStart, onLoadEnd) {
    this.defaultTexture = new THREE.TextureLoader().load(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAsTAAALEwEAmpwYAAA' +
      'ADElEQVQI12OQk1cCAAC+AGASVufmAAAAAElFTkSuQmCC'
    );
    this.defaultTexture.minFilter = THREE.NearestFilter;

    this.container = $(containerId);

    this.onLoadStart = onLoadStart;
    this.onLoadEnd = onLoadEnd;

    this.init();
    this.animate();
  }

  private init() {
    this.meshType = 'PLANE';
    THREE.ImageUtils.crossOrigin = '';

    this.renderer = new THREE.WebGLRenderer();
    $(this.renderer.domElement).css('max-width', '100%');
    this.renderer.setClearColor(0x1e1f22, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.container.innerWidth(), this.container.innerHeight());
    this.container.append(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(75, this.container.innerWidth() / this.container.innerHeight(), 1, 1100);
    this.camera.target = new THREE.Vector3(0, 0, 0);
    this.camera.position.set(-10, 0, 0);
    this.scene = new THREE.Scene();
    this.raycaster = new THREE.Raycaster();

    // (window as any).scene = this.scene;
    // (window as any).THREE = THREE;

    this.resetZoom();

    this.planeDetectionLinesGroup = new THREE.Group();
    this.planeDetectionLinesGroup.renderOrder = 1;
    this.scene.add(this.planeDetectionLinesGroup);
    this.planeDetectionLinesGroup.frustumCulled = false;
    this.planeDetectionLinesGroup.position.set(4.25, 0, 0);
    this.planeDetectionLinesGroup.visible = false;


    this.material = new THREE.MeshBasicMaterial({
      // side: THREE.DoubleSide,
      map: this.getDefaultTexture(),
      depthTest: false
    });

    this.planeGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.planeGeometry.rotateY(THREE.Math.degToRad(-90)); // -90 * Math.PI / 180
    this.planeGeometry.scale(-0.7, 0.7, 0.7);
    this.planeGeometry.translate(0, 0, 0);
    this.planeMesh = new THREE.Mesh(this.planeGeometry, this.material);
    this.planeMesh.renderOrder = 0;
    this.scene.add(this.planeMesh);

    this.cylinderGeometry = new THREE.CylinderGeometry(25, 25, 50, 64, 1, true);
    this.cylinderGeometry.scale(-1, 1, 1);
    this.cylinderMesh = new THREE.Mesh(this.cylinderGeometry, this.material);
    this.cylinderMesh.renderOrder = 0;
    this.scene.add(this.cylinderMesh);

    this.rebuildSphereMesh(this.sphereMeshFieldOfView);

    this.container[0].addEventListener('dblclick', (event) => {
      this.proceedZoomToMousePosition(-300, event.pageX - this.container.offset().left,
        event.pageY - this.container.offset().top);
    });
    this.container[0].addEventListener('mousedown', (event) => {
      this.canvasMouseDown(event)
    }, false);
    this.container[0].addEventListener('mousemove', (event) => {
      if (!this.isCursorPanning) {
        this.canvasMouseMove(event.pageX - this.container.offset().left,
          event.pageY - this.container.offset().top);
      }
    }, false);
    document.addEventListener('mousemove', (event) => {
      this.screenMouseMove(event)
    }, false);
    document.addEventListener('mouseup', (event) => {
      this.screenMouseUp(event)
    }, false);
    this.container[0].addEventListener('touchstart', (event) => {
      if (event.touches.length > 1) {
        this.canvasTouchDown(event)
      }
    }, false);
    document.addEventListener('touchmove', (event) => {
      if (event.touches.length > 1 && this.isCursorPanning) {
        this.canvasTouchMove(event)
      }
    }, false);
    document.addEventListener('touchend', (event) => {
      this.screenMouseUp(event)
    }, false);
    this.container[0].addEventListener('wheel', (event) => {
      event.preventDefault();
      this.proceedZoomToMousePosition(event.deltaY < 0 ? -150 : 150, event.pageX - this.container.offset().left,
        event.pageY - this.container.offset().top);
    }, false);
  }

  private rebuildSphereMesh(fieldOfView = 360) {
    if (this.sphereMesh) {
      this.scene.remove(this.sphereMesh);
      this.sphereMesh = null;
      this.sphereGeometry = null;
    }
    let phiStart = 0;
    let phiEnd = Math.PI * 2;
    let thetaStart = 0;
    let thetaEnd = Math.PI;
    if (fieldOfView === 180) {
      phiStart = Math.PI / 2;
      phiEnd = phiStart * 2;
      thetaStart = Math.PI * 0.25;
      thetaEnd = Math.PI * 0.5;
    } else if (fieldOfView === 118) {
      phiStart = (Math.PI / 180 * fieldOfView);
      phiEnd = (Math.PI / 180 * fieldOfView);
      thetaStart = Math.PI * 0.25;
      thetaEnd = Math.PI * 0.5;
    }
    this.sphereGeometry = new THREE.SphereGeometry(500, 60, 40, phiStart, phiEnd, thetaStart, thetaEnd);
    this.sphereGeometry.scale(-1, 1, 1);
    this.sphereMesh = new THREE.Mesh(this.sphereGeometry, this.material);
    this.sphereMesh.renderOrder = 0;
    this.sphereMesh.rotation.y = 110;
    // this.sphereMesh.rotation.z = 20;
    this.scene.add(this.sphereMesh);

  }

  private startAnimationInterval() {
    if (this.manualRendering &&
      (
        (this.animatedZoomEnabled && this.animatedZoomStarted) ||
        (this.animatedPanEnabled && this.animatedPanStarted)
      ) && !this.animationIntervalStarted) {
      this.animationIntervalStarted = true;
      this.animationIntervalHandle = setInterval(() => {
        if (
          (this.animatedZoomEnabled && this.animatedZoomStarted) ||
          (this.animatedPanEnabled && this.animatedPanStarted)
        ) {
          this.afterZoom();
          this.manualRender();
        }
      }, 1);
    }
  }

  private stopAnimationInterval() {
    if (this.animationIntervalStarted) {
      this.animationIntervalStarted = false;
      clearInterval(this.animationIntervalHandle);
      this.afterZoom();
    }
  }

  private checkForStopAnimationInterval() {
    if (!this.animatedZoomStarted) {
      this.stopAnimationInterval();
    }
  }

  private proceedTransitions() {
    if (this.animatedZoomEnabled && this.animatedZoomStarted) {
      const currentTime = (new Date()).getTime();
      if (currentTime > this.animatedZoomStartTime + this.animatedZoomInterval || currentTime < this.animatedZoomStartTime) {
        this.animatedZoomStarted = false;
        if (this.fovZoom) {
          this.cameraFov = this.camera.fov = this.animatedZoomEndFov;
          this.camera.updateProjectionMatrix();
        } else {
          this.camera.zoom = this.cameraZoom = this.animatedZoomEnd;
          this.camera.updateProjectionMatrix();
        }
        this.checkForStopAnimationInterval();
      } else {
        const percent = (currentTime - this.animatedZoomStartTime) / this.animatedZoomInterval;
        if (this.fovZoom) {
          const minFov = (this.animatedZoomStartFov < this.animatedZoomEndFov ? this.animatedZoomStartFov : this.animatedZoomEndFov);
          const maxFov = (this.animatedZoomStartFov > this.animatedZoomEndFov ? this.animatedZoomStartFov : this.animatedZoomEndFov);
          const currentFovDelta = (maxFov - minFov) * percent;
          if (this.animatedZoomStartFov < this.animatedZoomEndFov) {
            this.cameraFov = this.animatedZoomStartFov + currentFovDelta;
          } else {
            this.cameraFov = this.animatedZoomStartFov - currentFovDelta;
          }
          this.camera.fov = this.cameraFov;
          this.camera.updateProjectionMatrix();
        } else {
          const minZoom = (this.animatedZoomStart < this.animatedZoomEnd ? this.animatedZoomStart : this.animatedZoomEnd);
          const maxZoom = (this.animatedZoomStart > this.animatedZoomEnd ? this.animatedZoomStart : this.animatedZoomEnd);
          const currentZoomDelta = (maxZoom - minZoom) * percent;
          if (this.animatedZoomStart < this.animatedZoomEnd) {
            this.cameraZoom = this.animatedZoomStart + currentZoomDelta;
          } else {
            this.cameraZoom = this.animatedZoomStart - currentZoomDelta;
          }
          this.camera.zoom = this.cameraZoom;
          this.camera.updateProjectionMatrix();
        }
      }
    }
    if (this.animatedPanEnabled && this.animatedPanStarted) {
      const currentTime = (new Date()).getTime();
      if (currentTime > this.animatedPanStartTime + this.animatedPanInterval || currentTime < this.animatedPanStartTime) {
        this.animatedPanStarted = false;
        this.lon = this.animatedPanEndLon;
        this.lat = this.animatedPanEndLat;
        this.updatePanAngles(true);
        this.checkForStopAnimationInterval();
      } else {
        const percent = (currentTime - this.animatedPanStartTime) / this.animatedPanInterval;

        const minLon = (this.animatedPanStartLon < this.animatedPanEndLon ? this.animatedPanStartLon : this.animatedPanEndLon);
        const maxLon = (this.animatedPanStartLon > this.animatedPanEndLon ? this.animatedPanStartLon : this.animatedPanEndLon);
        const currentLonDelta = (maxLon - minLon) * percent;
        if (this.animatedPanStartLon < this.animatedPanEndLon) {
          this.lon = this.animatedPanStartLon + currentLonDelta;
        } else {
          this.lon = this.animatedPanStartLon - currentLonDelta;
        }

        const minLat = (this.animatedPanStartLat < this.animatedPanEndLat ? this.animatedPanStartLat : this.animatedPanEndLat);
        const maxLat = (this.animatedPanStartLat > this.animatedPanEndLat ? this.animatedPanStartLat : this.animatedPanEndLat);
        const currentLatDelta = (maxLat - minLat) * percent;
        if (this.animatedPanStartLat < this.animatedPanEndLat) {
          this.lat = this.animatedPanStartLat + currentLatDelta;
        } else {
          this.lat = this.animatedPanStartLat - currentLatDelta;
        }

        this.updatePanAngles(true);
      }
    }
  }

  private animate() {
    if (this.manualRendering) {
      this.manualRender();
    } else {
      requestAnimationFrame(() => {
        this.animate();
      });
      this.proceedTransitions();
      this.renderer.render(this.scene, this.camera);
      // TWEEN.update();
    }
  }

  public manualRender() {
    if (this.manualRendering && this.renderer) {
      this.proceedTransitions();
      this.renderer.render(this.scene, this.camera);
    }
  }

  public getDefaultTexture() {
    return this.defaultTexture;
  }

  public setDefaultTexture() {
    this.material.map = this.getDefaultTexture();
  }

  public setTexture(photo, keepOrientation) {
    this.hideUISelections();
    this.currentPhotoId = photo.id;
    if (this.meshType === 'PLANE' && !keepOrientation) {
      this.resetOrientation();
    }
    if (photo.loaded) {
      this.material.map = photo.image;
      if (this.meshType === 'PLANE') {
        this.currentPhotoWidth = photo.width;
        this.currentPhotoHeight = photo.height;
        this.currentPhotoRatio = (this.currentPhotoWidth > 0 && this.currentPhotoHeight > 0 ?
          this.currentPhotoWidth / this.currentPhotoHeight :
          1);
        this.showUISelections();
        this.resetRotation();
      } else if (this.meshType === 'SPHERE') {
        // console.log(photo);
      }
      if (this.onLoadEnd) {
        this.onLoadEnd();
      }
      this.manualRender();
    } else {
      if (photo.error) {
        console.log('Photo cannot be loaded!');
      } else {
        this.setDefaultTexture();
        this.onLoadStart();
        photo.observer.subscribe(photoObject => {
          if (photoObject) {
            if (this.currentPhotoId === photoObject.id) {
              this.material.map = photoObject.image;
              if (this.meshType === 'PLANE') {
                this.currentPhotoWidth = photoObject.width;
                this.currentPhotoHeight = photoObject.height;
                this.currentPhotoRatio = (this.currentPhotoWidth > 0 && this.currentPhotoHeight > 0 ?
                  this.currentPhotoWidth / this.currentPhotoHeight :
                  1);
                this.resetRotation();
                this.showUISelections();
              } else if (this.meshType === 'SPHERE') {
              }
              if (this.onLoadEnd) {
                this.onLoadEnd();
              }
            }
            this.manualRender();
            // photo.observer.unsubscribe();
          }
        });
      }
    }
  }

  private resetPlaneViewConstraints() {
    if (this.currentPhotoHeight === 0 || this.currentPhotoWidth === 0) {
      return;
    }
    switch (this.rotationAngle) {
      case 90:
      case 270:
      case -90:
      case -270:
        this.resizePlane(this.currentPhotoHeight, this.currentPhotoWidth, true);
        break;
      default:
        this.resizePlane(this.currentPhotoWidth, this.currentPhotoHeight, false);
    }
    this.manualRender();
  }

  private resizePlane(width, height, inversedSizes) {
    const ratio = width / height;
    const heightUnits = 25;
    const widthUnits = heightUnits * ratio;
    this.maxPanWidth = widthUnits * 0.60;
    this.maxPanHeight = heightUnits * 0.7;
    if (inversedSizes) {
      this.planeMesh.scale.set(1, widthUnits / 2.5, heightUnits / 2.5);
      this.planeDetectionLinesGroup.scale.set(1, widthUnits / 2.5, heightUnits / 2.5);
    } else {
      this.planeMesh.scale.set(1, heightUnits / 2.5, widthUnits / 2.5);
      this.planeDetectionLinesGroup.scale.set(1, heightUnits / 2.5, widthUnits / 2.5);
    }
  }

  public resize() {
    clearTimeout(this.resizetimeout);
    this.resizetimeout = setTimeout(() => {
      const tempContainer = this.container.parents('.flexbox-content').first();
      this.camera.aspect = tempContainer.innerWidth() / tempContainer.innerHeight();
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(tempContainer.innerWidth(), tempContainer.innerHeight());
      this.manualRender();
    }, 1);
  }

  private initResizeMouseDown(x: number, y: number, resizeType: string, detectionSelection: ApolloDetectionSelection) {
    this.isCursorResizing = true;
    this.cursorResizeType = resizeType;
    this.cursorResizeSelection = detectionSelection;
  }

  private canvasMouseDown(event) {
    const x = event.pageX - this.container.offset().left;
    const y = event.pageY - this.container.offset().top;
    const intersections = this.rayCastScene(x, y);
    if (this.selectionOptionsEnabled && !intersections.some(intersection => {
      if (intersection.object.userData && intersection.object.userData.resize) {
        this.initResizeMouseDown(x, y,
          intersection.object.userData.resizeType,
          intersection.object.userData.detectionSelection
        );
        return true;
      }
    })) {
      if (event.which === 1 && this.panEnabled) {
        event.preventDefault();
        this.isCursorPanning = true;
        this.onPointerDownPointerX = event.clientX;
        this.onPointerDownPointerY = event.clientY;
        this.onPointerDownLon = this.lon;
        this.onPointerDownLat = this.lat;
      }
    }
  }

  private screenMouseMove(event) {
    if (this.isCursorPanning === true) {
      const speed = this.getDragSpeed();
      this.lon = ((this.onPointerDownPointerX - event.clientX) * 0.1) * speed + this.onPointerDownLon;
      this.lat = ((event.clientY - this.onPointerDownPointerY) * 0.1) * speed + this.onPointerDownLat;
      if (this.fixedPan) {
        this.lon = (this.lon > this.maxPanWidth ? this.maxPanWidth : (this.lon < -this.maxPanWidth ? -this.maxPanWidth : this.lon));
        this.lat = (
          this.lat > this.maxPanHeight ?
            this.maxPanHeight :
            (this.lat < -this.maxPanHeight ? -this.maxPanHeight : this.lat)
        );
      }
      this.updatePanAngles();
    }
  }

  private canvasMouseMove(x, y) {
    if (this.isCursorResizing) {
      this.cursorResizeSelection.resize(this.cursorResizeType, this.XYToImagePercents(this.calculateMousePosition(x, y)));
    } else {
      clearTimeout(this.canvasMouseMoveTimeout);
      this.canvasMouseMoveTimeout = setTimeout(() => {
        if (this.isCursorPanning !== true) {
          const intersections = this.rayCastScene(x, y);
          if (!intersections.some(intersection => {
            if (intersection.object.userData.cursor) {
              if (this.currentCursor !== intersection.object.userData.cursor) {
                this.currentCursor = intersection.object.userData.cursor;
                this.container.css('cursor', this.currentCursor);
              }
              return true;
            }
          })) {
            if (this.currentCursor) {
              this.currentCursor = null;
              this.container.css('cursor', '');
            }
          }
        }
      }, 5);
    }
  }

  private screenMouseUp(event) {
    if (this.isCursorPanning) {
      this.isCursorPanning = false;
    } else if (this.isCursorResizing) {
      this.isCursorResizing = false;
    }
  }

  private canvasTouchDown(event) {
    event.preventDefault();
    this.isCursorPanning = true;
    this.onPointerDownPointerX = event.touches[0].clientX;
    this.onPointerDownPointerY = event.touches[0].clientY;
    this.onPointerDownLon = this.lon;
    this.onPointerDownLat = this.lat;
  }

  private canvasTouchMove(event) {
    if (this.isCursorPanning === true) {
      const speed = this.getDragSpeed();
      this.lon = ((this.onPointerDownPointerX - event.touches[0].clientX) * 0.1) * speed + this.onPointerDownLon;
      this.lat = ((event.touches[0].clientY - this.onPointerDownPointerY) * 0.1) * speed + this.onPointerDownLat;
      if (this.fixedPan) {
        this.lon = (this.lon > this.maxPanWidth ? this.maxPanWidth : (this.lon < -this.maxPanWidth ? -this.maxPanWidth : this.lon));
        this.lat = (
          this.lat > this.maxPanHeight ?
            this.maxPanHeight :
            (this.lat < -this.maxPanHeight ? -this.maxPanHeight : this.lat)
        );
      }
      this.updatePanAngles();
    }
  }

  private getDragSpeed() {
    return (this.fovZoom ? this.camera.fov * Math.PI / 125 : (this.maxZoom / this.cameraZoom) / 7);
  }

  private updatePanAngles(noRender = false) {
    this.lat = Math.max(-85, Math.min(85, this.lat));
    this.phi = THREE.Math.degToRad(90 - this.lat);
    this.theta = THREE.Math.degToRad(this.lon);
    this.camera.target.x = 500 * Math.sin(this.phi) * Math.cos(this.theta);
    this.camera.target.y = 500 * Math.cos(this.phi);
    this.camera.target.z = 500 * Math.sin(this.phi) * Math.sin(this.theta);
    this.camera.lookAt(this.camera.target);
    if (!noRender) {
      this.manualRender();
    }
    this.panningChange.next({
      rotateX: this.lon % 360,
      rotateY: this.lat % 180,
      phi: this.phi
    });
  }

  public switchToPlaneObject() {
    this.fixedPan = true;
    this.meshType = 'PLANE';
    this.planeMesh.visible = true;
    this.cylinderMesh.visible = false;
    this.sphereMesh.visible = false;
    this.manualRender();
  }

  public switchToCylinderObject() {
    this.fixedPan = false;
    this.meshType = 'CYLINDER';
    this.planeMesh.visible = false;
    this.cylinderMesh.visible = true;
    this.sphereMesh.visible = false;
    this.manualRender();
  }

  public switchToSphereObject(fieldOfView = null) {
    this.fixedPan = false;
    this.meshType = 'SPHERE';
    if (fieldOfView) {
      if (fieldOfView < 360) {
        this.fixedPan = true;
      }
      if (this.sphereMeshFieldOfView !== fieldOfView) {
        this.rebuildSphereMesh(fieldOfView);
      }
    } else {
      if (this.sphereMeshFieldOfView < 360) {
        this.fixedPan = true;
      }
    }
    if (this.fixedPan) {
      this.maxPanWidth = this.sphereMeshFieldOfView / 5;
      this.maxPanHeight = this.sphereMeshFieldOfView / 10;
    }
    this.planeMesh.visible = false;
    this.cylinderMesh.visible = false;
    this.sphereMesh.visible = true;
    this.manualRender();
  }

  public rotateLeft() {
    this.rotate(-90);
  }

  public rotateRight() {
    this.rotate(90);
  }

  private rotate(angle) { // -270 ... 270
    if (this.meshType !== 'PLANE') {
      return;
    }
    this.rotationAngle += angle;
    this.rotationAngle = (this.rotationAngle % 360);
    this.updateRotation();
    this.resetOrientation();
    this.resetZoom();
  }

  public resetRotation() {
    this.rotationAngle = 0;
    this.updateRotation();
  }

  private updateRotation() {
    this.planeMesh.rotation.set(THREE.Math.degToRad(this.rotationAngle), 0, 0);
    this.planeDetectionLinesGroup.rotation.set(THREE.Math.degToRad(this.rotationAngle), 0, 0);
    this.resetPlaneViewConstraints();
  }

  public enablePan(enabled = true) {
    this.panEnabled = enabled;
  }

  public enableZoom(enabled = true) {
    this.zoomEnabled = enabled;
  }

  public resetOrientation(animate = false) {
    if (animate) {
      this.proceedPan(0, 0, true)
    } else {
      this.lon = 0;
      this.lat = 0;
      this.updatePanAngles();
    }
  }

  private proceedPan(newLon, newLat, animate = null) {
    if (!this.panEnabled) {
      return false;
    }
    const disableAnimation = animate !== null && !animate;
    const forceAnimation = animate !== null && animate;
    const defaultAnimation = animate === null;
    if ((this.animatedPanEnabled && defaultAnimation) || (!defaultAnimation && !disableAnimation && forceAnimation)) {
      if (this.lon !== newLon || this.lat !== newLat) {
        this.animatedPanStartLon = this.lon;
        this.animatedPanEndLon = newLon;
        this.animatedPanStartLat = this.lat;
        this.animatedPanEndLat = newLat;
        this.animatedPanStartTime = (new Date()).getTime();
        this.animatedPanStarted = true;
      }
      if (this.manualRendering) {
        this.startAnimationInterval();
      }
    } else {
      if (this.lon !== newLon || this.lat !== newLat) {
        this.lon = newLon;
        this.lat = newLat;
        this.updatePanAngles();
      }
    }
    this.manualRender();
  }


  public zoomIn() {
    this.proceedZoom(-this.zoomSpeed);
  }

  public zoomOut() {
    this.proceedZoom(this.zoomSpeed);
  }

  public resetZoom(animate = false) {
    if (animate) {
      this.proceedZoom((this.fovZoom ? this.defaultCameraFov : this.defaultCameraZoom), true);
    } else {
      this.animatedZoomStarted = false;
      this.checkForStopAnimationInterval();
      if (this.fovZoom) {
        this.camera.fov = this.cameraFov = this.defaultCameraFov;
        this.camera.updateProjectionMatrix();
      } else {
        // this.camera.fov = this.cameraFov = this.defaultCameraFov;
        this.camera.zoom = this.cameraZoom = this.defaultCameraZoom;
        this.camera.updateProjectionMatrix();
      }
      this.manualRender();
    }
  }

  private proceedZoomToMousePosition(delta, x, y, fixed = false, animate = null) {
    const percents = this.XYToImagePercents(this.calculateMousePosition(x, y));
    if (percents) {
      if (delta < 0) {
        this.panAndZoomToImagePosition(percents.x, percents.y, delta);
      } else {
        this.proceedZoom(delta, fixed, animate);
        // this.panAndZoomToImagePosition(0, 0, delta);
      }
    } else {
      this.proceedZoom(delta, fixed, animate);
    }
  }

  private proceedZoom(delta, fixed = false, animate = null) {
    if (!this.zoomEnabled) {
      return false;
    }
    const disableAnimation = animate !== null && !animate;
    const forceAnimation = animate !== null && animate;
    const defaultAnimation = animate === null;
    if (this.fovZoom) {
      let fov = (fixed ? delta : this.cameraFov + (delta * 0.05));
      fov = (fov > this.maxFov ? this.maxFov : (fov < this.minFov ? this.minFov : fov))

      if ((this.animatedZoomEnabled && defaultAnimation) || (!defaultAnimation && !disableAnimation && forceAnimation)) {
        if (this.cameraFov !== fov) {
          this.animatedZoomStartFov = this.cameraFov;
          this.animatedZoomEndFov = fov;
          this.animatedZoomStartTime = (new Date()).getTime();
          this.animatedZoomStarted = true;
        }
        if (this.manualRendering) {
          this.startAnimationInterval();
        }
      } else {
        if (this.cameraFov !== fov) { // fov <= this.maxFov && fov >= this.minFov
          this.camera.fov = this.cameraFov = fov;
          this.camera.updateProjectionMatrix();
          this.afterZoom();
        }
      }
    } else {
      let zoom = (fixed ? delta : this.cameraZoom + (-delta * 0.01));
      zoom = (zoom > this.maxZoom ? this.maxZoom : (zoom < this.minZoom ? this.minZoom : zoom))

      if ((this.animatedZoomEnabled && defaultAnimation) || (!defaultAnimation && !disableAnimation && forceAnimation)) {
        if (this.cameraZoom !== zoom) {
          this.animatedZoomStart = this.cameraZoom;
          this.animatedZoomEnd = zoom;
          this.animatedZoomStartTime = (new Date()).getTime();
          this.animatedZoomStarted = true;
        }
        if (this.manualRendering) {
          this.startAnimationInterval();
        }
      } else {
        if (this.cameraZoom !== zoom) {
          this.camera.zoom = this.cameraZoom = zoom;
          this.camera.updateProjectionMatrix();
          this.afterZoom();
        }
      }
    }
    this.manualRender();
  }

  public afterZoom() {
    clearTimeout(this.afterZoomTimeout);
    this.afterZoomTimeout = setTimeout(() => {
      this.rescaleUIDetectionSelections();
    }, 5);
  }

  public panAndZoomToImagePosition(x, y, delta, animate = null) {
    if (this.meshType === 'PLANE') {
      let factor = 1;
      if (this.fovZoom) {
        let fov = this.cameraFov + (delta * 0.05);
        fov = (fov > this.maxFov ? this.maxFov : (fov < this.minFov ? this.minFov : fov))

        factor = 1 - fov / this.cameraFov;
      } else {
        let zoom = this.cameraZoom + (delta * 0.01);
        zoom = (zoom > this.maxZoom ? this.maxZoom : (zoom < this.minZoom ? this.minZoom : zoom))

        factor = 1 - zoom / this.cameraZoom;
      }
      const fixDiff = 1.2;

      const objLon = ((this.maxPanWidth * (fixDiff * 2)) * x) - this.maxPanWidth * fixDiff;
      const objLat = -(((this.maxPanHeight * (fixDiff * 2)) * y) - this.maxPanHeight * fixDiff);

      let newLat = this.lat + factor * (objLat - this.lat);
      let newLon = this.lon + factor * (objLon - this.lon) * Math.cos(THREE.Math.degToRad(this.lat));

      newLon = (newLon > this.maxPanWidth * fixDiff ?
        this.maxPanWidth * fixDiff :
        (newLon < -this.maxPanWidth * fixDiff ? -this.maxPanWidth * fixDiff : newLon)
      );
      newLat = (newLat > this.maxPanHeight * fixDiff ?
        this.maxPanHeight * fixDiff :
        (newLat < -this.maxPanHeight * fixDiff ? -this.maxPanHeight * fixDiff : newLat)
      );

      this.proceedPan(newLon, newLat, animate);
      this.proceedZoom(delta);
    } else if (this.meshType === 'SPHERE' && this.sphereMeshFieldOfView < 360) {
    }
  }

  public panAndZoomToImageRectangle(x, y, width, height, animate = null) {
    if (this.meshType === 'PLANE') {
      const panX = x + (width / 2);
      const panY = y + (height / 2);
      const fixDiff = 1.2;
      let newLon = ((this.maxPanWidth * (fixDiff * 2)) * panX) - this.maxPanWidth * fixDiff;
      let newLat = -(((this.maxPanHeight * (fixDiff * 2)) * panY) - this.maxPanHeight * fixDiff);

      newLon = (newLon > this.maxPanWidth * fixDiff ?
        this.maxPanWidth * fixDiff :
        (newLon < -this.maxPanWidth * fixDiff ? -this.maxPanWidth * fixDiff : newLon)
      );
      newLat = (newLat > this.maxPanHeight * fixDiff ?
        this.maxPanHeight * fixDiff :
        (newLat < -this.maxPanHeight * fixDiff ? -this.maxPanHeight * fixDiff : newLat)
      );

      const maxDiff = (width > height ? width : height);
      this.proceedZoom((
        this.fovZoom ?
          ((this.maxFov - this.minFov) * maxDiff) + this.minFov :
          ((this.maxZoom - this.minZoom) * maxDiff) + this.minZoom
      ), true, animate);
      this.proceedPan(newLon, newLat, animate);
    }
  }

  /** 3D raycast API */
  public XYPercentToPlaneSize(percentX, percentY, percentWidth, percentHeight): Rectangle {
    if (this.meshType === 'PLANE') {
      const newRectangle = new Rectangle();
      newRectangle.x = percentX + (percentWidth / 2) - 0.5;
      newRectangle.y = -(percentY + (percentHeight / 2) - 0.5);
      newRectangle.width = (percentWidth);
      newRectangle.height = -(percentHeight);
      return newRectangle;
    } else {
      throw new Error(`XYPercentToPlaneSize was not implemented for ${this.meshType}!`);
    }
  }

  public XYImagePercentTo3DXYZ(percentX, percentY) {
    if (this.meshType === 'PLANE') {
      return new THREE.Vector3(0, -(percentY - 0.5), (percentX - 0.5));
    } else {
      throw new Error(`XYImagePercentTo3DXYZ was not implemented for ${this.meshType}!`);
    }
  }

  public convert3DXYZTo2DXY(source: THREE.Vector3) {
    const pos = source.clone();
    if (this.meshType === 'PLANE') {
      pos.multiply(new THREE.Vector3(this.planeMesh.scale.x, this.planeMesh.scale.y, this.planeMesh.scale.z));
      pos.multiply(new THREE.Vector3(0.7, 0.7, 0.7));
    } else {
      throw new Error(`convert3DXYZTo2DXY was not implemented for ${this.meshType}!`);
    }

    const projScreenMat = new THREE.Matrix4();
    projScreenMat.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    pos.applyMatrix4(projScreenMat);

    return {
      x: (pos.x + 1) * this.container.innerWidth() / 2,
      y: (- pos.y + 1) * this.container.innerHeight() / 2
    };
  }

  public calculateMousePosition(x, y) {
    const mousePosition = new THREE.Vector2(x / this.container.width(), y / this.container.height());
    mousePosition.set((mousePosition.x * 2) - 1, -(mousePosition.y * 2) + 1);
    return mousePosition;
  }

  public XYToImagePercents(mousePosition) {
    if (this.meshType === 'PLANE') {
      this.camera.updateProjectionMatrix();
      this.manualRender();
      this.raycaster.setFromCamera(mousePosition, this.camera);
      const intersects = this.raycaster.intersectObject(this.planeMesh, true);
      if (intersects.length > 0 && intersects[0].uv) {
        const uv = intersects[0].uv;
        intersects[0].object.material.map.transformUv(uv);
        return uv;
      }
      return null;
    } else if (this.meshType === 'SPHERE') {
      this.camera.updateProjectionMatrix();
      this.manualRender();
      this.raycaster.setFromCamera(mousePosition, this.camera);
      const intersects = this.raycaster.intersectObject(this.sphereMesh, true);
      if (intersects.length > 0 && intersects[0].uv) {
        const uv = intersects[0].uv;
        intersects[0].object.material.map.transformUv(uv);
        return uv;
      }
      return null;
    } else {
      throw new Error(`XYToImagePercents was not implemented for ${this.meshType}!`);
    }
  }

  public clearUISelections() {
    this.UIDetectionSelections.forEach(selection => {
      selection.destroy();
    });
    this.UIDetectionSelections = [];
    this.manualRender();
  }

  private getDetectionSelectionScaleFactor() {
    const zoom = (this.fovZoom ? (this.cameraFov) / 15 : this.cameraZoom / 2);
    return zoom;
  }

  public rescaleUIDetectionSelections() {
    const scaleFactor = this.getDetectionSelectionScaleFactor();
    this.UIDetectionSelections.forEach(selection => {
      selection.rescale(scaleFactor);
    });
    this.manualRender();
  }

  public addUISelection(photoLocation: Rectangle, templateId, sprites: IUISelectionSprite[],
    buttons: IUISelectionButton[], hasResize: boolean,
    resizeSprite: IUIGLImageCache = null) {
    const newDetection = new ApolloDetectionSelection(this, this.planeDetectionLinesGroup);
    newDetection.buildDetection(photoLocation, templateId, sprites, buttons, hasResize, resizeSprite);
    newDetection.rescale(this.getDetectionSelectionScaleFactor());
    this.UIDetectionSelections.push(newDetection);
    if (!this.selectionOptionsEnabled) {
      newDetection.hideOptions();
    }
  }

  private showUISelections() {
    if (this.meshType === 'PLANE') {
      this.planeDetectionLinesGroup.visible = true;
      this.manualRender();
    }
  }

  private hideUISelections() {
    this.planeDetectionLinesGroup.visible = false;
    this.manualRender();
  }

  private showUISelectionOptions() {
    if (this.meshType === 'PLANE') {
      this.UIDetectionSelections.forEach(selection => {
        selection.showOptions();
      });
      this.manualRender();
    }
  }

  private hideUISelectionOptions() {
    this.UIDetectionSelections.forEach(selection => {
      selection.hideOptions();
    });
    this.manualRender();
  }

  private rayCastScene(x, y) {
    let output = [];
    if (this.meshType === 'PLANE') {
      this.manualRender();
      const mousePosition = this.calculateMousePosition(x, y);
      this.raycaster.setFromCamera(mousePosition, this.camera);
      output = this.raycaster.intersectObjects(this.scene.children, true);
    } else if (this.meshType === 'SPHERE') {
      this.manualRender();
      /* const mousePosition = this.calculateMousePosition(x, y);
      this.raycaster.setFromCamera(mousePosition, this.camera);
      output = this.raycaster.intersectObjects(this.scene.children, true);*/
    } else {
      throw new Error(`rayCastScene was not implemented for ${this.meshType}!`);
    }
    return output;
  }

  public clickDetectionOptions(x, y) {
    const intersections = this.rayCastScene(x, y);
    let found = false;
    intersections.some(intersection => {
      if (intersection.object.userData.callback) {
        intersection.object.userData.callback(intersection.object.userData.detectionSelection);
        found = true;
        return true;
      }
      if (intersection.object.userData.resize) {
        found = true;
      }
    });
    return found;
  }

  public hide() {
    this.clearUISelections();
    if (this.meshType === 'PLANE') {
      this.planeMesh.visible = false;
    } else if (this.meshType === 'CYLINDER') {
      this.cylinderMesh.visible = false;
    } else if (this.meshType === 'SPHERE') {
      this.sphereMesh.visible = false;
    }
  }

  public show() {
    if (this.meshType === 'PLANE') {
      this.planeMesh.visible = true;
    } else if (this.meshType === 'CYLINDER') {
      this.cylinderMesh.visible = true;
    } else if (this.meshType === 'SPHERE') {
      this.sphereMesh.visible = true;
    }
  }

  public enableSelectionOptions() {
    this.selectionOptionsEnabled = true;
    this.showUISelectionOptions();
  }

  public disableSelectionOptions() {
    this.selectionOptionsEnabled = false;
    this.hideUISelectionOptions();
  }

}
