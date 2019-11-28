import { AuthProviderOAuth2Abstract } from './authProviderOAuth2.abstract';


export class GoogleProvider extends AuthProviderOAuth2Abstract {
  protected _name = 'google';
  protected _apolloName = 'google';
}
