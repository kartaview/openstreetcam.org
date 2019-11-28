import * as THREE from 'three/build/three.min.js';

import { Rectangle } from '../api-services/common/models';

import { OSCFrameRender } from './osc-framerenderer';
import { IUISelectionSprite, IUIGLImageCache, IUISelectionButton, UISelectionTemplate } from './detection-base';
import { ApolloDetectionSelection } from './detection-selection';

export class ApolloDetectionSelectionButton {

  private _planeDetectionLinesGroup: THREE.Group = null;
  private _oscRenderer: OSCFrameRender;
  private _detectionSelection: ApolloDetectionSelection;

  private _buttonGeometry: THREE.PlaneGeometry = null;
  private _buttonMaterial: THREE.MeshBasicMaterial = null;
  private _buttonMesh: THREE.Mesh = null;

  private _buttonWidth = 0.02;
  private _buttonHeight = 0.02;
  private _scaleFactor = 1;
  private _buttonIndex = 1;
  private _currentDetectionSizes = null;
  private _currentButton: IUISelectionButton = null;
  private _currentButtonRatio = 1;

  constructor(oscRenderer: OSCFrameRender, planeDetectionLinesGroup: THREE.Group, detectionSelection: ApolloDetectionSelection) {
    this._oscRenderer = oscRenderer;
    this._planeDetectionLinesGroup = planeDetectionLinesGroup;
    this._detectionSelection = detectionSelection;
  }

  public buildButton(button: IUISelectionButton, sizes: Rectangle, buttonIndex: number) {
    this._currentButton = button;
    this._currentDetectionSizes = sizes;
    this._buttonIndex = buttonIndex;
    this._buttonMaterial = new THREE.MeshBasicMaterial({
      map: this._oscRenderer.getDefaultTexture(),
      depthTest: false,
      transparent: true
    });
    this._buttonGeometry = new THREE.PlaneGeometry(this._buttonWidth, this._buttonHeight);
    this._buttonGeometry.rotateY(THREE.Math.degToRad(-90));
    this._buttonMesh = new THREE.Mesh(this._buttonGeometry, this._buttonMaterial, this._buttonMaterial);
    this._buttonMesh.visible = false;
    this._buttonMesh.userData.callback = button.callback;
    this._buttonMesh.userData.detectionSelection = this._detectionSelection;
    this.setButtonPosition(this._scaleFactor);
    this._buttonMesh.renderOrder = 0;
    if (button.image.loaded) {
      this._buttonMaterial.map = button.image.image;
      this._currentButtonRatio = button.image.width / button.image.height;
      this.setButtonScale(this._scaleFactor);
    } else {
      if (button.image.error) {
        console.log('Photo cannot be loaded!');
      } else {
        if (!button.image.loading) {
          button.image.loadCallback();
        }
        button.image.observer.subscribe(photoObject => {
          if (photoObject) {
            this._buttonMaterial.map = photoObject.image;
            this._currentButtonRatio = photoObject.width / photoObject.height;
            this.setButtonScale(this._scaleFactor);
          }
        });
      }
    }
    this._planeDetectionLinesGroup.add(this._buttonMesh);
  }

  public resize(sizes: Rectangle) {
    this._currentDetectionSizes = sizes;
    this.setButtonPosition(this._scaleFactor);
  }

  private setButtonScale(scaleFactor: number) {
    this._buttonMesh.scale.set(1,
      ((this._currentButton.image.width / this._currentButton.image.height) * this._oscRenderer.currentPhotoRatio)
      * this._scaleFactor,
      ((this._currentButton.image.height / this._currentButton.image.width) / this._oscRenderer.currentPhotoRatio)
      * this._scaleFactor
    );
  }

  private setButtonPosition(scaleFactor: number) {
    // let buttonX = sizes.x + (sizes.width / 2) + (buttonWidth / 2);
    // let buttonY = sizes.y + (sizes.height / 2) + (buttonHeight / 2);
    const buttonX =
      this._currentDetectionSizes.x - (this._currentDetectionSizes.width / 2) +
      (((this._buttonIndex * this._buttonWidth) + ((this._buttonWidth * this._currentButtonRatio) / 2)) * scaleFactor);

    const buttonY = this._currentDetectionSizes.y +
      (this._currentDetectionSizes.height / 2) -
      (this._buttonHeight * 1.2 * scaleFactor);
    this._buttonMesh.position.set(0, buttonY, buttonX);

  }

  public rescale(scaleFactor: number) {
    this._scaleFactor = scaleFactor;
    this.setButtonPosition(scaleFactor);
    this.setButtonScale(scaleFactor);
  }

  show() {
    this._buttonMesh.visible = true;
  }

  hide() {
    this._buttonMesh.visible = false;
  }

  public destroy() {
    this._planeDetectionLinesGroup.remove(this._buttonMesh);
    delete this._buttonMesh;
    this._buttonMaterial.dispose();
    delete this._buttonMaterial;
    this._buttonGeometry.dispose();
    delete this._buttonGeometry;
  }
}
