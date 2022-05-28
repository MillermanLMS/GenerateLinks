import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// import rubric from '../assets/WEB601As1.json';
import {
  Feedback,
  MarkingFeedbackItem,
  MarkingFeedback,
} from '../models/models';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { SnackService } from '../services/snack.service';

// TODO: make a json file with all the users username and github accounts, so I can make their feedback files easier and import them quickly

@Component({
  selector: 'app-marking-feedback',
  templateUrl: './marking-feedback.component.html',
  styleUrls: ['./marking-feedback.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0px' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class MarkingFeedbackComponent {
  githubLink$ = new BehaviorSubject<string>('');
  stackblitzLink$ = new BehaviorSubject<string>('#');
  tableValues$ = new BehaviorSubject<MarkingFeedback>({ markingFeedback: [] });
  overallScore$ = new BehaviorSubject<number>(0);
  outputTable$ = new BehaviorSubject<string>('');
  tableValuesJSON$ = new BehaviorSubject<[string, string]>(['', '']);
  localStorageList$ = new BehaviorSubject<[string, string][]>([['', '']]);
  expandedElement: any;
  fileName: string;
  triedBonus$ = new BehaviorSubject<boolean>(false);
  displayedColumns: any[] = [
    {
      matColumnDef: 'rubricDescription',
      header: 'Rubric description',
    },
    {
      matColumnDef: 'rubricScore',
      header: 'Max Score',
    },
    {
      matColumnDef: 'pointsAwarded',
      header: 'Points Awarded',
    },
  ];

  constructor(
    private sanitizer: DomSanitizer,
    private snack: SnackService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    let className = this.route.snapshot.params['classname'];
    let assignmentNumber = this.route.snapshot.params['assignment'];
    this.fileName = `${className}As${assignmentNumber}`;

    // this.populateLocalStorageDropdown();
    this.init();
  }
  init(filename?: string): void {
    console.log(filename);
    let markingFeedback = [];
    if (filename) {
      markingFeedback = JSON.parse(localStorage.getItem(filename) || '[]');
    }
    if (markingFeedback.length === 0) {
      markingFeedback = JSON.parse(localStorage.getItem(this.fileName) || '[]');
    }

    // TODO: change over to using ngx-indexed-db instead of localstorage for student feedbacks
    // https://github.com/assuncaocharles/ngx-indexed-db

    // didn't get it from local storage
    if (markingFeedback.length === 0) {
      let fileLocation = `assets/${this.fileName}.json`;
      this.http.get(fileLocation).subscribe((rubric) => {
        this.snack.open('Loaded from file: ' + fileLocation, 'Dismiss');
        markingFeedback = (
          (rubric as any)['markingFeedbackList'] as MarkingFeedbackItem[]
        ).map((mf, index) => {
          return { ...mf, pointsAwarded: mf.rubric.score, id: index };
        });
        this.initTable({
          markingFeedback: markingFeedback as MarkingFeedbackItem[],
        });
      });
      return;
    }
    this.snack.open('Local storage loaded: ' + this.fileName, 'Dismiss');
    this.initTable(markingFeedback);
  }

  initTable(markingFeedback: MarkingFeedback): void {
    this.tableValues$.next(markingFeedback);
    this.generateTableJSON();
    this.overallScore$.next(
      this.updateScore(markingFeedback as MarkingFeedback)
    );
    this.generateStudentFriendlyTable();
  }
  toggleBonus(eventData: boolean) {
    this.triedBonus$.next(eventData);
    this.overallScore$.next(this.updateScore());
    this.generateStudentFriendlyTable();
  }
  toggleCheated(eventData: boolean) {
    this.tableValues$.next({
      markingFeedback: this.tableValues$.value.markingFeedback,
      cheated: eventData,
    });
    this.overallScore$.next(this.updateScore());
    this.generateStudentFriendlyTable();
  }
  // bind so that clicking input highlights it
  // document.querySelectorAll(".highlight-on-click").forEach()
  inputGithub(value: string): void {
    this.githubLink$.next(value);
    this.generateTableJSON();
    this.generateStackblitzLink();
    this.saveGithubLinkToList();
    this.getUserLocalStorage();
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
    let mfl = [...this.tableValues$.value.markingFeedback];
    mfl[row.id].pointsAwarded = this.calculateRubricItemScore(
      mfl[row.id].rubric.score,
      mfl[row.id].feedbackList
    );
    this.overallScore$.next(
      this.updateScore({
        markingFeedback: mfl,
        cheated: this.tableValues$.value.cheated,
      })
    );
    this.tableValues$.next({
      markingFeedback: [...mfl],
      cheated: this.tableValues$.value.cheated,
    });
    this.generateStudentFriendlyTable();
  }

  updateScore(mfl?: MarkingFeedback): number {
    return this.tableValues$.value.cheated
      ? 0
      : (mfl?.markingFeedback || this.tableValues$.value.markingFeedback)
          .map((mf) =>
            !mf.bonus || (mf.bonus && this.triedBonus$.value)
              ? mf.pointsAwarded || 0
              : 0
          )
          .reduce((v, a) => v + a, 0);
  }

  calculateRubricItemScore(
    rubricScore: number,
    feedbackList: Feedback[]
  ): number {
    return Math.max(
      rubricScore -
        feedbackList
          .map((f) => {
            return f.applied ? f.deduction : 0;
          })
          .reduce((partialSum, a) => partialSum + a, 0),
      0
    );
  }

  addFeedback(row: any, feedback: string, deduction: string): void {
    let mfl = [...this.tableValues$.value.markingFeedback];
    mfl[row.id].feedbackList.push({
      feedback,
      deduction: Number(deduction || '0.5'),
    });
    this.tableValues$.next({
      markingFeedback: [...mfl],
      cheated: this.tableValues$.value.cheated,
    });
    this.generateStudentFriendlyTable();
  }

  removeFeedback(row: any, index: number): void {
    // event.stopPropogation();
    console.log('remove');
    let mfl = [...this.tableValues$.value.markingFeedback];
    mfl[row.id].feedbackList.splice(index, 1);
    mfl[row.id].pointsAwarded = this.calculateRubricItemScore(
      mfl[row.id].rubric.score,
      mfl[row.id].feedbackList
    );
    this.overallScore$.next(
      this.updateScore({
        markingFeedback: mfl,
        cheated: this.tableValues$.value.cheated,
      })
    );
    this.tableValues$.next({
      markingFeedback: [...mfl],
      cheated: this.tableValues$.value.cheated,
    });
    this.generateStudentFriendlyTable();
  }

  saveJSON(): void {
    localStorage.setItem(
      this.fileName,
      JSON.stringify(this.tableValues$.value)
    );
    console.log('Saved Marking Feedback: ', this.tableValues$.value);
    this.generateTableJSON();
    this.generateStudentFriendlyTable();
    this.snack.open('Local storage loaded: ' + this.fileName, 'Dismiss');
  }

  getUserLocalStorage(): void {
    let regex = /https:\/\/github.com\/(\w*)\/.+\/tree\/(.*)\/*.*/;
    let studentFeedbackString = this.githubLink$.value.match(regex);
    // console.log(this.githubLink$.value.match(regex));
    if (studentFeedbackString && studentFeedbackString.length > 2) {
      this.init(
        `${this.fileName}_${studentFeedbackString[1]}_${studentFeedbackString[2]}`
      );
    }
  }
  saveUserLocalStorage(): void {
    let regex = /https:\/\/github.com\/(\w*)\/.+\/tree\/(.*)\/*.*/;
    let studentFeedbackString = this.githubLink$.value.match(regex);
    // console.log(this.githubLink$.value.match(regex));
    if (studentFeedbackString && studentFeedbackString.length > 2) {
      localStorage.setItem(
        `${this.fileName}_${studentFeedbackString[1]}_${studentFeedbackString[2]}`,
        JSON.stringify(this.tableValues$.value)
      );
      this.snack.open(
        `${this.fileName}_${studentFeedbackString[1]}_${studentFeedbackString[2]} saved`,
        'Dismiss'
      );
    }
  }
  saveGithubLinkToList(): void {
    let regex = /(https:\/\/github\.com\/[\w\d]*\/[\w\d]*)/;
    let match = this.githubLink$.value.match(regex);
    let studentRepos = JSON.parse(
      localStorage.getItem(this.fileName + '_repos') || '[]'
    ) as Array<string>;
    if (match && !studentRepos.some((sr) => sr === (match && match[0]) || '')) {
      studentRepos.push(match[0]);
      localStorage.setItem(
        this.fileName + '_repos',
        JSON.stringify(studentRepos)
      );
    }
  }

  generateTableJSON(): void {
    let returnValue = '';
    if (this.githubLink$.value) {
      let regex = /https:\/\/github.com\/(\w*)\/.+\/tree\/(.*)\/*.*/;
      let studentFeedbackString = this.githubLink$.value.match(
        regex
      ) as RegExpMatchArray;
      returnValue = `${studentFeedbackString[1]}_${studentFeedbackString[2]}`;
    }
    this.tableValuesJSON$.next([
      // first value is the normal json file
      this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:application/json;charset=UTF-8,' +
          encodeURIComponent(JSON.stringify(this.tableValues$.value))
      ) as string,
      // second value is the student specific one
      this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:application/json;charset=UTF-8,' +
          encodeURIComponent(
            JSON.stringify({ [returnValue]: this.tableValues$.value })
          )
      ) as string,
    ]);
  }

  generateStudentFriendlyTable(): void {
    const tableheader = `<tr><th>Rubric Criteria</th><th>Score</th></tr>`;
    let tablerows = '';
    let tablerowsdeductions = '';
    let cheaterHeader = '';
    this.tableValues$.value.markingFeedback.forEach((mf) => {
      // console.log("feedback item", mf);
      if (mf.bonus && !this.triedBonus$.value) {
        // if bonus feedback but they didn't try bonus, skip this one
        return;
      }
      tablerows += `<tr><td><strong>${mf.rubric.description}</strong></td><td><strong>${mf.pointsAwarded}</strong></td></tr>`;
      mf.feedbackList.forEach((f) => {
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
      tablerowsdeductions = '';
    });
    if (this.tableValues$.value.cheated) {
      cheaterHeader = `<h2>Please come see me in the lab</h2>`;
    }
    this.outputTable$.next(
      `${cheaterHeader}<table><thead>${tableheader}</thead><tbody>${tablerows}</tbody></table>`
    );
    // TODO: generate table based on this.tableValues
    // save it to localstorage too with their username
    // save the individual users tablevaluesjson in localstorage/json too, so I can easily update it if needed
  }
  copyTable(): void {
    const blob = new Blob([this.outputTable$.value as string], {
      type: 'text/html',
    });
    const richTextInput = new ClipboardItem({ 'text/html': blob });
    navigator.clipboard.write([richTextInput]).then(() => {
      this.saveUserLocalStorage();
      this.snack.open('Copied to clipboard', 'Dismiss');
    });
  }

  populateLocalStorageDropdown(): void {
    this.localStorageList$.next(Object.entries(localStorage));
  }
}
