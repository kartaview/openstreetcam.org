import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'map/', component: HomeComponent, pathMatch: 'full' },
      {
        path: 'map', pathMatch: 'prefix', children: [
          { path: '**', component: HomeComponent },
        ]
      },
    ])
  ],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
