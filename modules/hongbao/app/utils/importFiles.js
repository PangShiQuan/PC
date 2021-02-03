export default function importAll(r) {
  const items = {};
  r.keys().forEach(item => {
    items[item.replace('./', '')] = r(item);
  });
  return items;
}
