import * as THREE from 'three/build/three.min.js';

import { IRectangle } from '../api-services/common/models';

import { IApolloDetectionSelection } from './detection-selection.interface';
import { ApolloDetectionSelectionSprite } from './detection-selection-sprite';
import { ApolloDetectionSelectionButton } from './detection-selection-button';
import { ApolloDetectionSelectionBorder } from './detection-selection-border';

// import { OSCFrameRender } from './osc-framerenderer';
import { IUISelectionSprite, IUIGLImageCache, IUISelectionButton, UISelectionTemplate } from './detection-base';


export class ApolloDetectionSelection implements IApolloDetectionSelection {
  private _planeDetectionLinesGroup: THREE.Group = null;
  private _oscRenderer: any; // OSCFrameRender
  private _buttonWidth = 0.02;
  private _buttonHeight = 0.02;
  private _sprites: ApolloDetectionSelectionSprite[] = [];
  private _buttons: ApolloDetectionSelectionButton[] = [];

  private _border: ApolloDetectionSelectionBorder = null;

  private _photoLocation: IRectangle = null;
  private _photoLocationBackup: IRectangle = null;
  private _photoLocationPlaneSizes = null;
  private _photoLocationPoints: THREE.Vector3[] = null;

  public resizing = false;

  constructor(oscRenderer: any, planeDetectionLinesGroup: THREE.Group) {
    this._oscRenderer = oscRenderer;
    this._planeDetectionLinesGroup = planeDetectionLinesGroup;
  }

  public buildDetection(photoLocation: IRectangle, templateId: string, sprites: IUISelectionSprite[], buttons: IUISelectionButton[],
    hasResize: boolean, resizeSprite: IUIGLImageCache = null) {
    this._photoLocation = photoLocation;
    this.generatePhotoLocationPlaneSizes();
    this.generatePhotoLocationPoints();

    this._border = new ApolloDetectionSelectionBorder(this._oscRenderer, this._planeDetectionLinesGroup, this);
    this._border.buildBorder(this._photoLocationPoints, templateId, this._photoLocationPlaneSizes, hasResize, resizeSprite);

    sprites.forEach(sprite => {
      const newSprite = new ApolloDetectionSelectionSprite(this._oscRenderer, this._planeDetectionLinesGroup);
      newSprite.buildSprite(sprite, this._photoLocationPlaneSizes);
      this._sprites.push(newSprite);
    });

    let inc = 0;
    buttons.forEach(button => {
      const newButton = new ApolloDetectionSelectionButton(this._oscRenderer, this._planeDetectionLinesGroup, this);
      newButton.buildButton(button, this._photoLocationPlaneSizes, inc);
      this._buttons.push(newButton);
      inc++;
    });

  }

  private generatePhotoLocationPlaneSizes() {
    this._photoLocationPlaneSizes = this._oscRenderer.XYPercentToPlaneSize(
      this._photoLocation.x,
      this._photoLocation.y,
      this._photoLocation.width,
      this._photoLocation.height
    );
  }

  private generatePhotoLocationPoints() {
    this._photoLocationPoints = [
      this._oscRenderer.XYImagePercentTo3DXYZ(this._photoLocation.x, this._photoLocation.y),
      this._oscRenderer.XYImagePercentTo3DXYZ(
        this._photoLocation.x + this._photoLocation.width,
        this._photoLocation.y
      ),
      this._oscRenderer.XYImagePercentTo3DXYZ(
        this._photoLocation.x + this._photoLocation.width,
        this._photoLocation.y + this._photoLocation.height
      ),
      this._oscRenderer.XYImagePercentTo3DXYZ(
        this._photoLocation.x,
        this._photoLocation.y + this._photoLocation.height
      )
    ];
  }

  public rescale(scaleRatio) {
    this._border.rescale(scaleRatio);
    this._sprites.forEach(sprite => {
      sprite.rescale(scaleRatio);
    });
    this._buttons.forEach(button => {
      button.rescale(scaleRatio);
    });
  }

  public saveResize() {
    if (this.resizing) {
      this.resizing = false;
      this._photoLocationBackup = null;
      this.hideButtons();
    }
  }

  public cancelResize() {
    if (this.resizing) {
      this.resizing = false;
      this._photoLocation = this._photoLocationBackup;
      this._photoLocationBackup = null;

      this.generatePhotoLocationPlaneSizes();
      this.generatePhotoLocationPoints();

      this._border.resize(this._photoLocationPoints, this._photoLocationPlaneSizes);
      this._sprites.forEach(sprite => {
        sprite.resize(this._photoLocationPlaneSizes);
      });
      this._buttons.forEach(button => {
        button.resize(this._photoLocationPlaneSizes);
      });
      this.hideButtons();
    }
  }

  public resize(direction: string, xy = null) {
    if (!xy) {
      return null;
    }
    if (!this._photoLocationBackup) {
      this._photoLocationBackup = this._photoLocation.clone();
      this.resizing = true;
      this.showButtons();
    }
    const minWidth = 0.002 * this._oscRenderer.currentPhotoRatio;
    const minHeight = 0.002 / this._oscRenderer.currentPhotoRatio;
    switch (direction) {
      case 'left':
        this._photoLocation.width = this._photoLocation.width + (this._photoLocation.x - xy.x);
        this._photoLocation.x = xy.x;
        break;
      case 'top':
        this._photoLocation.height = this._photoLocation.height + (this._photoLocation.y - xy.y);
        this._photoLocation.y = xy.y;
        break;
      case 'right':
        this._photoLocation.width = -(this._photoLocation.x - xy.x);
        break;
      case 'bottom':
        this._photoLocation.height = -(this._photoLocation.y - xy.y);
        break;
      case 'top-left':
        this._photoLocation.width = this._photoLocation.width + (this._photoLocation.x - xy.x);
        this._photoLocation.x = xy.x;
        this._photoLocation.height = this._photoLocation.height + (this._photoLocation.y - xy.y);
        this._photoLocation.y = xy.y;
        break;
      case 'top-right':
        this._photoLocation.width = -(this._photoLocation.x - xy.x);
        this._photoLocation.height = this._photoLocation.height + (this._photoLocation.y - xy.y);
        this._photoLocation.y = xy.y;
        break;
      case 'bottom-left':
        this._photoLocation.width = this._photoLocation.width + (this._photoLocation.x - xy.x);
        this._photoLocation.x = xy.x;
        this._photoLocation.height = -(this._photoLocation.y - xy.y);
        break;
      case 'bottom-right':
        this._photoLocation.width = -(this._photoLocation.x - xy.x);
        this._photoLocation.height = -(this._photoLocation.y - xy.y);
        break;
    }
    if (this._photoLocation.width < minWidth) {
      this._photoLocation.width = minWidth;
    }
    if (this._photoLocation.height < minHeight) {
      this._photoLocation.height = minHeight;
    }
    this.generatePhotoLocationPlaneSizes();
    this.generatePhotoLocationPoints();
    this._border.resize(this._photoLocationPoints, this._photoLocationPlaneSizes);
    this._sprites.forEach(sprite => {
      sprite.resize(this._photoLocationPlaneSizes);
    });
    this._buttons.forEach(button => {
      button.resize(this._photoLocationPlaneSizes);
    });
  }

  showButtons() {
    this._buttons.forEach(button => {
      button.show();
    });
  }

  hideButtons() {
    this._buttons.forEach(button => {
      button.hide();
    });
  }

  getPhotoLocation(): IRectangle {
    return this._photoLocation;
  }

  hideOptions() {
    this.hideButtons();
    this._border.hideResize();
  }

  showOptions() {
    if (this.resizing) {
      this.showButtons();
      this._border.showResize();
    }
  }

  public destroy() {
    this._border.destroy()
    delete this._border;
    this._sprites.forEach(sprite => {
      sprite.destroy();
    });
    this._sprites = [];
    this._buttons.forEach(button => {
      button.destroy();
    });
    this._buttons = [];
  }
}
