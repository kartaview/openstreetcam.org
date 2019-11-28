import * as THREE from 'three/build/three.min.js';

import { Rectangle } from '../api-services/common/models';

import { OSCFrameRender } from './osc-framerenderer';
import { IUISelectionSprite, IUIGLImageCache, IUISelectionButton, UISelectionTemplate } from './detection-base';

export class ApolloDetectionSelectionSprite {

  private _planeDetectionLinesGroup: THREE.Group = null;
  private _oscRenderer: OSCFrameRender;

  private _spriteWidth = 0.12;
  private _spriteHeight = 0.12;
  private _scaleFactor = 1;

  private _spriteGeometry: THREE.PlaneGeometry = null;
  private _spriteMesh: THREE.Mesh = null;
  private _spriteMaterial: THREE.MeshBasicMaterial = null;

  private _currentSprite: IUISelectionSprite = null;
  private _currentDetectionSizes = null;

  constructor(oscRenderer: OSCFrameRender, planeDetectionLinesGroup: THREE.Group) {
    this._oscRenderer = oscRenderer;
    this._planeDetectionLinesGroup = planeDetectionLinesGroup;
  }

  public buildSprite(sprite: IUISelectionSprite, sizes: Rectangle) {
    this._currentSprite = sprite;
    this._currentDetectionSizes = sizes;
    this._spriteMaterial = new THREE.MeshBasicMaterial({
      map: this._oscRenderer.getDefaultTexture(),
      depthTest: false,
      transparent: true
    });
    this._spriteGeometry = new THREE.PlaneGeometry(this._spriteWidth, this._spriteHeight);
    this._spriteGeometry.rotateY(THREE.Math.degToRad(-90));
    this._spriteMesh = new THREE.Mesh(this._spriteGeometry, this._spriteMaterial, this._spriteMaterial);
    this.setSpritePosition(1);
    this._spriteMesh.renderOrder = 0;
    if (sprite.image.loaded) {
      this._spriteMaterial.map = sprite.image.image;
      this.rescale(this._scaleFactor);
      /* this._spriteMesh.scale.set(1,
        ((sprite.image.height / sprite.image.width) / this._oscRenderer.currentPhotoRatio) * this._scaleFactor,
        ((sprite.image.width / sprite.image.height) * this._oscRenderer.currentPhotoRatio) * this._scaleFactor
      );*/
    } else {
      if (sprite.image.error) {
        console.log('Photo cannot be loaded!');
      } else {
        if (!sprite.image.loading) {
          sprite.image.loadCallback();
        }
        sprite.image.observer.subscribe(photoObject => {
          if (photoObject && this._spriteMaterial) {
            this._spriteMaterial.map = photoObject.image;
            this.rescale(this._scaleFactor);
            /*this._spriteMesh.scale.set(1,
              ((sprite.image.height / sprite.image.width) * this._oscRenderer.currentPhotoRatio) * this._scaleFactor,
              ((sprite.image.width / sprite.image.height) / this._oscRenderer.currentPhotoRatio) * this._scaleFactor
            );
            this.setSpritePosition(this._scaleFactor);*/
            // sprite.image.observer.unsubscribe(this);
          }
        });
      }
    }
    this._planeDetectionLinesGroup.add(this._spriteMesh);
  }

  public resize(sizes: Rectangle) {
    this._currentDetectionSizes = sizes;
    this.setSpritePosition(this._scaleFactor);
  }

  public setSpritePosition(scaleFactor: number) {
    let spriteX = this._currentDetectionSizes.x + (this._currentDetectionSizes.width / 2);
    let spriteY = this._currentDetectionSizes.y + (this._currentDetectionSizes.height / 2);
    if (this._currentSprite.position.length > 0) {
      switch (this._currentSprite.position[0]) {
        case 'left':
          spriteX = this._currentDetectionSizes.x - (this._currentDetectionSizes.width / 2);
          break;
        case 'right':
          spriteX = this._currentDetectionSizes.x + (this._currentDetectionSizes.width / 2);
          break;
        case 'center':
          spriteX = this._currentDetectionSizes.x;
          break;
      }
    }
    if (this._currentSprite.position.length > 1) {
      switch (this._currentSprite.position[1]) {
        case 'top':
          spriteY = this._currentDetectionSizes.y - (this._currentDetectionSizes.height / 2);
          break;
        case 'bottom':
          spriteY = this._currentDetectionSizes.y + (this._currentDetectionSizes.height / 2);
          break;
        case 'center':
          spriteY = this._currentDetectionSizes.y;
          break;
      }
    }
    this._spriteMesh.position.set(0, spriteY, spriteX);

  }

  public rescale(scaleFactor: number) {
    this._scaleFactor = scaleFactor;
    this.setSpritePosition(scaleFactor);
    if (scaleFactor > 1) {
      scaleFactor = 1;
    }
    const imageRatio = this._currentSprite.image.width / this._currentSprite.image.height;
    const imageSmallerSize = (this._currentSprite.image.width < this._currentSprite.image.height ?
      this._currentSprite.image.width :
      this._currentSprite.image.height);
    const scaleX = scaleFactor * (this._spriteWidth * (this._currentSprite.image.width / imageSmallerSize));
    const scaleY = scaleFactor * (this._spriteHeight * (this._currentSprite.image.height / imageSmallerSize));
    this._spriteMesh.scale.set(1,
      scaleY, //  * this._oscRenderer.currentPhotoRatio
      scaleX //  / this._oscRenderer.currentPhotoRatio
    );
  }

  public destroy() {
    this._planeDetectionLinesGroup.remove(this._spriteMesh);
    delete this._spriteMesh;
    this._spriteGeometry.dispose();
    delete this._spriteGeometry;
    this._spriteMaterial.dispose();
    delete this._spriteMaterial;
  }
}
