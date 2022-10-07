import { FullscreenOverlayContainer } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MarkingFeedbackComponent } from './marking-feedback/marking-feedback.component';
import { MarkingSelectionComponent } from './marking-selection/marking-selection.component';

const routes: Routes = [
  // TODO: generate routes based on json that contains list of classes and evaluation numbers.
  // Give option to select class and evaluation on home page
  {
    path: '',
    component: HomeComponent,
  },
  {
    // ex: WEB601/As1
    path: ':classname/:evaluation', // c = class, a = evaluation
    component: MarkingFeedbackComponent,
  },
  {
    // ex: WEB601/As1/stackblitz
    path: ':classname/:evaluation/:editor',
    component: MarkingFeedbackComponent,
  },
  {
    // ex: WEB601/As1/stackblitz/true
    path: ':classname/:evaluation/:editor/:expanded',
    component: MarkingFeedbackComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
