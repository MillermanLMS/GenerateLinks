import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { IMarkingFeedback, MarkingFeedback } from '../models/MarkingFeedback';
import { createLocalStorageMarkingFeedback } from '../shared/utility';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  localStorageList$ = new BehaviorSubject<string[]>([]);
  assessmentForm = this.fbs.group({
    className: ['', Validators.required],
    assessmentNumber: ['', Validators.required],
    jsonCode: ['', Validators.required],
  });

  constructor(private router: Router, private fbs: NonNullableFormBuilder) {
    this.populateLocalStorageDropdown();
  }

  populateLocalStorageDropdown(): void {
    const rubricsNameList = Object.keys(localStorage)
      .map((storageKeys) => storageKeys.split('_')[0])
      .filter((currentKey, index, arrayOfStorageKeys) => {
        return arrayOfStorageKeys.indexOf(currentKey) === index;
      })
      .sort();
    console.log(rubricsNameList);
    this.localStorageList$.next(
      rubricsNameList
      // TODO: come back to this so we can just hotload things here rather than routing
      // Object.entries(localStorage).filter(([key, value]) => {
      //   return rubricsNameList.some((name) => {
      //     // console.assert(name !== key, name, key);
      //     return name == key;
      //   });
      // }).map(([k, v]) => { return {k:, v}})
    );
    // console.log(this.localStorageList$.value);
  }

  changeMarkingPage(eventData: MatSelectChange): void {
    const routeValue = eventData.value;
    let route: string[] = [];
    console.log('eventData', eventData);
    route = routeValue.split(/(As\d|Test\d)/g).slice(0, 2);
    // TODO: make this not hardcoded anymore
    switch (route[0]) {
      case 'WEB301':
      case 'WEB303':
        route.push('codesandbox');
        break;
      case 'WEB315':
        route.push('vscode');
        break;
      case 'WEB601':
        route.push('stackblitz');
    }
    route.push('true');
    console.log(route);
    this.router.navigate(route);
  }

  onSubmit(): void {
    // if (
    //   isIMarkingFeedback(
    //     (this.assessmentForm.controls['jsonCode'] as Object) as IMarkingFeedback
    //   )
    // ) {
    createLocalStorageMarkingFeedback(
      this.assessmentForm.controls['className'].value,
      this.assessmentForm.controls['assessmentNumber'].value,
      new MarkingFeedback(this.assessmentForm.controls['jsonCode'].value)
    );
    // }
  }
}
