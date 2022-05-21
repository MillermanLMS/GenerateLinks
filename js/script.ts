import rubric from "../rubricsample.json";

interface Rubric {
  description: string;
  score: number;
}
interface Feedback {
  text: string;
  deduction: number;
  element: HTMLDivElement;
}
interface MarkingFeedback {
  rubric: Rubric;
  feedback: Feedback[];
}
class GenerateLink {
  private _stackblitzLink = "";
  private tableValues: MarkingFeedback[];

  readonly githubElement = document.getElementById(
    "github-link"
  ) as HTMLInputElement;
  readonly stackblitzElement = document.getElementById(
    "stackblitz"
  ) as HTMLInputElement;
  readonly stackblitzLinkElement = document.getElementById(
    "stackblitz-link"
  ) as HTMLLinkElement;
  get stackblitzLink() {
    return this._stackblitzLink;
  }
  set stackblitzLink(val) {
    this._stackblitzLink = val;
    this.updateStackblitzLink();
  }

  constructor() {
    console.log(rubric);
    this.tableValues = (rubric.rubric as Rubric[]).map((rub) => {
      return { rubric: rub, feedback: [] } as MarkingFeedback;
    });
    console.log(this.tableValues);
    // this.tableValues = (rubric as Rubric[]).map(r => {...r, feedback: []});
    this.githubElement.addEventListener("input", (e: Event) => {
      this.stackblitzLink = this.generateStackblitzLink(
        (e.target as HTMLInputElement).value
      );
    });
  }
  // bind so that clicking input highlights it
  // document.querySelectorAll(".highlight-on-click").forEach()

  generateStackblitzLink(url) {
    let usefulContent = url.replace(/(https:\/\/)?(github.com)/g, "");
    // TODO: use octokit to make sure this link has the package.json in it
    return "https://stackblitz.com/github" + usefulContent;
  }
  updateStackblitzLink() {
    this.stackblitzElement.value = this.stackblitzLink;
    this.stackblitzLinkElement.href = this.stackblitzLink;
  }

  addFeedback(index: number, feedback: Feedback) {
    this.tableValues[index].feedback.push(feedback);
  }
  generateTable() {
    // TODO: generate table based on this.tableValues
  }
}
const genlink = new GenerateLink();
