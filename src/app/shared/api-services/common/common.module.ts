import { NgModule, ModuleWithProviders } from '@angular/core';


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
export class CommonApiModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CommonApiModule,
      providers: [
      ]
    };
  }
}
