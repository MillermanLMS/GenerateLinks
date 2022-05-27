import { FullscreenOverlayContainer } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarkingFeedbackComponent } from './marking-feedback/marking-feedback.component';

const routes: Routes = [
  {
    path: ':classname/:assignment', // c = class, a = assignment
    component: MarkingFeedbackComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
