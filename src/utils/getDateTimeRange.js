import moment from "moment";

export function getDateTimeRange(str, count = 0) {
  let startDatetime;
  let endDatetime;
  switch (str) {
    case "Today":
      startDatetime = moment().startOf("day");
      endDatetime = moment().endOf("day");
      break;
    case "Yesterday":
      startDatetime = moment()
        .subtract(1, "days")
        .startOf("day");
      endDatetime = moment()
        .subtract(1, "days")
        .endOf("day");
      break;
    case "ThisWeek":
      startDatetime = moment().startOf("isoWeek");
      endDatetime = moment().endOf("isoWeek");
      break;
    case "LastWeek":
      startDatetime = moment()
        .subtract(7, "days")
        .startOf("isoWeek");
      endDatetime = moment()
        .subtract(7, "days")
        .endOf("isoWeek");
      break;
    case "ThisMonth":
      startDatetime = moment().startOf("month");
      endDatetime = moment().endOf("month");
      break;
    case "LastMonth":
      startDatetime = moment()
        .subtract(1, "months")
        .startOf("month");
      endDatetime = moment()
        .subtract(1, "months")
        .endOf("month");
      break;
    case "Day":
      startDatetime = moment()
        .subtract(count, "days")
        .startOf("day");
      endDatetime = moment()
        .subtract(count, "days")
        .endOf("day");
      break;
    default:
      return null;
  }
  return { startDatetime, endDatetime };
}
