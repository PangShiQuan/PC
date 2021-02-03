import getSameInt from './getSameInt';
import {is} from 'utils/calculation/index';

export const MATCH_SYMBOL = '√';
export const EMPTY = '';

export function groupThree(nums) {
  if (nums.length !== 3) return EMPTY;
  return getSameInt(nums) === 2 ? MATCH_SYMBOL : EMPTY;
}

export function groupSix(nums) {
  if (nums.length !== 3) return EMPTY;
  return getSameInt(nums) === 1 ? MATCH_SYMBOL : EMPTY;
}

export function pair(nums) {
  return getSameInt(nums) === 2 ? MATCH_SYMBOL : EMPTY;
}

export function leopard(nums) {
  return getSameInt(nums) === nums.length ? MATCH_SYMBOL : EMPTY;
}
export function leopard2(nums) {
  const num0 = nums[0].toString().slice(1);
  const num1 = nums[1].toString().slice(1);
  const num2 = nums[2].toString().slice(1);
  const Num0 = nums[0].toString().slice(0,1);
  const Num1 = nums[1].toString().slice(0,1);
  const Num2 = nums[2].toString().slice(0,1);
  const numn3 = num0+num1+num2;
  const numn4 = Num0 === Num1 && Num1 === Num2;  // 同花
  const numn5 = num0 === num1 ||  num1 === num2 || num0 === num2 ; // 对子
  const numn6 = num0 === num1 &&  num1 === num2 && num0 === num2 ; // 豹子
  const sunzi = ['010203','020304','030405','040506','050607','060708','070809','091011','101112','111213','121301'];
  if(!numn5 && !numn4 && !(sunzi.includes(numn3)) && !numn6 ) {
    return '散牌';
  } else {
    return '';
  }
}
export function sunZi(nums) {
  const num0 = nums[0].toString().slice(1);
  const num1 = nums[1].toString().slice(1);
  const num2 = nums[2].toString().slice(1);
  const Num0 = nums[0].toString().slice(0,1);
  const Num1 = nums[1].toString().slice(0,1);
  const Num2 = nums[2].toString().slice(0,1);
  const numn3 = num0+num1+num2;
  const numn4 = Num0 === Num1 && Num1 === Num2;
  const sunzi = ['010203','020304','030405','040506','050607','060708','070809','091011','101112','111213','121301'];
  if (sunzi.includes(numn3) && !numn4) {
    return '顺子';
  } else
  {
    return '';
  }
}
export function tongHua(nums) {
  const num0 = nums[0].toString().slice(1);
  const num1 = nums[1].toString().slice(1);
  const num2 = nums[2].toString().slice(1);
  const Num0 = nums[0].toString().slice(0,1);
  const Num1 = nums[1].toString().slice(0,1);
  const Num2 = nums[2].toString().slice(0,1);
  const numn3 = num0+num1+num2;
  const numn4 = Num0 === Num1 && Num1 === Num2;
  const sunzi = ['010203','020304','030405','040506','050607','060708','070809','091011','101112','111213','121301'];
  if (!(sunzi.includes(numn3)) && numn4) {
    return "同花";
  } else {
    return '';
  }
}
export function tongHuaSun(nums) {
  const num0 = nums[0].toString().slice(1);
  const num1 = nums[1].toString().slice(1);
  const num2 = nums[2].toString().slice(1);
  const Num0 = nums[0].toString().slice(0,1);
  const Num1 = nums[1].toString().slice(0,1);
  const Num2 = nums[2].toString().slice(0,1);
  const numn3 = num0+num1+num2;
  const numn4 = Num0 === Num1 && Num1 === Num2;
  const sunzi = ['010203','020304','030405','040506','050607','060708','070809','091011','101112','111213','121301'];
  if ((sunzi.includes(numn3)) && numn4) {
    return "同花顺";
  } else {
    return '';
  }
}
export function duiZi(nums) {
  const num0 = nums[0].toString().slice(1);
  const num1 = nums[1].toString().slice(1);
  const num2 = nums[2].toString().slice(1);
  const numn4 = num0 === num1 ||  num1 === num2 || num0 === num2 ;
  const numn5 = num0 === num1 &&  num1 === num2;
  if (numn4 && !numn5) {
    return "对子";
  } else {
    return '';
  }
}

export function baoZi(nums) {
  const num0 = nums[0].toString().slice(1);
  const num1 = nums[1].toString().slice(1);
  const num2 = nums[2].toString().slice(1);
  const numn4 = num0 === num1 &&  num1 === num2 && num0 === num2 ;
  if (numn4) {
    return "豹子";
  } else {
    return '';
  }
}
