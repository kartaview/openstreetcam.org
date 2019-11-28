import { AuthProviderOAuth1Abstract } from './authProviderOAuth1.abstract';

export class OpenstreetmapProvider extends AuthProviderOAuth1Abstract {
  protected _name = 'openstreetmap';
  protected _apolloName = 'osm';
  TOKEN_PARAM = 'https://www.openstreetmap.orgoauth_token';
  SECRET_PARAM = 'https://www.openstreetmap.orgoauth_token_secret';
  REQUEST_SECRET_PARAM = 'https://www.openstreetmap.orgoauth_request_token_secret';
}
