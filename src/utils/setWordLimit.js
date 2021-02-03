import {trimString} from './trimString';

function setWordLimit({wordItems, wordLimit}) {

    const {item1,item2,item3} = wordItems;
    let descriptionValue = `${item1} / ${
      item2
    } / ${item3}`;

    if (descriptionValue.length > wordLimit) {
      descriptionValue = `${item1} / ${
        item2
      } / ${trimString(item3, wordLimit)}`;

      if (descriptionValue.length > wordLimit) {
        descriptionValue = `${item1} / ${
          item2
        } / ${trimString(item3, 15)}`;

        if (descriptionValue.length > wordLimit) {
          descriptionValue = `${item1} / ${
            item2
          } / ${trimString(item3, 10)}`;

          if (descriptionValue.length > wordLimit) {
            descriptionValue = `${trimString(item1, 15)} / ${
              item2
            } / ${trimString(item3, 10)}`;

            if (descriptionValue.length > wordLimit) {
              descriptionValue = `${trimString(
                item1,
                10,
              )} / ${item2} / ${trimString(
                item3,
                10,
              )}`;
            }
          }
        }
      }
    }
    return descriptionValue;
  }
  export {setWordLimit};