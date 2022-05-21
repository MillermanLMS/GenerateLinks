import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import rubric from '../assets/rubricSample.json';
import { Feedback, MarkingFeedback, Rubric } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  githubLink$ = new BehaviorSubject<string>('');
  stackblitzLink$ = new BehaviorSubject<string>('#');
  tableValues: MarkingFeedback[];
  displayedColumns: string[] = ['rubricDescription', 'rubricScore'];

  constructor() {
    console.log(rubric);
    this.tableValues = (rubric.rubric as Rubric[]).map((rub) => {
      return { rubric: rub, feedback: [] } as MarkingFeedback;
    });
    console.log(this.tableValues);
    // this.tableValues = (rubric as Rubric[]).map(r => {...r, feedback: []});
  }
  // bind so that clicking input highlights it
  // document.querySelectorAll(".highlight-on-click").forEach()
  inputGithub(value: string) {
    this.githubLink$.next(value);
    this.generateStackblitzLink();
  }
  generateStackblitzLink(): void {
    let usefulContent = this.githubLink$.value.replace(
      /(https:\/\/)?(github.com)/g,
      ''
    );
    // TODO: use octokit to make sure this link has the package.json in it
    this.stackblitzLink$.next('https://stackblitz.com/github' + usefulContent);
  }

  addFeedback(index: number, feedback: Feedback) {
    this.tableValues[index].feedback.push(feedback);
  }
  generateTable() {
    // TODO: generate table based on this.tableValues
  }
}
