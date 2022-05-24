import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import rubric from '../assets/rubricSample.json';
import { Feedback, MarkingFeedback } from './models';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Clipboard } from '@angular/cdk/clipboard';

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
  outputTable$ = new BehaviorSubject<string>("");
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

  constructor(private sanitizer: DomSanitizer, private clipboard: Clipboard) {
    console.log(rubric);
    let markingFeedback = JSON.parse(localStorage.getItem("model") || "[]");
    if (markingFeedback.length == 0) { // didn't get it from local storage
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
      .map(mf => mf.pointsAwarded || 0).reduce((v, a) => v + a, 0));
    this.generateStudentFriendlyTable();

  }

  // bind so that clicking input highlights it
  // document.querySelectorAll(".highlight-on-click").forEach()
  inputGithub(value: string): void {
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

  toggleDeduction(row: any): void {
    let mfl = [...this.tableValues$.value];
    mfl[row.id].pointsAwarded = this.calculateRubricItemScore(mfl[row.id].rubric.score, mfl[row.id].feedbackList);
    this.overallScore$.next(mfl.map(mf => mf.pointsAwarded || 0).reduce((v, a) => v + a, 0));
    this.tableValues$.next(
      [...mfl]
    );
    this.generateStudentFriendlyTable();

  }

  calculateRubricItemScore(rubricScore: number, feedbackList: Feedback[]): number {
    return Math.max(rubricScore - feedbackList.map(f => {
      return f.applied ? f.deduction : 0
    }).reduce((partialSum, a) => partialSum + a, 0), 0);
  }

  addFeedback(row: any, feedback: string, deduction: string): void {
    let mfl = [...this.tableValues$.value];
    mfl[row.id].feedbackList.push({
      feedback, deduction: (Number(deduction || "0.5"))
    });
    this.tableValues$.next(
      [...mfl]
    );
    this.generateStudentFriendlyTable();
  }

  removeFeedback(row: any, index: number): void {
    // event.stopPropogation();
    console.log("remove");
    let mfl = [...this.tableValues$.value];
    mfl[row.id].feedbackList.splice(index, 1);
    mfl[row.id].pointsAwarded = this.calculateRubricItemScore(mfl[row.id].rubric.score, mfl[row.id].feedbackList);
    this.overallScore$.next(mfl.map(mf => mf.pointsAwarded || 0).reduce((v, a) => v + a, 0));
    this.tableValues$.next(
      [...mfl]
    );
    this.generateStudentFriendlyTable();
  }

  saveJSON(): void {
    localStorage.setItem("model", JSON.stringify(this.tableValues$.value));
    console.log("Saved Marking Feedback: ", this.tableValues$.value);
    this.generateTableJSON();
    this.generateStudentFriendlyTable();
    // TODO: add snackbar message
  }

  generateTableJSON(): void {
    this.tableValuesJSON = this.sanitizer.bypassSecurityTrustResourceUrl("data:application/json;charset=UTF-8," + encodeURIComponent(JSON.stringify(this.tableValues$.value)));
  }

  generateStudentFriendlyTable(): void {
    const tableheader = `<tr><th>Rubric Criteria</th><th>Score</th></tr>`;
    let tablerows = '';
    let tablerowsdeductions = '';
    this.tableValues$.value.forEach(mf => {
      // console.log("feedback item", mf);
      tablerows += `<tr><td><strong>${mf.rubric.description}</strong></td><td><strong>${mf.pointsAwarded}</strong></td></tr>`;
      mf.feedbackList.forEach(f => {
        // console.log("looking at feedback list", f);
        if (f.applied) {
          // console.log("feedback list applied", f);
          // if (tablerowsdeductions === '') {
          //   tablerowsdeductions = `<tr><td colspan="2">Deductions: </td></tr>`;
          // }
          tablerowsdeductions += `<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;${f.feedback}</td><td>-${f.deduction}</td></tr>`;
        }
      });
      tablerows += tablerowsdeductions;
      tablerowsdeductions = "";
    });
    this.outputTable$.next(`<table><thead>${tableheader}</thead><tbody>${tablerows}</tbody></table>`);
    // TODO: generate table based on this.tableValues
    // save it to localstorage too with their username
    // save the individual users tablevaluesjson in localstorage/json too, so I can easily update it if needed
  }
  copyTable(): void {
    this.clipboard.copy(this.outputTable$.value as string);
  }
}
