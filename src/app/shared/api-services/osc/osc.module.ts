import { NgModule, ModuleWithProviders } from '@angular/core';

import {
  sequenceServiceProvider, userServiceProvider, photoServiceProvider,
  listenerServiceProvider, sequenceAttachmentServiceProvider
} from './';


/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({
  imports: [
  ],
  declarations: [
  ],
  exports: [
  ],
  entryComponents: [
  ]
})
export class OSCApiModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: OSCApiModule,
      providers: [
        sequenceServiceProvider, userServiceProvider, photoServiceProvider,
        listenerServiceProvider, sequenceAttachmentServiceProvider
      ]
    };
  }
}
