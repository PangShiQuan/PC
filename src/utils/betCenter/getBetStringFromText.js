import { isEmpty } from "lodash";
import getSeparator, { betEntryStrSeparator } from "./textBetIdentifier";

// 记得替换 $1 里的实时数据
const invalidMsg = {
  duplicateBets: "$1",
  duplicateCol: "投注号码：$1；不支持重复号码。",
  excessiveCol: "投注号码：$1；不支持复式选号。",
  invalidRowCount: "投注号码：$1；单注号码为$2个。",
  lackNumberOfUnits: "投注号码：$1；无法生成注数, 请输入$2位数号码即可。",
  outOfRange: "投注号码：$1；含有不存在的号码。",
  violateUnique: "投注号码：$1；单位之间拥有重复的独特号码。",
  special: {
    duplicate: "投注号码：$1；需要选择两个不同号码 生成一注。"
  }
};

const betStringFormatter = (
  { pickRange, specialCond },
  betString,
  separator
) => {
  switch (Object.keys(specialCond)[0]) {
    case "duplicate": {
      const { no, occurence } = specialCond.duplicate;
      const betStr = betString.split(separator.multi).sort((a, b) => a - b);
      const countMap = {};
      let finalBetString = [];
      let matchCount = 0;

      for (let i = 0; i < betStr.length; i++) {
        const betChar = betStr[i];

        if (i > 0 && betChar !== betStr[i - 1]) {
          if (countMap[betStr[i - 1]] === 1) finalBetString.push(betStr[i - 1]);
          else if (i === betStr.length - 1 && !countMap[betChar])
            finalBetString.push(betStr[i]);
        }

        if (countMap[betChar]) {
          countMap[betChar] += 1;

          if (countMap[betChar] === occurence) matchCount += 1;
          if (matchCount === no) {
            finalBetString.push(
              Array(occurence)
                .fill(betChar)
                .join(separator.multi)
            );
          } else if (matchCount > no) {
            finalBetString = [];
            break;
          }
        } else countMap[betChar] = 1;
      }
      return finalBetString
        .sort((a, b) => b.length - a.length)
        .join(betEntryStrSeparator.row);
    }
    default:
      return betString;
  }
};

class TextBets {
  constructor({ betMode = "", gameRules }, input = null) {
    this.betMode = betMode;
    this.betSets = [];
    this.gameRules = gameRules;
    this.input = input;
    this.mappedSection = [];
    this.separator = getSeparator(betMode);
  }

  static validate = (betSets, methodSetting, separator, skipWhenObj = []) => {
    const invalidBets = [];
    const validBets = [];
    const { betMode, gameRules } = methodSetting;
    const { isUnique, pickRange, set, specialCond = {} } = gameRules;
    const groupType = betMode === "single" && pickRange.length === 1;

    betSets.forEach((betRows, betRowsIndex) => {
      let invalidCause = "";
      const skipWhen = skipWhenObj[betRowsIndex] || {};

      if (
        betRows.length > pickRange.length ||
        betRows.length < pickRange.length
      )
        invalidCause = invalidMsg.invalidRowCount.replace(
          "$2",
          pickRange.length
        );

      const [min, max] = [set[0][0], set[0][set[0].length - 1]];
      const isValid = invalidCause
        ? false
        : !betRows.some((betRow, betRowIndex) => {
            const newBetRow = groupType
              ? betRow[0].split(separator.row)
              : betRow;
            const [minColPick] = pickRange[betRowIndex].split("-");

            if (groupType) {
              const duplicateCol =
                isEmpty(specialCond.duplicate) &&
                new Set(newBetRow).size !== newBetRow.length;

              if (duplicateCol) {
                invalidCause = invalidMsg.duplicateCol;
                return duplicateCol;
              }

              const excessiveCol = newBetRow.length > parseInt(minColPick);

              if (excessiveCol) {
                invalidCause = invalidMsg.excessiveCol;
                return excessiveCol;
              }
            }

            const lackNumberOfUnits = newBetRow.length < parseInt(minColPick);

            if (lackNumberOfUnits) {
              invalidCause = invalidMsg.lackNumberOfUnits.replace(
                "$2",
                minColPick
              );

              return lackNumberOfUnits;
            }

            const isOutOfRange = newBetRow.some(
              bet => parseInt(bet) < min || parseInt(bet) > max
            );

            if (isOutOfRange) {
              invalidCause = invalidMsg.outOfRange;
              return isOutOfRange;
            }

            if (isUnique) {
              const singleBet = Array.prototype.concat.apply(
                [],
                betRows.slice(betRowsIndex + 1)
              );
              const againstUnique = newBetRow.some(bet =>
                singleBet.includes(bet)
              );

              if (againstUnique) invalidCause = invalidMsg.violateUnique;
              return againstUnique;
            }
            return false;
          });

      const firstFailCond = !isEmpty(specialCond)
        ? Object.keys(skipWhen).find(condition => skipWhen[condition] === false)
        : null;

      if (!isValid || firstFailCond) {
        if (firstFailCond && !invalidCause)
          invalidCause = invalidMsg.special[firstFailCond];

        invalidBets.push({
          betRow: betRows,
          invalidCause: invalidCause.replace(
            "$1",
            Array.isArray(betRows) ? betRows.join(separator.row) : betRows
          )
        });
      } else validBets.push(betRows);
    });

    return { invalidBets, validBets };
  };
  static getBets = (betSets, separator, mode = "") => {
    return betSets.map(betRows => {
      return typeof betRows === "string"
        ? [
            betRows
              .split(separator.row)
              .map(
                betRow =>
                  mode === "single"
                    ? parseInt(betRow)
                    : betRow
                        .split(separator.multi)
                        .map(betCol => parseInt(betCol))
              )
          ]
        : betRows;
    });
  };
  static getBetString = (
    betSets,
    separator,
    { pickRange = [], sections = [], specialCond = {} } = {
      pickRange: [],
      sections: [],
      specialCond: {}
    },
    asBetEntryString
  ) => {
    return betSets.map(betRows => {
      if (typeof betRows === "string") {
        if (asBetEntryString) {
          if (!isEmpty(specialCond))
            return betStringFormatter(
              { pickRange, specialCond },
              betRows,
              separator
            );
          else
            return betRows
              .split(separator.row)
              .join(
                `${
                  pickRange.length === 1
                    ? betEntryStrSeparator.multi
                    : betEntryStrSeparator.row
                }`
              );
        } else return betRows;
      }

      const betRowString = Array.isArray(betRows)
        ? betRows.map(
            betRow =>
              Array.isArray(betRow)
                ? betRow.sort((a, b) => a - b).join(separator.multi)
                : betRow
          )
        : sections.map(section => {
            const betRow = betRows[section];
            return Array.isArray(betRow)
              ? betRow.sort((a, b) => a - b).join(separator.multi)
              : betRow;
          });
      return betRowString.join(separator.row);
    });
  };
  static removeDuplicate = (
    betSets,
    methodSetting,
    { input: { existingBets = [], methodId = "" }, separator, removeDuplicate }
  ) => {
    const { betMode, gameRules } = methodSetting;
    const { pickRange, specialCond = {} } = gameRules;
    // 去重是用 string 比较而不是 object 或 array, 需一致排序
    let betsString = TextBets.getBetString(betSets, separator);
    let newBetSets = [...betSets];
    const duplicateDump = [];
    const existingBetsString = existingBets
      .filter(existingBet => existingBet.gameplayMethod === methodId)
      .map(({ betString }) => betString);
    // 只有当被允许时去掉对现有投注单里的重复
    const removeExistingDuplicate = existingBets.length && removeDuplicate;

    if (betMode === "single" && pickRange.length === 1) {
      // 去掉单行重复
      betsString = betsString.map(betString =>
        (specialCond.duplicate
          ? betString.split(separator.row)
          : [...new Set(betString.split(separator.row))]
        )
          .sort((a, b) => a - b)
          .join(separator.row)
      );

      newBetSets = betsString;
    }

    if (removeExistingDuplicate) {
      const regexp = new RegExp(
        `[${betEntryStrSeparator.multi}\\${betEntryStrSeparator.row}]`,
        "g"
      );
      const trimExistingBetsString = existingBetsString.map(
        existingBetString => {
          const newExistingBetString = existingBetString
            .replace(regexp, "")
            .split("");

          if (pickRange.length === 1)
            newExistingBetString.sort((a, b) => parseInt(a) - parseInt(b));

          return newExistingBetString.join("");
        }
      );
      betsString.forEach((dupBetRow, duplicateIndex) => {
        if (trimExistingBetsString.includes(dupBetRow))
          duplicateDump.push(duplicateIndex);
      });
    }

    const betSetsMap = new Map();
    betsString.forEach((betString, index) => {
      if (betSetsMap.has(betString)) betSetsMap.get(betString).push(index);
      else betSetsMap.set(betString, [index]);
    });
    [...betSetsMap.values()].forEach(value => {
      if (value.length > 1) {
        const toBeRemove = value.splice(1);
        Array.prototype.push.apply(duplicateDump, toBeRemove.slice(0, 1));
      }
    });

    let remainingBets = Array.prototype.concat.apply(
      [],
      [...betSetsMap.values()]
    );
    remainingBets = removeExistingDuplicate
      ? remainingBets.filter(
          betSetIndex => !duplicateDump.includes(betSetIndex)
        )
      : remainingBets;

    return {
      duplicatedBets: duplicateDump.map(duplicate => newBetSets[duplicate]),
      remainingBets: remainingBets.map(betSetIndex => newBetSets[betSetIndex])
    };
  };
  static skipWhen = (bets = [], skipCondition = {}, separator) => {
    return bets.map(bet => {
      const skipWhenObj = {};
      Object.keys(skipCondition).forEach(condition => {
        // 目前只适用于单行投注
        if (condition === "duplicate") {
          const { no, occurence } = skipCondition.duplicate;
          let passed = 0;
          const betRow = bet.map(betRows =>
            betRows.toString().split(separator.multi)
          )[0];
          const checked = new Set();

          for (let i = 0; i < betRow.length; i++) {
            if (!checked.has(betRow[i])) {
              const duplicateCount = betRow
                .slice(i)
                .filter(duplicate => duplicate === betRow[i]);

              if (duplicateCount.length === occurence) passed++;

              checked.add(betRow[i]);
            }

            if (passed > no) break;
          }
          skipWhenObj.duplicate = passed === no;
        }
      });
      return skipWhenObj;
    });
  };
  extractTextToBetSets = () => {
    const multiSeparator = this.separator.multi
      ? `${this.separator.multi}*?`
      : this.separator.multi;
    const digitRegex = `(${multiSeparator}\\d+${multiSeparator}){1,}`;
    const regex = new RegExp(
      `(?:${digitRegex}${
        this.separator.row ? `\\${this.separator.row}` : this.separator.row
      })*${digitRegex}`,
      "g"
    );
    this.betSets = this.input.currentBets.match(regex);
    return this;
  };
  mapExtractToSection = () => {
    const separator = this.separator.multi
      ? new RegExp(`${this.separator.multi}{1,}`, "g")
      : this.separator.multi;
    const groupType =
      this.betMode === "single" && this.gameRules.pickRange.length === 1;

    this.mappedSection =
      (this.betSets &&
        this.betSets.map(betSet => {
          // 只适用于单行
          if (groupType) return [[betSet]];

          return betSet.split(this.separator.row).map(betRow =>
            betRow
              .trim()
              .split(separator)
              .map(bet => parseInt(bet))
          );
        })) ||
      [];

    return this;
  };
}

export const getBetString = TextBets.getBetString;
export default function getBets(methodSetting, input, removeDuplicate = false) {
  const separator = getSeparator(methodSetting.betMode);
  const textBets = new TextBets(methodSetting, input);
  const rawBets = textBets.extractTextToBetSets().mapExtractToSection()
    .mappedSection;
  const skipWhen = methodSetting.gameRules.specialCond
    ? TextBets.skipWhen(rawBets, methodSetting.gameRules.specialCond, separator)
    : [];
  const validatedBets = TextBets.validate(
    rawBets,
    methodSetting,
    separator,
    skipWhen
  );

  if (validatedBets.validBets.length) {
    const filteredBets = TextBets.removeDuplicate(
      validatedBets.validBets,
      methodSetting,
      {
        input: textBets.input,
        separator,
        removeDuplicate
      }
    );
    const betsString = TextBets.getBetString(
      filteredBets.remainingBets,
      separator
    );

    return {
      bets: TextBets.getBets(
        filteredBets.remainingBets,
        separator,
        methodSetting.betMode
      ),
      betsString,
      duplicateBets: filteredBets.duplicatedBets,
      invalidBets: validatedBets.invalidBets
    };
  } else {
    return {
      bets: [],
      betsString: [],
      duplicateBets: [],
      invalidBets: validatedBets.invalidBets
    };
  }
}
