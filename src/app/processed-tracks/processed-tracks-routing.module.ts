import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProcessedTracksComponent } from './processed-tracks.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'processed-tracks', component: ProcessedTracksComponent, data: { topBarVisible: true, pageTheme: 'dark-custom' } }
    ])
  ],
  exports: [RouterModule]
})
export class ProcessedTracksRoutingModule { }
