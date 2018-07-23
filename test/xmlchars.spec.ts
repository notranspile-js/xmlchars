// tslint:disable-next-line:missing-jsdoc
import { expect } from "chai";
import { XML_1_0 } from "../src/xmlchars";

interface Fixture {
  name: string;
  data: string;
}

const x: Fixture = {
  name: "simple 'x' case",
  data: "x",
};

const abc: Fixture = {
  name: "simple 'abc' case",
  data: "abc",
};

const poo: Fixture = {
  name: "poo test",
  data: "\u{1F4A9}",
};

const space: Fixture = {
  name: "space",
  data: " ",
};

const tab: Fixture = {
  name: "tab",
  data: "\t",
};

const newline: Fixture = {
  name: "newline",
  data: "\n",
};

const cr: Fixture = {
  name: "carriage return",
  data: "\r",
};

const ideographic: Fixture = {
  name: "ideographic character",
  data: "我",
};

const combining: Fixture = {
  name: "combining char",
  data: "\u0300",
};

const digit: Fixture = {
  name: "digit",
  data: "1",
};

const extender: Fixture = {
  name: "extender",
  data: "\u00B7",
};

const nameWithColon: Fixture = {
  name: "name with colon",
  data: "foo:bar",
};

const leadingDot: Fixture = {
  name: "leading dot",
  data: ".bar",
};

const leadingDash: Fixture = {
  name: "leading dot",
  data: "-bar",
};

const leadingDigit: Fixture = {
  name: "leading digit",
  data: "1bar",
};

const bom: Fixture = {
  name: "bom",
  data: "\uFFFE",
};

// tslint:disable-next-line:mocha-no-side-effect-code
const ALL_FIXTURES = new Set([
  x,
  abc,
  poo,
  space,
  tab,
  newline,
  cr,
  ideographic,
  combining,
  digit,
  extender,
  nameWithColon,
  leadingDot,
  leadingDash,
  leadingDigit,
  bom,
]);

interface Case {
  matching: Fixture[];
}

type ED4_REGEX_NAMES = keyof typeof XML_1_0.ED4.regexes;
type ED5_REGEX_NAMES = keyof typeof XML_1_0.ED5.regexes;

function makeTests(re: RegExp, testCase: Case): void {
  describe("matches", () => {
    for (const matchingCase of testCase.matching) {
      if (!ALL_FIXTURES.has(matchingCase)) {
        throw new Error(
          `fixture ${matchingCase.name} is missing from ALL_FIXTURES`);
      }
      it(matchingCase.name, () => {
        expect(re.test(matchingCase.data)).to.be.true;
      });
    }
  });

  describe("does not match", () => {
    for (const f of ALL_FIXTURES) {
      if (!testCase.matching.includes(f)) {
        it(f.name, () => {
          expect(re.test(f.data)).to.be.false;
        });
      }
    }
  });
}

function makeCodePointTestTests(codePointTest: (c: number) => boolean,
                                testCase: Case): void {
  for (const fixture of testCase.matching) {
    const { data, name } = fixture;
    // tslint:disable-next-line:no-non-null-assertion
    const code = data.codePointAt(0)!;
    if (data.length > String.fromCodePoint(code).length) {
      // We skip those fixtures that contain more than one character.
      continue;
    }
    it(`matches ${name}`, () => {
      expect(codePointTest(code)).to.be.true;
    });
  }

  for (const fixture of ALL_FIXTURES) {
    if (!testCase.matching.includes(fixture)) {
      const { data, name } = fixture;
      // tslint:disable-next-line:no-non-null-assertion
      const code = data.codePointAt(0)!;
      if (data.length > String.fromCodePoint(code).length) {
        // We skip those fixtures that contain more than one character.
        continue;
      }
      it(`does not match ${name}`, () => {
        expect(codePointTest(code)).to.be.false;
      });
    }
  }
}

describe("XML_1_0", () => {
  describe("ED5", () => {
    // tslint:disable-next-line:mocha-no-side-effect-code
    const cases: Record<ED5_REGEX_NAMES, Case> = {
      CHAR: {
        matching: [x, poo, space, tab, newline, cr, ideographic, combining,
                   digit, extender],
      },
      S: {
        matching: [space, tab, newline, cr],
      },
      NAME_START_CHAR: {
        matching: [x, ideographic, poo],
      },
      NAME_CHAR: {
        matching: [x, ideographic, poo, combining, extender, digit],
      },
      NAME: {
        matching: [x, abc, ideographic, nameWithColon, poo],
      },
      NMTOKEN: {
        matching: [x, abc, ideographic, nameWithColon, leadingDot, leadingDash,
                   leadingDigit, combining, extender, digit, poo],
      },
      // tslint:disable-next-line:no-any
    } as any;
    describe(".regexes", () => {
      // tslint:disable-next-line:mocha-no-side-effect-code
      for (const name of (Object.keys(cases) as (keyof typeof cases)[])) {
        describe(name, () => {
          // tslint:disable-next-line:mocha-no-side-effect-code
          makeTests(XML_1_0.ED5.regexes[name], cases[name]);
        });
      }
    });

    describe(".isChar", () => {
      // tslint:disable-next-line:mocha-no-side-effect-code
      makeCodePointTestTests(XML_1_0.ED5.isChar, cases.CHAR);
    });

    describe(".isS", () => {
      // tslint:disable-next-line:mocha-no-side-effect-code
      makeCodePointTestTests(XML_1_0.ED5.isS, cases.S);
    });

    describe(".isNameStartChar", () => {
      // tslint:disable-next-line:mocha-no-side-effect-code
      makeCodePointTestTests(XML_1_0.ED5.isNameStartChar,
                             cases.NAME_START_CHAR);
    });

    describe(".isNameChar", () => {
      // tslint:disable-next-line:mocha-no-side-effect-code
      makeCodePointTestTests(XML_1_0.ED5.isNameChar, cases.NAME_CHAR);
    });
  });

  describe("ED4.regexes", () => {
    // tslint:disable-next-line:mocha-no-side-effect-code
    const cases: Record<ED4_REGEX_NAMES, Case> = {
      CHAR: {
        matching: [x, poo, space, tab, newline, cr, ideographic, combining,
                   digit, extender],
      },
      S: {
        matching: [space, tab, newline, cr],
      },
      BASE_CHAR: {
        matching: [x],
      },
      IDEOGRAPHIC: {
        matching: [ideographic],
      },
      COMBINING_CHAR: {
        matching: [combining],
      },
      DIGIT: {
        matching: [digit],
      },
      EXTENDER: {
        matching: [extender],
      },
      LETTER: {
        matching: [x, ideographic],
      },
      NAME_CHAR: {
        matching: [x, ideographic, digit, extender, combining],
      },
      NAME: {
        matching: [x, abc, ideographic, nameWithColon],
      },
      NMTOKEN: {
        matching: [x, abc, ideographic, nameWithColon, leadingDot, leadingDash,
                   leadingDigit, combining, extender, digit],
      },
      // tslint:disable-next-line:no-any
    } as any;

    // tslint:disable-next-line:mocha-no-side-effect-code
    for (const name of (Object.keys(cases) as (keyof typeof cases)[])) {
      describe(name, () => {
        // tslint:disable-next-line:mocha-no-side-effect-code
        makeTests(XML_1_0.ED4.regexes[name], cases[name]);
      });
    }
  });
});
