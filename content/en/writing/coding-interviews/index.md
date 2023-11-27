+++
title = "Coding interviews"
date = "2023-11-24"
description = """
Interviewing for software engineers is a complicated topic. Here's my
observations with over a decade of experience interviewing on both sides for
various engineering organizations.
"""
slug = "coding-interviews"
+++

> `tl;dr`
>
> With this post, there's more to gain from reading the whole thing, but here's
> quick summary anyway. There's a lot of different kinds of coding interviews
> and some of the more effective ones may not be what you think they are.

Hiring for good, dependable, and knowledgeable software engineers can be
challenging for almost any engineering team. It's especially true if the team is
overworked or overstressed. Growth is hard for any company at every level.
Scaling from a handful of engineers? Going from 20 engineers to 100 in six
months? Add being a remote-first company to the mix and things go from complex
to even more complicated.

All this can be _difficult_, and when hiring engineers especially, _expensive_.
Some of the main issues competing for attention of hiring engineers comes down
to cost, training, culture-fit, and more. With all these in mind, it's important
to get the coding interview **just right**. In fact, you may find yourself
realizing that interviewing engineers is going to be much more difficult than
_do they know how to program in a specific programming language?_ and more along
the lines of _do they know how to navigate the uncertainty on my specific team
**along with** do they know how to program in a specific programming language?_.
Even beyond this, there's company culture along with necessary accommodations
for your newest team member as well. It is pretty clear that you have multiple
situations where you can get this wrong and yet still convince yourself that
you are hiring the best and brightest software engineers because you had
them solve one or two little puzzles quickly.

## Types of interviews for hiring engineers

There's a number of kinds of interviews that software engineers are submitted
to. These kinds of interviews fall into a couple distinct categories. _Some of
types of interviews below are not exclusive to hiring engineers_

- Screener
- Behavioral
- Technical
  - Base knowledge
  - Systems design knowledge

## Types of coding interviews

The main focus here is the technical interviews outlined above. To be even more
specific, I won't be going into the system design knowledge either. For the base
knowledge mentioned above, I have seen two distinct types of challenges here.
The first kind is usually some kind of puzzle or test using computer science
algorithms that someone would memorize and learn from either college or some
kind of coding bootcamp. The second kind is some kind of practical and technical
exercise that usually involves another engineer from the company doing the
hiring to test the same things. These exercises can still include things like a
puzzle or test for CS algorithms, but more commonly will actually have working
or functional code with the possibility of specific bugs.

### Pros / Cons with each type of coding interview

To make things easier, let's call the first type of coding interview **puzzle**
and the second type of coding interview **exercise**. Let's explore the pros and
cons of each type.

#### Puzzles

| Pro                                                                                | Con                                                                                                                                                 |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tests knowledge of algorithms & computer science                                   | Expects the interviewee to have gone through a narrow set of skill attainment                                                                       |
| Easy to study for interviewees using LeetCode or CodeSignal                        | Easy to memorization CS topics that won't potentially match up with on-the-job tasks                                                                |
| Useful if you're hiring directly from college & code camps                         | Can be difficult for interviewees further along in their career                                                                                     |
| The more complicated the puzzle, the more the interviewee knows the subject matter | It can be difficult to determine how difficult a puzzle to pick and takes time (e.g. multiple interviewees) to be able to assess it's effectiveness |
| Interviews can be as short as 10 to 15 minutes                                     | There's very little time to really get to know a candidate under unrealistic pressure                                                               |

Some interesting things surface up in the table up. There's a bias here for
computer science and algorithms and interviewees who've recently graduated. This
is because the real thing these kinds of interviews are testing are whether or
not someone is lying about being able to program and if they went to some kind
of training, academic or commercial, that the person doing the interviewing is
familiar with. These kinds of interviews are useful when there isn't a whole lot
of time to prepare. Think of them of the pre-made just-heat-them-up meals that
are ready to eat within minutes. You can go through a larger number of requests
much faster if the you can pass/fail within minutes since the solutions are
known. These kinds of interviews are best when coupled with other kinds of
behavioral or technical interviews such as a system design interview. These
kinds of interviews on their own can lead to situations like a lack of culture
fit and at the worst case new-hires might have a complete inability to do the
day-to-day job. The last situation can lead people to feeling like they need to
burn through candidates towards the tail-end of interviewing rounds.

#### Exercises

| Pro                                                                                                                                        | Con                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Tests knowledge of programming using real-world situations                                                                                 | Creating these kinds of exercises is time-consuming                                                                   |
| Facilitates the interviewer and interviewee to engage in useful conversation that could possibly touch on behavioral and leadership topics | Exercise interviews can be time-consuming and may lead to not fully testing an interviewee's knowledge of programming |
| Engineering teams can create a pool of exercises very loosely based on day-to-day work for the team                                        | It can be unethical to have interviewees solve issues for free during a coding interview                              |
| Can help assess how the interviewee thinks about problems over implementation                                                              | Interviewees can publish solutions online which could defeat any embedded puzzles in them                             |
| Can be done in a variety of languages                                                                                                      | Is limited by the skillset of the engineering team that creates them                                                  |

Just like the **Puzzles** table above, this one also interesting things coming
up. The bias here is around avoiding testing computer science and algorithms
over more holistic tests that can potentially include leadership and behavioral
topics. These kinds of tests can be studied for such like coding puzzles but are
probably more suited for engineers with many years into their careers, like
five-plus or more. There's also the additional benefits to these kinds of
exercises is that when built into the engineering culture, the exercise creation
process can help build a way to measure the technical challenges for the
organization itself. It's common for engineering teams change priorities for
various reasons like business changes. Also due to things like attrition, it's
possible for companies to have engineering organizations that would find it
difficult to pass the engineering rigor of their current interview process.
While this is also true for puzzles, it's much harder to study for exercises.
With exercises, not having a process to create or update them regularly can lead
to situations where highly-skilled interviewees might notice that the
interviewing team is unfamiliar with the puzzle or how to solve it. Even with a
process to keep things up to date, it's possible for engineering teams that lack
senior leadership to push away talented candidates.

## Example of a coding puzzle _Balanced Brackets_

A common example for testing someone's knowledge of programming topics such as
linear iteration or recursion is the _Balanced Brackets_ problem. This puzzle is
ranked as medium according to HackerRank.

[➡️ Read more about Balanced Brackets](https://www.hackerrank.com/challenges/balanced-brackets/problem)

Here's a breakdown of two kinds of solutions to this puzzle.

```js
// Start with a map of closing brackets to opening brackets to easily identify
// pairs.
const closedBrackets = {
  "}": "{",
  "]": "[",
  ")": "(",
};

/** @function validBrackets
    @description The solution function which takes an array as an input and
    returns a boolean
    @param {string} input - A String of brackets to validate
    @returns {boolean} isValid
*/
function validBrackets(input) {
  // Start with an invalid response to make it easier to fail faster.
  let isValid = false;

  // It's not possible to have a balance if the string is not an even amount of
  // characters, so fail here.
  if (input.length % 2 !== 0) {
    return isValid;
  }

  // Create a list to store the open brackets found in the string.
  let lb = [];

  // Loop through the characters in the string.
  for (let idx = 0; idx < input.length; idx++) {
    let currentChar = input[idx];
    let doesPrevCharExist = false;
    let isLeftSymbolsPopulated = lb.length !== 0;
    let lbLastIndex = lb.length - 1;

    // Using a switch statement, check for opening brackets or closing brackets.
    switch (currentChar) {
      case "(":
      case "{":
      case "[":
        // If an opening bracket exists, then add the character to the `lb`
        // list.
        lb.push(currentChar);
        break;
      case ")":
      case "}":
      case "]":
        // If a closing bracket exists, then check what the last character added
        // to the `lb` list is and determine if there's a match.
        doesPrevCharExist = lb[lbLastIndex] === closedBrackets[currentChar];

        // Using the `doesPrevCharExist` boolean and checking if the `lb` list
        // has brackets in it, clear the last item in the `lb` list since that
        // bracket is considered balanced.
        if (isLeftSymbolsPopulated && doesPrevCharExist) {
          lb.pop();
        }

        break;
      // If it's not an opening or closing bracket, then make sure isValid is
      // false.
      default:
        isValid = false;
    }
  }

  // After iterating through the entire string and building a list of the open
  // brackets, check if the list is empty which means that the brackets were all
  // balanced.
  if (lb.length === 0) {
    isValid = true;
  }

  return isValid;
}

// Tests
console.log(
  `Let's validate some brackets. Below you'll see the output of
  validBrackets along with the input string next to it.`,
);
const tests = ["()[]{}", "(((]))", "((()))", "](", "(()", "())"];

const solutions = [true, false, true, false, false, false];

tests.forEach((test, i) => {
  if (isValid(test) !== solutions[i]) {
    throw new Error(`${test} should be ${solutions[i]}`);
  }
});
```

And here's another solution that uses recursion that's slightly more effective
when dealing with bad data and long strings. This solution also uses more modern
JavaScript syntax. It doesn't waste any time and bails as soon as a unbalanced
bracket is found.

```js
/**
    @function
    @description Checks to see if the input character is an opening bracket
    @param {string} c - A single character
    @returns {boolean} - True if it is an opening bracket
*/
const isOpening = (c) => {
  return ["(", "{", "["].indexOf(c) > -1;
};

/**
    @function
    @description Checks to see if the input character is a closing bracket
    @param {string} c - A single character
    @returns {boolean} - True if it is a closing bracket
*/
const isClosing = (c) => {
  return [")", "}", "]"].indexOf(c) > -1;
};

// A map of open brackets to closed brackets to easily identify pairs.
const closers = {
  "(": ")",
  "{": "}",
  "[": "]",
};

/** @function isValid
    @description The solution function which takes an array as an input and
    returns a boolean
    @param {string} str - A String of brackets to validate
    @returns {boolean} - True if brackets are balanced or False if any un-opened
    closed bracket appears
*/
const isValid = (str) => {
  // Throw an Error if brackets are not found in at least one character in the
  // input.
  if (str.split("").some((c) => !isOpening(c) && !isClosing(c))) {
    throw new Error("Chars expected to be from '(', '[', '{', ')', ']', '}'");
  }

  // Check for an empty input and return True. This means we've iterated through
  // the entire string and didn't find any unbalanced brackets.
  if (str.length === 0) {
    return true;
  }

  // Check the first character in the input is an opening bracket, if it's not
  // return False.
  if (!isOpening(str[0])) {
    return false;
  }

  // Save the nearest bracket's index. It starts as zero to ensure we're at the
  // first position in the `str` input.
  let imOpenIdx = 0;

  // Use a while-loop to add to the index based on the next character being an
  // opening bracket or not.
  while (isOpening(str[imOpenIdx + 1])) {
    imOpenIdx++;
  }
  const currChar = str[imOpenIdx];
  const nextChar = str[imOpenIdx + 1];
  // Check if the open bracket is equal to it's closing bracket using the
  // `closers` map. If it doesn't, then return False.
  if (closers[currChar] !== nextChar) {
    return false;
  }

  // If we've made it this far, we still have more `str` input to walk through,
  // so let's construct the next `str` for the next iteration of `isValid` and call
  // the function again.
  const nextStr = str.slice(0, imOpenIdx) + str.slice(imOpenIdx + 2);
  return isValid(nextStr);
};

// Tests
console.log(
  `Let's validate some brackets. Below you'll see the output of
  validBrackets along with the input string next to it.`,
);
const tests = ["()[]{}", "(((]))", "((()))", "](", "(()", "())"];

const solutions = [true, false, true, false, false, false];

tests.forEach((test, i) => {
  if (isValid(test) !== solutions[i]) {
    throw new Error(`${test} should be ${solutions[i]}`);
  }
});
```

## Conclusion

Ultimately, the different types of coding interviews have trade-offs. It comes
down to your engineering organization and company culture. My advice for
candidates interviewing for software jobs in 2023 and beyond is to study for
both. Coding puzzles and exercises are a great way to balance your time when
job-hunting. I also think it's a good idea to just do it to keep brushed-up on
engineering topics. This is especially true for engineers who have been out of
the job market for years. Coding interviews have changed a lot in the last two
decades. I am lucky to have been a part of the evolution from puzzles to more
interesting kinds of exercises that do more than just test a candidate's
memorization. And while puzzles don't change often, exercises can be created
from hobby software projects. Thanks for reading this far.
