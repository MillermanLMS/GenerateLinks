# Generate Links

### potential ideas to make marking easier:
- Have them submit their themes in a separate submission
- Have them submit their github links in a separate submission
- Potentially award bonus marks for these submissions to incentivise it

## Application description:

- they go to my gitpage
  - select class they're in
  - they paste the link to their repo and branch
    - Idea to make easier for student: Let them enter their github username, list them their repos to select 1, then list the branches for them to select one
  - select assignment number they're submitting
    - Potentially show them the rubric here before they submit, as a reminder
    - Due date should maybe be tracked somewhere?
- code checks that a branch was provided, not just the main branch
- code generates link for them to submit
  - link leads back to gitpage, with the users repo and branch as get parameters, as well as the class code and assignment number
  - gitpage generates link to their repo, stackblitz/codesandbox/vscode.dev on the page for me when I visit it
    - for angular projects, find the package.json path and use that for the stackblitz link generation
  - these generated links are based on most recent commit before the specified due date
    - Potentially track how many commits happened after the due date, and compare commits from previous assignment and current
    - For late commits, potentially compare to the version before the due date
  - Allow me to view commits list
    - potentially load stackblitz/codesandbox/vscode.dev from any one commit
  - Allows me to add a json file of the rubric (or maybe I can generate it there too?). Rubric json contains: Optional total value and required array of rubric objects:
    - description
    - score
    - type of score (normal or bonus) (optional)
    - deductions array
      - marks to deduct
      - reason for deduction
  - Rubric generates buttons to create a score card to paste back to students as feedback
    - score card tracks score based on deductions, and understand bonus types are extra
    - potentially track previously filled out marking tables for students
    - Have it so rubric pasted template also contains the exact commit on github and stackblitz links that I used for marking
  - Allows me to edit descriptions in the rubric, or inline for each entry I add to the output
  - Clicking rubric buttons adds deductions to the right category, adds scores based on entries
