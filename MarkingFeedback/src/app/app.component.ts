import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import rubric from '../assets/rubricSample.json';
import { Feedback, MarkingFeedback } from './models';
import { DomSanitizer } from '@angular/platform-browser';
// TODO: make a json file with all the users username and github accounts, so I can make their feedback files easier and import them quickly

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0px' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])],
})
export class AppComponent {
  githubLink$ = new BehaviorSubject<string>('');
  stackblitzLink$ = new BehaviorSubject<string>('#');
  tableValues$: BehaviorSubject<MarkingFeedback[]>;
  overallScore$: BehaviorSubject<number>;
  tableValuesJSON: any;
  expandedElement: any;
  displayedColumns: any[] = [{
    matColumnDef: 'rubricDescription',
    header: 'Rubric description'
  }, {
    matColumnDef: 'rubricScore',
    header: 'Max Score'
  }, {
    matColumnDef: 'pointsAwarded',
    header: 'Points Awarded'
  }];

  constructor(private sanitizer: DomSanitizer) {
    console.log(rubric);
    let markingFeedback = JSON.parse(localStorage.getItem("model") || "{}");
    if (markingFeedback.length == 0) {
      markingFeedback = (rubric.markingFeedbackList as MarkingFeedback[]).map((mf, index) => {
        return { ...mf, pointsAwarded: mf.rubric.score, id: index };
      });

    }
    else {
      console.log("Local storage loaded: ", markingFeedback);
    }
    this.tableValues$ = new BehaviorSubject<MarkingFeedback[]>(markingFeedback);
    this.generateTableJSON();
    this.overallScore$ = new BehaviorSubject<number>((markingFeedback as MarkingFeedback[])
      .map(mf => mf.rubric.score).reduce((v, a) => v + a, 0));
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

  toggleDeduction(row: any, feedback: Feedback): void {
    let mfl = [...this.tableValues$.value];
    mfl[row.id].pointsAwarded = this.calculateRubricItemScore(mfl[row.id].rubric.score, mfl[row.id].feedbackList);
    this.overallScore$.next(mfl.map(mf => mf.pointsAwarded || 0).reduce((v, a) => v + a, 0));
    this.tableValues$.next(
      [...mfl]
    );

  }

  calculateRubricItemScore(rubricScore: number, feedbackList: Feedback[]): number {
    return Math.max(rubricScore - feedbackList.map(f => {
      return f.applied ? f.deduction : 0
    }).reduce((partialSum, a) => partialSum + a, 0), 0);
  }

  addFeedback(row: any, feedback: string, deduction: string) {
    let mfl = [...this.tableValues$.value];
    mfl[row.id].feedbackList.push({
      feedback, deduction: (Number(deduction || "0.5"))
    });
    this.tableValues$.next(
      [...mfl]
    );
    this.saveJSON();
  }

  removeFeedback(row: any, index: number) {
    let mfl = [...this.tableValues$.value];
    mfl[row.id].feedbackList.splice(index, 1);
    mfl[row.id].pointsAwarded = this.calculateRubricItemScore(mfl[row.id].rubric.score, mfl[row.id].feedbackList);
    this.tableValues$.next(
      [...mfl]
    );
    this.saveJSON();
  }

  saveJSON(): void {
    localStorage.setItem("model", JSON.stringify(this.tableValues$.value));
    console.log("Saved Marking Feedback: ", this.tableValues$.value);
    this.generateTableJSON();
  }

  generateTableJSON() {
    this.tableValuesJSON = this.sanitizer.bypassSecurityTrustResourceUrl("data:application/json;charset=UTF-8," + encodeURIComponent(JSON.stringify(this.tableValues$.value)));
  }

  generateStudentFriendlyTable() {
    // TODO: generate table based on this.tableValues
    // save it to localstorage too with their username
    // save the individual users tablevaluesjson in localstorage/json too, so I can easily update it if needed
  }
}
