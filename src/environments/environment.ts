// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiVersion: 1,
  UIDebug: true,
  apiV1HostName: 'http://api.localhost',
  apiV2HostName: 'http://api.localhost',
  idUrl: 'http://preview.ideditor.com/release/',
  baseUrl: 'http://api.localhost',

  mapLayers: {
    baseMapTilesUrl: '',
    baseMapTilesType: '',
    baseMapTilesToken: '',
    coverageMapTilesEnabled: false,
    coverageMapTilesUrl: 'http://api.localhost/2.0/sequence/tiles/{z}/{x}/{y}.png',
    coverageMapTilesType: 'png',
  },

  apollo: {
    signDetectionsEnabled: false,
    signDetectionsNewDetection: true,
    signDetectionsNewSignType: true,
    apiVersion: 2,
    apiV2HostName: 'http://apollo.localhost',

    apiRegions: [],
    apiDefaultRegion: 'US',
  },
  maintenance: {
    enabled: false,
    message: 'Maintenance window!',
    level: 'error'
  },
  defaults: {
    homeLat: 0,
    homeLng: 0,
    homeZoom: 0
  },
  features: {
    showPanorama360Button: false,
    nearbyPhotosV2: false,

    segmentationToolEnabled: false,
    segmentationToolHostName: 'http://apollo.localhost/edit/',

    showHomeMapFilters: false,
    homeMapFilters: {
      loggedUser: false,
      startDate: false,
      endDate: false,
      sequenceType: false,
      platform: false,
      fieldOfView: false
    }
  },

  oauth: {
    authEndPoint: 'http://api.localhost/auth/:provider/client_auth',
    failedEndPoint: '',
    logoutEndPoint: '',
    successEndPoint: '',
    authProviders: {
      oauth1: {
        openstreetmap: {
          clientId: 'OSM-client-ID',
          secretKey: 'OSM-secret-KEY',
          redirectUri: 'http://api.localhost/auth/openstreetmap',
        },
        twitter: {
          clientId: 'TWITTER-client-ID',
          secretKey: 'TWITTER-secret-KEY',
          redirectUri: 'http://api.localhost/auth/twitter',
        }
      },
      oauth2: {
        google: {
          clientId: 'GOOGLE-client-ID'
        },
        facebook: {
          clientId: 'FACEBOOK-client-ID',
          apiVersion: 'v2.4'
        }
      }
    }
  }
};
