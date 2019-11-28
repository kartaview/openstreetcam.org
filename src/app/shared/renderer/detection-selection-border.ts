import * as THREE from 'three/build/three.min.js';

import { Rectangle } from '../api-services/common/models';

import { OSCFrameRender } from './osc-framerenderer';
import { IUISelectionSprite, IUIGLImageCache, IUISelectionButton, UISelectionTemplate } from './detection-base';
import { ApolloDetectionSelection } from './detection-selection';

export class ApolloDetectionSelectionBorder {

  private _planeDetectionLinesGroup: THREE.Group = null;
  private _oscRenderer: OSCFrameRender;

  private _UISelectionTempates = {
    'default': new UISelectionTemplate('#e9214c', 1, null),
    'default_automatic': new UISelectionTemplate('#2bace2', 1, null),
    'selected': new UISelectionTemplate('#e9214c', 1, '#e9214c'),
    'selected_automatic': new UISelectionTemplate('#2bace2', 1, '#2bace2')
  }

  private _backgroundOpacity = 0.3;

  private _resizeDotWidth = 0.006;
  private _resizeDotHeight = 0.006;
  private _maxVisibleScaleFactor = 1.1;
  private _currentScaleFactor = 1;

  private _hasResize = false;
  private _resizeHidden = false;
  private _currentDetectionSizes = null;
  private _currentResizeSprite: IUIGLImageCache = null;
  private _resizeSprites: THREE.Mesh[] = [];

  private _lineMesh: THREE.LineLoop = null;
  private _lineBackground: THREE.Mesh = null;
  private _lineGeometry: THREE.Geometry = null;

  private _detectionSelection: ApolloDetectionSelection;

  constructor(oscRenderer: OSCFrameRender, planeDetectionLinesGroup: THREE.Group, detectionSelection: ApolloDetectionSelection) {
    this._oscRenderer = oscRenderer;
    this._planeDetectionLinesGroup = planeDetectionLinesGroup;
    this._detectionSelection = detectionSelection;
  }

  public hideResize() {
    this._resizeHidden = true;
    this._resizeSprites.forEach(resizeMesh => {
      resizeMesh.visible = false;
    });
  }

  public showResize() {
    this._resizeHidden = false;
    this.rescale(this._currentScaleFactor);
  }

  public buildBorder(points: THREE.Vector3[], templateId: string, sizes: Rectangle, hasResize: boolean,
    resizeSprite: IUIGLImageCache = null) {
    this._hasResize = hasResize;
    this._currentDetectionSizes = sizes;
    this._currentResizeSprite = resizeSprite;

    const template = (this._UISelectionTempates[templateId] ? this._UISelectionTempates[templateId] : null);
    const color = (template ? template.lineColor : '#00FF00');
    const lineWidth = (template ? template.lineWidth : 1);
    const backgroundColor = (template ? template.backgroundColor : '#00FF00');

    if (backgroundColor) {
      const lineBackgroundMaterial = new THREE.MeshBasicMaterial({
        color: backgroundColor,
        side: THREE.DoubleSide,
        depthTest: false,
      });
      lineBackgroundMaterial.transparent = true;
      lineBackgroundMaterial.opacity = this._backgroundOpacity;
      const planeGeometry = new THREE.PlaneGeometry(1, 1);
      planeGeometry.rotateY(THREE.Math.degToRad(-90));
      this._lineBackground = new THREE.Mesh(planeGeometry, lineBackgroundMaterial, lineBackgroundMaterial);
      this._lineBackground.position.set(0, this._currentDetectionSizes.y, this._currentDetectionSizes.x);
      this._lineBackground.scale.set(1, this._currentDetectionSizes.height, this._currentDetectionSizes.width);
      this._lineBackground.renderOrder = 0;
      this._planeDetectionLinesGroup.add(this._lineBackground);
    }

    const lineMaterial = new THREE.LineBasicMaterial({
      color,
      side: THREE.DoubleSide,
      depthTest: false,
      linewidth: lineWidth,
    });

    this._lineGeometry = new THREE.Geometry();
    this._lineGeometry.rotateY(THREE.Math.degToRad(-90));
    points.forEach(point => {
      this._lineGeometry.vertices.push(point);
    });

    this._lineMesh = new THREE.LineLoop(this._lineGeometry, lineMaterial);
    this._lineMesh.linewidth = 50;
    this._lineMesh.renderOrder = 1;

    this._planeDetectionLinesGroup.add(this._lineMesh);
    if (this._hasResize) {
      this.addUISelectionResizeOptions(points, resizeSprite);
    }
  }

  private addUISelectionResizeOptions(points: THREE.Vector3[], resizeSprite: IUIGLImageCache) {
    const resizeOptionGeometry = new THREE.PlaneGeometry(
      this._resizeDotWidth,
      this._resizeDotHeight
    );
    const resizeOptionMaterial = new THREE.MeshBasicMaterial({
      map: this._oscRenderer.getDefaultTexture(),
      depthTest: false,
      transparent: true
    });
    resizeOptionGeometry.rotateY(THREE.Math.degToRad(-90));
    let pointIndex = 0;
    let lastPoint = null;
    points.forEach(point => {
      let resizePoint = null;
      if (lastPoint) { // middle point
        const betweenPoints = this.centerXYZBetween2Points(point, lastPoint);
        resizePoint = new THREE.Mesh(resizeOptionGeometry, resizeOptionMaterial, resizeOptionMaterial);
        this.generateSelectionResizeUserData(resizePoint.userData, point, lastPoint, pointIndex);
        resizePoint.position.set(betweenPoints.x, betweenPoints.y, betweenPoints.z);
        resizePoint.renderOrder = 4;
        this._resizeSprites.push(resizePoint);
        this._planeDetectionLinesGroup.add(resizePoint);
      }
      // edge resize point
      resizePoint = new THREE.Mesh(resizeOptionGeometry, resizeOptionMaterial, resizeOptionMaterial);
      this.generateSelectionResizeUserData(resizePoint.userData, point, null, pointIndex);
      resizePoint.position.set(point.x, point.y, point.z);
      resizePoint.renderOrder = 4;
      this._resizeSprites.push(resizePoint);
      this._planeDetectionLinesGroup.add(resizePoint);
      lastPoint = point;
      pointIndex++;
      if (pointIndex === points.length) {
        const endBetweenPoints = this.centerXYZBetween2Points(points[0], point);
        resizePoint = new THREE.Mesh(resizeOptionGeometry, resizeOptionMaterial, resizeOptionMaterial);
        this.generateSelectionResizeUserData(resizePoint.userData, points[0], point, pointIndex);
        resizePoint.position.set(endBetweenPoints.x, endBetweenPoints.y, endBetweenPoints.z);
        resizePoint.renderOrder = 4;
        this._resizeSprites.push(resizePoint);
        this._planeDetectionLinesGroup.add(resizePoint);
      }
    });
    if (resizeSprite.loaded) {
      resizeOptionMaterial.map = resizeSprite.image;
    } else {
      resizeSprite.observer.subscribe(photoObject => {
        if (photoObject) {
          resizeOptionMaterial.map = photoObject.image;
        }
      });
    }
  }

  public resize(points: THREE.Vector3[], sizes: Rectangle) {
    this._lineMesh.geometry.dynamic = true;
    this._lineMesh.geometry.vertices = [];
    points.forEach(point => {
      this._lineMesh.geometry.vertices.push(point);
    });
    this._lineMesh.geometry.verticesNeedUpdate = true;
    this._lineBackground.position.set(0, sizes.y, sizes.x);
    this._lineBackground.scale.set(1, sizes.height, sizes.width);

    let resizePointIndex = -1;
    let pointIndex = 0;
    let lastPoint = null;
    points.forEach(point => {
      if (lastPoint) { // middle point
        const betweenPoints = this.centerXYZBetween2Points(point, lastPoint);
        resizePointIndex++;
        this._resizeSprites[resizePointIndex].position.set(betweenPoints.x, betweenPoints.y, betweenPoints.z);
      }
      // edge resize point
      resizePointIndex++;
      this._resizeSprites[resizePointIndex].position.set(point.x, point.y, point.z);
      lastPoint = point;
      pointIndex++;
      if (pointIndex === points.length) {
        const endBetweenPoints = this.centerXYZBetween2Points(points[0], point);
        resizePointIndex++;
        this._resizeSprites[resizePointIndex].position.set(endBetweenPoints.x, endBetweenPoints.y, endBetweenPoints.z);
      }
    });

    // this._lineMesh.geometry.__dirtyVertices = true;
    // this._lineMesh.geometry.computeFaceNormals();
  }

  public rescale(scaleFactor: number) {
    if (this._resizeHidden) {
      return;
    }
    this._currentScaleFactor = scaleFactor;
    this._resizeSprites.forEach(resizeMesh => {
      resizeMesh.scale.set(1,
        scaleFactor * this._oscRenderer.currentPhotoRatio,
        scaleFactor / this._oscRenderer.currentPhotoRatio
      );
      resizeMesh.visible = scaleFactor <= this._maxVisibleScaleFactor;
    });
  }

  public destroy() {
    if (this._lineMesh) {
      this._planeDetectionLinesGroup.remove(this._lineMesh);
      // this._lineMesh.dispose();
      delete this._lineMesh;
    }
    if (this._lineBackground) {
      this._planeDetectionLinesGroup.remove(this._lineBackground);
      // this._lineBackground.dispose();
      delete this._lineBackground;
    }
    this._resizeSprites.forEach(sprite => {
      this._planeDetectionLinesGroup.remove(sprite);
    });
  }

  private generateSelectionResizeUserData(userData, point1, point2 = null, pointIndex = null) {
    if (point2) {
      if (point1.y === point2.y) {
        userData['cursor'] = 'n-resize';
      } else if (point1.z === point2.z) {
        userData['cursor'] = 'w-resize';
      }
      if (pointIndex === 1) {
        userData['resize'] = true;
        userData['resizeType'] = 'top';
      } else if (pointIndex === 2) {
        userData['resize'] = true;
        userData['resizeType'] = 'right';
      } else if (pointIndex === 3) {
        userData['resize'] = true;
        userData['resizeType'] = 'bottom';
      } else if (pointIndex === 4) {
        userData['resize'] = true;
        userData['resizeType'] = 'left';
      }
    } else if (pointIndex !== null) {
      if (pointIndex === 0) {
        userData['cursor'] = 'nw-resize';
        userData['resize'] = true;
        userData['resizeType'] = 'top-left';
      } else if (pointIndex === 1) {
        userData['cursor'] = 'ne-resize';
        userData['resize'] = true;
        userData['resizeType'] = 'top-right';
      } else if (pointIndex === 2) {
        userData['cursor'] = 'nw-resize';
        userData['resize'] = true;
        userData['resizeType'] = 'bottom-right';
      } else if (pointIndex === 3) {
        userData['cursor'] = 'ne-resize';
        userData['resize'] = true;
        userData['resizeType'] = 'bottom-left';
      }
    }
    userData['detectionSelection'] = this._detectionSelection;
  }

  public centerXYZBetween2Points(point1: THREE.Vector3, point2: THREE.Vector3) {
    return new THREE.Vector3(
      point1.x + ((point2.x - point1.x) / 2),
      point1.y + ((point2.y - point1.y) / 2),
      point1.z + ((point2.z - point1.z) / 2)
    );
  }

}
