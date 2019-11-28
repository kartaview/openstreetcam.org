import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SequenceComponent } from './sequence.component';
import { SignViewComponent } from './sign-view.component';


@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'details/:id', component: SequenceComponent, pathMatch: 'full', data: { topBarVisible: false, pageTheme: 'dark' } },
      { path: 'details/:id/:imageId', component: SequenceComponent, pathMatch: 'full', data: { topBarVisible: false, pageTheme: 'dark' } },
      {
        path: 'details/:id/:imageId/:tabId', component: SequenceComponent, pathMatch: 'full', data: {
          topBarVisible: false, pageTheme: 'dark'
        }
      },
      { path: 'sign-view', component: SignViewComponent, pathMatch: 'full', data: { topBarVisible: false, pageTheme: 'dark' } },
      {
        path: 'sign-view/:id/:imageId', component: SignViewComponent, pathMatch: 'full',
        data: { topBarVisible: false, pageTheme: 'dark' }
      },
    ])
  ],
  exports: [RouterModule]
})
export class SequenceRoutingModule { }
