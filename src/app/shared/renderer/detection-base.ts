import { BehaviorSubject } from 'rxjs/Rx';

export interface IUIGLImageCache {
  id: number;
  image: object;
  projection: string;
  fieldOfView: number;
  isUnwrapped: number;
  width: number;
  height: number;
  loaded: boolean;
  loading: boolean;
  error: boolean;
  loadCallback: Function;
  observer: BehaviorSubject<IUIGLImageCache>;
}

export class UIGLImageCache implements IUIGLImageCache {
  id;
  image;
  projection;
  fieldOfView;
  isUnwrapped;
  width = 0;
  height = 0;
  loaded = false;
  loading = false;
  error = false;
  loadCallback = null;
  observer = new BehaviorSubject(null)
  constructor(id, image = null, projection = 'PLANE', fieldOfView = null, isUnwrapped = false) {
    this.id = id;
    this.image = image;
    this.projection = projection;
    this.fieldOfView = fieldOfView;
    this.isUnwrapped = isUnwrapped;
  }
}

export interface IUISelectionButton {
  image: IUIGLImageCache;
  callback: Function;
}

export interface IUISelectionSprite {
  image: IUIGLImageCache;
  position: string[];
}

export interface IUISelectionTemplate {
  lineColor: string;
  lineWidth: number;
  backgroundColor: string;
}

export class UISelectionTemplate implements IUISelectionTemplate {
  lineColor;
  lineWidth;
  backgroundColor;
  constructor(lineColor = '#00FF00', lineWidth = 1, backgroundColor = '#00FF00') {
    this.lineColor = lineColor;
    this.lineWidth = lineWidth;
    this.backgroundColor = backgroundColor;
  }
}

