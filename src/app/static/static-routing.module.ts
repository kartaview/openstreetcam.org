import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TermsComponent } from './terms.component';
import { PrivacyPolicyComponent } from './privacy-policy.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'terms', component: TermsComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent }
    ])
  ],
  exports: [RouterModule]
})
export class StaticRoutingModule { }
