import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NotFoundComponent } from './shared/not-found/not-found.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '', redirectTo: '/map/', pathMatch: 'full' },
      { path: '404', component: NotFoundComponent },
      { path: '**', component: NotFoundComponent }
      /* define app module routes here, e.g., to lazily load a module
         (do not place feature module routes here, use an own -routing.module.ts in the feature instead)
       */
    ], {initialNavigation: true})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

