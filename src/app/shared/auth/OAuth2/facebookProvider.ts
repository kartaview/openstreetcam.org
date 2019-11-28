import { AuthProviderOAuth2Abstract } from './authProviderOAuth2.abstract';


export class FacebookProvider extends AuthProviderOAuth2Abstract {
  protected _name = 'facebook';
  protected _apolloName = 'facebook';
}
