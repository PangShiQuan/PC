import {forEach, filter, keys} from 'lodash';
import {cleanEmptyObj} from '../cleanEmptyObj';

export default function updateBet(
  {section: currentSectionLabel, bet: newPick, group: bulkPick},
  {allBetObj, methodId, thisBetObj, thisMethodSetting},
) {
  const {
    gameRules: {pickRange, isUnique, sections, set, maximumRowPick},
  } = thisMethodSetting;
  const currentSectionIndex = sections.indexOf(currentSectionLabel);
  const setForCurrentSection = set[currentSectionIndex] || set[0];
  const max = pickRange[currentSectionIndex].split('-')[1];
  const newAllBetObj = {...allBetObj};
  let newBetObj = {...thisBetObj};

  // putting selection into correct section
  if (bulkPick) {
    newBetObj[currentSectionLabel] = bulkPick;
  } else if (
    newBetObj[currentSectionLabel] &&
    newBetObj[currentSectionLabel].length
  ) {
    const newPickIndex = newBetObj[currentSectionLabel].indexOf(newPick);

    if (newPickIndex > -1) {
      newBetObj[currentSectionLabel].splice(newPickIndex, 1);
    } else {
      newBetObj[currentSectionLabel].push(newPick);
    }
  } else {
    newBetObj[currentSectionLabel] = newBetObj[currentSectionLabel] || [];
    newBetObj[currentSectionLabel].push(newPick);
  }

  // removeing exceed pick in current section if exeed maximum;
  if (
    newBetObj[currentSectionLabel] &&
    newBetObj[currentSectionLabel].length > max
  ) {
    if (bulkPick) {
      const exceedCount = newBetObj[currentSectionLabel].length - max;
      newBetObj[currentSectionLabel] = newBetObj[currentSectionLabel].slice(
        exceedCount,
      );
    } else
      newBetObj[currentSectionLabel] = newBetObj[currentSectionLabel].slice(1);
  }

  // removing existing pick from other section if exceed maximum
  const rowsWithPick = filter(newBetObj, o => keys(o).length > 0);
  const rowCount = rowsWithPick.length;
  if (rowCount > maximumRowPick) {
    const sectionNames = keys(newBetObj);
    const firstSection = sectionNames[0];
    newBetObj[firstSection] = [];
  }

  // removing duplicated pick(s) from multiple sections
  if (isUnique) {
    forEach(newBetObj, (otherSection, otherSectionLabel) => {
      // ignore if is current section
      if (otherSectionLabel === currentSectionLabel) return;
      const filteredPicks = [];

      // getting other section original sets sequence from config
      const otherSectionIndex = sections.indexOf(otherSectionLabel);
      const otherSectionSets = set[otherSectionIndex] || set[0];

      otherSection.forEach(pickInOtherSection => {
        const setIndexInOtherSection = otherSectionSets.indexOf(
          pickInOtherSection,
        );

        const setReferenceInOtherSection =
          setForCurrentSection[setIndexInOtherSection];

        // pick at other section absolute not existing in current section included new pick
        // even is different placeholder
        // duplicate will be exclude even placeholder is different like 6 & 66, 1 & 11
        if (
          newBetObj[currentSectionLabel].indexOf(pickInOtherSection) < 0 &&
          newBetObj[currentSectionLabel].indexOf(setReferenceInOtherSection) <
            0 &&
          pickInOtherSection !== newPick
        ) {
          filteredPicks.push(pickInOtherSection);
        }
      });
      newBetObj[otherSectionLabel] = filteredPicks;
    });
  }

  newBetObj = cleanEmptyObj(newBetObj);
  newAllBetObj[methodId] = newBetObj;

  return newAllBetObj;
}
