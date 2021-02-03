/**
 * Created by Owner on 2016/10/20.
 */
export class arrayUtil {
  //去重
  // static uniquelize(data:Array<>) {
  //   return Array.from(new Set(data))
  // }

  /**
   * data1包含data2
   * @param data1
   * @param data2
   * @returns {any}
   */
  static intersect(data1, data2) {
    const arr = [];
    data2.forEach(item => {
      if (data1.indexOf(item) > -1) {
        arr.push(parseInt(item));
      }
    });
    return arr;
  }

  static getRandomValue(arrayData) {
    const index = Math.floor(Math.random() * arrayData.length);
    return arrayData[index];
  }

  //获取随机值
  static getRandomKey(arrayData) {
    return Math.floor(Math.random() * arrayData.length);
  }

  //获取多个随机值
  static getNumRandomValue(arrayData, num) {
    const arrLength = arrayData.length;
    const randomNum = [];
    const randomValue = [];
    if (arrLength > num) {
      let state = true;
      while (state) {
        const index = Math.floor(Math.random() * arrLength);
        if (randomNum.indexOf(index) < 0) {
          randomNum.push(index);
          randomValue.push(arrayData[index]);
        }
        state = randomNum.length !== num;
      }
    }
    return randomValue;
  }
}
