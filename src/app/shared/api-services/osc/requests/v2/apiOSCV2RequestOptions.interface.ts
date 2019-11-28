export enum EApiOSCV2Platform {
  IOS = 'ios',
  ANDROID = 'android',
  WAYLENS = 'waylens',
  GOPRO = 'gopro',
  OTHER = 'other'
}

export enum EApiOSCV2UserType {
  REGULAR = 'regular',
  DRIVER = 'driver',
  BYOD = 'byod',
  DEDICATED = 'dedicated',
  INTERNAL = 'internal'
}

export enum EApiOSCV2MetricsFieldOfView {
  PLANE = 'plane',
  SPHERE180 = '180',
  SPHERE360 = '360',
  DUAL_FISHEYE = 'dual_fisheye'
}

export interface IApiOSCV2RequestOptions {
  page?: number;
  itemsPerPage?: number;
  orderBy?: string;
  orderDirection?: string;

  units?: string;
}
