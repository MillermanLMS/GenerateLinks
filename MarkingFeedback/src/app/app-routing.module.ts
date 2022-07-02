import { FullscreenOverlayContainer } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarkingFeedbackComponent } from './marking-feedback/marking-feedback.component';
import { MarkingSelectionComponent } from './marking-selection/marking-selection.component';

const routes: Routes = [
  // TODO: generate routes based on json that contains list of classes and assignment numbers.
  // Give option to select class and assignment on home page
  // {
  //   path: '',
  //   component: MarkingSelectionComponent,
  //   pathMatch: 'full',
  // },
  // {
  //   path: '',
  //   redirectTo: '/WEB601/1',
  //   pathMatch: 'full',
  // },
  {
    path: '',
    redirectTo: '/WEB315/1',
    pathMatch: 'full',
  },
  {
    path: ':classname/:assignment', // c = class, a = assignment
    component: MarkingFeedbackComponent,
  },
  {
    path: ':classname/:assignment/:editor', // c = class, a = assignment
    component: MarkingFeedbackComponent,
  },
  {
    path: ':classname/:assignment/:editor/:expanded', // c = class, a = assignment
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
