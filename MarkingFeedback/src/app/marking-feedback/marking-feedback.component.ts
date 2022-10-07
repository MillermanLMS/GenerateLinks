import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { SnackService } from '../services/snack.service';
import { EditorName } from '../models/enums/EditorName';
import { ScoringTypeValue } from '../models/enums/ScoringTypeValue';
import { IMarkingFeedback } from '../models/MarkingFeedback';
import { IMarkingFeedbackItem } from '../models/MarkingFeedbackItem';
import { ScoringOperation } from '../models/Scoring/ScoringOperation';
import { ITeacherNote } from '../models/TeacherNote';
import { init, saveCleanMarkingFeedbackToLocalStorage } from '../shared/utility';

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
  alwaysExpanded$ = new BehaviorSubject<boolean>(false);
  get alwaysExpanded(): boolean {
    return this.alwaysExpanded$.value;
  }
  set alwaysExpanded(v: boolean) {
    this.alwaysExpanded$.next(v);
  }

  githubLink$ = new BehaviorSubject<string>('');
  /**
   * Examples are based on evaluating against the following url:
   * https://github.com/amillerman01/TestRepo/tree/main/test/index.html
   * 0: The user's username (ex. amillerman01)
   * 1: The repository name (ex. TestRepo)
   * 2: tree
   * 3: The name of the branch (ex. test)
   * 4 onward is the file/folder inside of that branch
   */
  githubLinkArray: string[] = [];
  editorLink$ = new BehaviorSubject<string>('#');
  editorName$ = new BehaviorSubject<string>('');
  tableValues$ = new BehaviorSubject<IMarkingFeedback>({ markingFeedback: [] });
  overallScore$ = new BehaviorSubject<number>(0);
  outputTable$ = new BehaviorSubject<string>('');
  tableValuesJSON$ = new BehaviorSubject<[SafeResourceUrl, SafeResourceUrl]>([
    '',
    '',
  ]);
  // localStorageList$ = new BehaviorSubject<string[]>([]);
  expandedElement: any;
  classRubricFileName: string = '';
  // triedBonus$ = new BehaviorSubject<boolean>(false);
  toggleOutputTableDisplay$ = new BehaviorSubject<boolean>(false);
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

  validGithubLink = /((?:https:\/\/)?github.com\/?)/gi;

  /**
   * regex for selecting github link values
   * Examples are based on evaluating against the following url:
   * https://github.com/amillerman01/TestRepo/tree/main/test/index.html
   * 1: User's github repository URL (ex. https://github.com/amillerman01)
   * 2: The user's username (ex. amillerman01)
   * 3: The repository name (ex. TestRepo)
   * 4: The name of the branch (ex. test)
   */
  // githubBranchSelector = /(https:\/\/github.com\/([a-z\d](?:[a-z\d]|-(?=[a-z\d]))+))(?:\/([a-z\d](?:[a-z\d]|[-_](?=[a-z\d]))+)(?:\/tree\/)*([a-z\d](?:[a-z\d]|[-_](?=[a-z\d]))+)\/*.*)*/i;

  constructor(
    private sanitizer: DomSanitizer,
    private snack: SnackService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    let evaluationName: string;
    let className: string;
    this.route.params.subscribe((params) => {
      className = params['classname'];
      evaluationName = params['evaluation'];
      this.editorName$.next(
        EditorName[(params['editor'] ?? 'stackblitz') as keyof typeof EditorName]
      );
      this.alwaysExpanded$.next(!!this.route.snapshot.params['expanded']);
      this.classRubricFileName = `${className}${evaluationName}`;

      // this.populateLocalStorageDropdown();
      let markingFeedback = init(this.classRubricFileName);
      this.snack.open(
        'Local storage loaded: ' + this.classRubricFileName,
        'Dismiss'
      );
      this.initTable(markingFeedback);
    });
  }


  initTable(markingFeedback: IMarkingFeedback): void {
    this.tableValues$.next(markingFeedback);
    this.generateTableJSON();
    this.overallScore$.next(
      this.updateScore(markingFeedback as IMarkingFeedback)
    );
    this.generateStudentFriendlyTable();
  }
  toggleBonus(eventData: boolean) {
    this.tableValues$.next({
      ...this.tableValues$.value,
      triedBonus: eventData,
    });
    this.overallScore$.next(this.updateScore());
    this.generateStudentFriendlyTable();
  }
  toggleCheated(eventData: boolean) {
    this.tableValues$.next({
      ...this.tableValues$.value,
      cheated: eventData,
    });
    this.overallScore$.next(this.updateScore());
    this.generateStudentFriendlyTable();
  }

  // bind so that clicking input highlights it
  // document.querySelectorAll(".highlight-on-click").forEach()
  inputGithub(value: string): void {
    if (!value.trim().match(this.validGithubLink)) {
      return;
    }
    this.githubLink$.next(value.trim());
    value = value.replace(this.validGithubLink, '');
    this.githubLinkArray = value.split('/').filter((v) => v.trim().length);

    this.generateTableJSON();
    this.generateOnlineEditorLink();
    this.saveGithubLinkToList();
    this.getUserLocalStorage();
  }

  generateOnlineEditorLink(): void {
    // TODO: use octokit to make sure this link has the package.json in it
    const usefulContent = this.githubLinkArray.join('/');
    switch (this.editorName$.value) {
      case EditorName.stackblitz: {
        this.editorLink$.next('https://stackblitz.com/github/' + usefulContent);
        break;
      }
      case EditorName.vscode: {
        this.editorLink$.next('https://vscode.dev/github/' + usefulContent);
        break;
      }
      case EditorName.codesandbox: {
        this.editorLink$.next('https://githubbox.com/' + usefulContent);
        break;
      }
    }
  }

  toggleValueWorth(row: any): void {
    let mfl = [...this.tableValues$.value.markingFeedback];
    mfl[row.id].pointsAwarded = this.calculateRubricItemScore(mfl[row.id]);
    this.overallScore$.next(
      this.updateScore({
        markingFeedback: mfl,
        cheated: this.tableValues$.value.cheated,
      })
    );
    this.tableValues$.next({
      ...this.tableValues$.value,
      markingFeedback: [...mfl],
    });
    this.generateStudentFriendlyTable();
  }

  updateScore(mfl?: IMarkingFeedback): number {
    return this.tableValues$.value.cheated
      ? 0
      : (mfl?.markingFeedback || this.tableValues$.value.markingFeedback)
          .map((mf) =>
            !mf.bonus || (mf.bonus && this.tableValues$.value.triedBonus)
              ? mf.pointsAwarded || 0
              : 0
          )
          .reduce((v, a) => v + a, 0);
  }

  calculateRubricItemScore(markingFeedbackItem: IMarkingFeedbackItem): number {
    return markingFeedbackItem.scoring.operate(
      markingFeedbackItem.feedbackList
        .map((f) => {
          return f.applied ? f.deduction : 0;
        })
        .reduce((partialSum, a) => partialSum + a, 0),
      markingFeedbackItem.rubric.score
    );
  }

  addFeedback(row: any, feedback: string, deduction: string): void {
    let mfl = [...this.tableValues$.value.markingFeedback];
    mfl[row.id].feedbackList.push({
      feedback,
      deduction: Number(deduction || '0.5'),
    });
    this.tableValues$.next({
      ...this.tableValues$.value,
      markingFeedback: [...mfl],
    });
    saveCleanMarkingFeedbackToLocalStorage(this.classRubricFileName, this.tableValues$.value);
    this.generateStudentFriendlyTable();
  }

  removeFeedback(row: any, index: number): void {
    // event.stopPropogation();
    console.log('remove');
    let mfl = [...this.tableValues$.value.markingFeedback];
    mfl[row.id].feedbackList.splice(index, 1);
    mfl[row.id].pointsAwarded = this.calculateRubricItemScore(mfl[row.id]);
    this.overallScore$.next(
      this.updateScore({
        markingFeedback: mfl,
        cheated: this.tableValues$.value.cheated,
      })
    );
    this.tableValues$.next({
      ...this.tableValues$.value,
      markingFeedback: [...mfl],
    });
    saveCleanMarkingFeedbackToLocalStorage(this.classRubricFileName, this.tableValues$.value);
    this.generateStudentFriendlyTable();
  }

  saveJSON(): void {
    saveCleanMarkingFeedbackToLocalStorage(this.classRubricFileName, this.tableValues$.value);
    console.log('Saved Marking Feedback: ', this.tableValues$.value);
    this.generateTableJSON();
    this.generateStudentFriendlyTable();
    this.snack.open(
      'Local storage saved: ' + this.classRubricFileName,
      'Dismiss'
    );
  }



  getUserLocalStorage(): void {
    if (this.githubLinkArray.length) {
      init(this.classRubricFileName,
        `${this.classRubricFileName}_${this.githubLinkArray[0]}_${
          this.githubLinkArray[3] || 'main'
        }`
      );
    }
  }
  saveUserLocalStorage(): void {
    const now = Date.now(); // save one anyway in case I need a reference
    let storageName = `${this.classRubricFileName}_Time-${now}_Score-${this.overallScore$.value}`;
    if (this.githubLinkArray.length) {
      storageName = `${this.classRubricFileName}_${this.githubLinkArray[0]}_${
        this.githubLinkArray[3] || 'main'
      }`;
    }

    localStorage.setItem(storageName, this.tableWithoutEmptyFeedbacks());
    this.snack.open(storageName + 'saved', 'Dismiss');
  }

  tableWithoutEmptyFeedbacks(): string {
    let simplifiedTable: IMarkingFeedback = JSON.parse(
      JSON.stringify(this.tableValues$.value)
    );
    simplifiedTable.markingFeedback.forEach((mf) => {
      mf.feedbackList = mf.feedbackList.filter((f) => f.applied);
    });
    return JSON.stringify(simplifiedTable);
  }
  saveGithubLinkToList(): void {
    let studentRepos = JSON.parse(
      localStorage.getItem(this.classRubricFileName + '_repos') || '[]'
    ) as Array<string>;
    if (this.githubLinkArray) {
      const usefulContent = this.githubLink$.value;
      if (!studentRepos.some((sr) => sr === usefulContent)) {
        studentRepos.push(usefulContent);
        localStorage.setItem(
          this.classRubricFileName + '_repos',
          JSON.stringify(studentRepos)
        );
      }
    }
  }

  generateTableJSON(): void {
    let returnValue = '';
    if (this.githubLinkArray.length) {
      returnValue = `${this.githubLinkArray[0]}_${
        this.githubLinkArray[3] || 'main'
      }`;
    }
    console.log(this.tableValues$.value);
    this.tableValuesJSON$.next([
      // first value is the normal json file
      this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:application/json;charset=UTF-8,' +
          encodeURIComponent(JSON.stringify(this.tableValues$.value))
      ),
      // second value is the student specific one
      this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:application/json;charset=UTF-8,' +
          encodeURIComponent(
            JSON.stringify({ [returnValue]: this.tableValues$.value })
          )
      ),
    ]);
  }

  generateStudentFriendlyTable(): void {
    const githubLinkHeader = this.githubLink$.value
      ? `<h5>GitHub Link Marked:<br>${this.githubLink$.value}</h5>`
      : '';
    const tableNoticeMessage = `<tr><th colspan="2">Please click the feedback bubble on your evaluation to view the table in full</th></tr>`;
    const tableHeader = `<tr><th style="border-bottom: 1px solid #000;">Rubric Criteria</th><th style="border-bottom: 1px solid #000;">Score</th></tr>`;
    const overallScoreMessage = `<tr><td><strong>Total:</strong></td><td><strong>${this.overallScore$.value}</strong></td></tr>`;
    let tablerows = '';
    let tablerowsvalueWorths = '';
    let cheaterHeader = '';
    this.tableValues$.value.markingFeedback.forEach((mf) => {
      // console.log("feedback item", mf);
      if (mf.bonus && !this.tableValues$.value.triedBonus) {
        // if bonus feedback but they didn't try bonus, skip this one
        return;
      }
      tablerows += `<tr><td><strong>${mf.rubric.description}</strong></td><td><strong>${mf.pointsAwarded}/${mf.rubric.score}</strong></td></tr>`;
      mf.feedbackList.forEach((f) => {
        // console.log("looking at feedback list", f);
        if (f.applied) {
          // console.log("feedback list applied", f);
          // if (tablerowsvalueWorths === '') {
          //   tablerowsvalueWorths = `<tr><td colspan="2">valueWorths: </td></tr>`;
          // }
          tablerowsvalueWorths += `<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;${
            f.feedback
          }</td><td>${mf.scoring.toString()}${f.deduction}</td></tr>`;
        }
      });
      tablerows += tablerowsvalueWorths;
      tablerowsvalueWorths = '';
    });
    if (this.tableValues$.value.cheated) {
      cheaterHeader = `<h2>Please come see me in the lab</h2>`;
    }
    this.outputTable$.next(
      `${cheaterHeader}${githubLinkHeader}<table><thead>${tableNoticeMessage}${tableHeader}</thead>
      <tbody>${tablerows}${overallScoreMessage}</tbody></table>`
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

  toggleTableView(e: MouseEvent): void {
    e.preventDefault();
    this.toggleOutputTableDisplay$.next(!this.toggleOutputTableDisplay$.value);
  }
}
