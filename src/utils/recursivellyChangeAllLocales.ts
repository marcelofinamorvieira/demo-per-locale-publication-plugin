const recursivellyChangeAllLocales = (
  recordObject: any,
  oldLocale: string,
  newLocale: string
) => {
  if (recordObject.hasOwnProperty(oldLocale)) {
    recordObject[newLocale] = recordObject[oldLocale];
    delete recordObject[oldLocale];
  }
  for (const key of Object.keys(recordObject)) {
    if (recordObject[key] instanceof Object) {
      recursivellyChangeAllLocales(recordObject[key], oldLocale, newLocale);
    }
  }
};

export default recursivellyChangeAllLocales;
