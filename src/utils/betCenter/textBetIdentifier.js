export default function separator(mode) {
  if (mode !== "single")
    return {
      multi: " ",
      row: "|",
      group: [",", ";", ",", "，", "；", "\n"]
    };

  return {
    multi: "",
    row: "",
    group: [",", ";", " ", "，", "；", "\n"]
  };
}

export const betEntryStrSeparator = {
  multi: " ",
  row: "|"
};
