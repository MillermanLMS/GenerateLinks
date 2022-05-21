class GenerateLink {
  private _stackblitzLink = "";
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
}
const genlink = new GenerateLink();
