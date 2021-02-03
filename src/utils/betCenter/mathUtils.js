/* eslint-disable */

export const mathUtil = {
  combination(c, b) {
    b = parseInt(b.toString());
    c = parseInt(c.toString());
    if (b < 0 || c < 0) {
      return false;
    }
    if (b == 0 || c == 0) {
      return 1;
    }
    if (b > c) {
      return 0;
    }
    if (b > c / 2) {
      b = c - b;
    }
    let a = 0;
    for (let i = c; i >= c - b + 1; i--) {
      a += Math.log(i);
    }
    for (let i = b; i >= 1; i--) {
      a -= Math.log(i);
    }
    a = Math.exp(a);
    return Math.round(a);
  },

  moveString(a) {
    let h = "";
    let k = "01";
    let b = "";
    let f = "";
    let j = "";
    let g = false;
    let c = false;
    for (let e = 0; e < a.length; e++) {
      if (g == false) {
        h += a.substr(e, 1);
      }
      if (g == false && a.substr(e, 1) == "1") {
        c = true;
      } else if (g == false && c == true && a.substr(e, 1) == "0") {
        g = true;
      } else {
        if (g == true) {
          b += a.substr(e, 1);
        }
      }
    }
    h = h.substr(0, h.length - 2);
    for (let d = 0; d < h.length; d++) {
      if (h.substr(d, 1) == "1") {
        f += h.substr(d, 1);
      } else if (h.substr(d, 1) == "0") {
        j += h.substr(d, 1);
      }
    }
    h = f + j;
    return h + k + b;
  },

  getCombination(o, c) {
    let l = o.length;
    let r = new Array();
    if (c > l) {
      return r;
    }
    if (c == 1) {
      return o;
    }
    if (l == c) {
      r[0] = o.join(",");
      return r;
    }
    let a = "";
    let b = "";
    let s = "";
    for (let g = 0; g < c; g++) {
      a += "1";
      b += "1";
    }
    for (let e = 0; e < l - c; e++) {
      a += "0";
    }
    for (var d = 0; d < c; d++) {
      s += `${o[d]},`;
    }
    r[0] = s.substr(0, s.length - 1);
    let h = 1;
    s = "";
    while (a.substr(a.length - c, c) != b) {
      a = mathUtil.moveString(a);
      for (var d = 0; d < l; d++) {
        if (a.substr(d, 1) == "1") {
          s += `${o[d]},`;
        }
      }
      r[h] = s.substr(0, s.length - 1);
      s = "";
      h++;
    }
    return r;
  }
};
