# ydr-util [![ydr-util](https://img.shields.io/npm/v/ydr-util.svg?style=flat)](https://npmjs.org/package/ydr-util)

# APIS

## class
- .create({constructor:,STATIC:,...})
- .inherit(constructor, superConstructor, isCopyStatic)


## crypto
- .md5(data)
- .sha1(data, [secret])
- .etag(file, [callback])
- .lastModified(file)
- .encode(data, secret)
- .decode(data, secret)
- .password(originalPassword, [signPassword])


## date
- .format(format, [date], [config])
- .parse(string)
- .isLeapYear(year)
- .getDaysInMonth(year, month, [isNatualMonth])
- .getDaysInYear(year, month, date, [isNatualMonth])
- .getWeeksInYear(year, month, date, [isNatualMonth])
- .getWeeksInMonth(year, month, date, [isNatualMonth])
- .from(date, [compareDate])
- .range(range, [from])


## dato
- .parseInt(obj, [dft])
- .parseFloat(obj, dft)
- .each(list, callback, [context])
- .extend([isExtendDeep], source, target)
- .pick(data, keys, [filter])
- .toArray(obj, [isConvertWhole])
- .compare(obj1, obj2)
- .fixRegExp(regExpString)
- .bytes(string, doubleLength)
- .length(string)
- .fillNumber(number, length)
- .fixPath(p)
- .toURLPath(p)
- .removeComments(str)
- .atob(ascii)
- .btoa(base64)
- .humanize(number, [separator], [length])
- .than(long1, long2, [separator])
- .gravatar(email, [options])


## httpStatus
- .get(statusCode, [defaultStatus])
- .set(statusCode, status)


## mime
- .get(extname, [defaultContentType])
- .set(extname, contentType)


## random
- .number(length)
- .string(length, dictionary)
- .guid()// => 26位


## request
- .head(options, callback)
- .get(options, callback)
- .post(options, callback)
- .put(options, callback)
- .delete(options, callback)
- .down(options, callback)


## typeis
- typeis()
- .plainObject()
- .emptyObject()
- .url()
- .email()
- .validDate()
- .mongoId()
- .emptyData()
- .directory()
- .file()


## xss
- mdSafe(source, [moreDangerTagNameList])
- mdRender(source, [filterOptions])
