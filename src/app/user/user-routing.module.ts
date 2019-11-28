import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserComponent } from './user.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'user/:username', component: UserComponent, data: { pageTheme: 'dark', topBarVisible: false } }
    ])
  ],
  exports: [RouterModule]
})
export class UserRoutingModule { }
