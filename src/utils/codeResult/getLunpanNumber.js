export default function getLunpanNumber(value) {
    const nums = parseInt(value.slice(-3).join(''), 10) % 37;
    return '轮盘' + nums;
}