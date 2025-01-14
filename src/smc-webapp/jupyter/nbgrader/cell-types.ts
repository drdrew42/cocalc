import { Metadata } from "./types";

interface CelltypeInfo {
  title: string; // human readable title for this type of cell
  student_title: string;
  student_tip: string;
  value: string; // what type of cell it is
  grade: boolean; // is it graded?
  locked: boolean; // is it locked?
  solution: boolean; // is it a solution?
  link: string; // link to some html help (the nbgrader docs)
  hover: string; // hover text that is helpful about this cell type (summary of nbgrader docs)
  points?: number; // default number of points
  icon?: string; // icon that would make sense for this type of cell
  code_only?: boolean; // only code cells can be set to this type
}

export const CELLTYPE_INFO_LIST: CelltypeInfo[] = [
  {
    title: "-",
    student_title: "",
    student_tip:"",
    value: "",
    grade: false,
    locked: false,
    solution: false,
    link:
      "https://nbgrader.readthedocs.io/en/stable/user_guide/creating_and_grading_assignments.html#developing-assignments-with-the-assignment-toolbar",
    hover:
      "This is a normal Jupyter cell, which won't be graded and doesn't contain any special autograding meaning."
  },
  {
    title: "Manually graded answer",
    student_title: "Your answer",
    student_tip: "Type your answer in this cell.  It will be manually graded by a person later.",
    link:
      "https://nbgrader.readthedocs.io/en/stable/user_guide/creating_and_grading_assignments.html#manually-graded-answer-cells",
    hover:
      "This cell will contain an answer that must be manually graded by a human grader.",
    value: "manual",
    icon: "book-reader",
    grade: true,
    locked: false,
    solution: true,
    points: 1
  },
  {
    title: "Automatically graded answer",
    student_title: "Your answer (tests are below)",
    student_tip:"Type your answer in this cell and evaluate it.  Use tests in cells below to check that your code probably works.",
    link:
      "https://nbgrader.readthedocs.io/en/stable/user_guide/creating_and_grading_assignments.html#autograded-answer-cells",
    hover:
      "This cell contains code that is part of a student's answer to a question.  This code typically gets run before some other 'Autograder tests' cell.",
    value: "auto",
    icon: "magic",
    grade: false,
    locked: false,
    solution: true,
    code_only: true
  },
  {
    title: "Test cell",
    student_title: "Test your code",
    student_tip:"You should have typed some code above and evaluated it.  Use the tests here to check that your code probably works.  Note that your teacher may also run additional tests not included here.",
    link:
      "https://nbgrader.readthedocs.io/en/stable/user_guide/creating_and_grading_assignments.html#autograder-tests-cells",
    hover:
      "This cell contains test code that will be run to automatically grade the answer to a question. This answer is typically contained in an 'Autograded answer' cell.",
    value: "test",
    icon: "check",
    grade: true,
    locked: true,
    solution: false,
    points: 1,
    code_only: true
  },
  {
    title: "Readonly",
    student_title: "Readonly",
    student_tip:"This is setup or explanatory code for your assignment.  It is readonly, so you should not need to change it.",
    link:
      "https://nbgrader.readthedocs.io/en/stable/user_guide/creating_and_grading_assignments.html#read-only-cells",
    hover:
      "This cell is marked as read only.  This makes it difficult for the student to change, and during instructor autograding, the original version of this cell will be placed here in case it was somehow changed by the student.",
    value: "readonly",
    icon: "lock",
    grade: false,
    locked: true,
    solution: false
  }
];

export const CELLTYPE_INFO_MAP: { [value: string]: CelltypeInfo } = {};
for (let x of CELLTYPE_INFO_LIST) {
  CELLTYPE_INFO_MAP[x.value] = x;
}

// I could implement this with another map hardcoded
// in Javascript, but instead use a function with a cache
// since it's more flexible.
const value_cache: { [key: string]: string } = {};
export function state_to_value(state: Metadata): string {
  const grade: boolean = !!state.grade;
  const locked: boolean = !!state.locked;
  const solution: boolean = !!state.solution;
  if (grade === false && solution === false) {
    // special case: either nothing or readonly
    return locked ? "readonly" : "";
  }

  // other 3 possibilities for grade/solution:
  const key = JSON.stringify({ grade, solution });
  if (value_cache[key] != undefined) return value_cache[key];
  for (let x of CELLTYPE_INFO_LIST) {
    if (x.grade == grade && x.solution == solution) {
      value_cache[key] = x.value;
      return x.value;
    }
  }
  throw Error(`invalid state - "${key}"`);
}

export function value_to_state(value: string): Metadata {
  const x = CELLTYPE_INFO_MAP[value];
  if (x == null) {
    throw Error(`unknown value "${value}"`);
  }
  return {
    grade: x.grade,
    locked: x.locked,
    solution: x.solution,
    points: x.points
  };
}
