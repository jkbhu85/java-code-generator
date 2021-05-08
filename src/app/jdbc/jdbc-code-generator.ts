const PATTERN_SPACE = /\s+/;

interface TypeSpec {
  name: string;
  converter?: (rsCode: string) => string;
  unknownType?: boolean;
}

interface RsTypeSpec extends TypeSpec {
  objSetterSuffix?: string;
  rsGetterSuffix?: string;
  rsGetterFn?: (columnName: string) => string;
}

interface PsTypeSpec extends TypeSpec {
  objGetterPrefix?: string;
  objGetterSuffix?: string;
  psSetterSuffix?: string;
}

interface Keyword {
  identifier: string;
  type?: TypeSpec;
}

interface RsKeyword extends Keyword {
  type: RsTypeSpec;
}

interface PsKeyword extends Keyword {
  type: PsTypeSpec;
}

const RsTypes: RsTypeSpec[] = [
  {
    name: 'boolean',
    converter: (rsCode) => `Boolean.parseBoolean(${rsCode})`,
    rsGetterSuffix: 'string',
  },
  {
    name: 'Boolean',
    converter: (rsCode) =>
      `${rsCode} == null ? null : Boolean.parseBoolean(${rsCode})`,
    rsGetterSuffix: 'string',
  },
  {
    name: 'char',
    converter: (rsCode) => `${rsCode}.charAt(0)`,
    rsGetterSuffix: 'string',
  },
  {
    name: 'Character',
    converter: (rsCode) => `${rsCode}.charAt(0)`,
    rsGetterSuffix: 'string',
  },
  { name: 'byte' },
  {
    name: 'Byte',
    rsGetterFn: (columnName) => `getObject(${columnName}, Byte.class)`,
  },
  { name: 'short' },
  {
    name: 'Short',
    rsGetterFn: (columnName) => `getObject(${columnName}, Short.class)`,
  },
  { name: 'int' },
  {
    name: 'Integer',
    rsGetterFn: (columnName) => `getObject(${columnName}, Integer.class)`,
  },
  { name: 'long' },
  {
    name: 'Long',
    rsGetterFn: (columnName) => `getObject(${columnName}, Long.class)`,
  },
  { name: 'float' },
  {
    name: 'Float',
    rsGetterFn: (columnName) => `getObject(${columnName}, Float.class)`,
  },
  { name: 'double' },
  {
    name: 'Double',
    rsGetterFn: (columnName) => `getObject(${columnName}, Double.class)`,
  },
  { name: 'String' },
  { name: 'BigDecimal' },
  {
    name: 'Date',
    converter: (rsCode) => `(java.util.Date) ${rsCode}`,
  },
  {
    name: 'LocalDate',
    converter: (rsCode) => `${rsCode}.toLocalDate()`,
    rsGetterSuffix: 'date',
  },
  {
    name: 'LocalTime',
    converter: (rsCode) => `${rsCode}.toLocalTime()`,
    rsGetterSuffix: 'time',
  },
  {
    name: 'LocalDateTime',
    converter: (rsCode) => `${rsCode}.toLocalDateTime()`,
    rsGetterSuffix: 'timestamp',
  },
  {
    name: 'StringBoolean',
    converter: (rsCode) => `StringBoolean.fromValue(${rsCode})`,
    rsGetterSuffix: 'string',
  },
];

const PsTypes: PsTypeSpec[] = [
  {
    name: 'boolean',
    converter: (objCode) => `Boolean.toString(${objCode})`,
    objGetterPrefix: 'is',
    psSetterSuffix: 'string',
  },
  {
    name: 'Boolean',
    converter: (objCode) =>
      `${objCode} == null ? null : Boolean.toString(${objCode})`,
    objGetterPrefix: 'is',
    psSetterSuffix: 'string',
  },
  {
    name: 'char',
    converter: (objCode) => `Character.toString(${objCode})`,
    psSetterSuffix: 'string',
  },
  {
    name: 'Character',
    converter: (objCode) =>
      `${objCode} == null ? null : Character.toString(${objCode})`,
    psSetterSuffix: 'string',
  },
  { name: 'byte' },
  {
    name: 'Byte',
    psSetterSuffix: 'object',
  },
  { name: 'short' },
  {
    name: 'Short',
    psSetterSuffix: 'object',
  },
  { name: 'int' },
  {
    name: 'Integer',
    psSetterSuffix: 'object',
  },
  { name: 'long' },
  {
    name: 'Long',
    psSetterSuffix: 'object',
  },
  { name: 'float' },
  {
    name: 'Float',
    psSetterSuffix: 'object',
  },
  { name: 'double' },
  {
    name: 'Double',
    psSetterSuffix: 'object',
  },
  { name: 'String' },
  { name: 'BigDecimal' },
  {
    name: 'Date',
    converter: (objCode) => `new java.sql.Date(${objCode}.getTime())`,
  },
  {
    name: 'LocalDate',
    psSetterSuffix: 'object',
  },
  {
    name: 'LocalTime',
    psSetterSuffix: 'object',
  },
  {
    name: 'LocalDateTime',
    psSetterSuffix: 'object',
  },
  {
    name: 'StringBoolean',
    converter: (objCode) => `${objCode}.value()`,
    psSetterSuffix: 'string',
  },
];

function trim(x: string): string {
  return x.replace(/^\s+|\s+$/gm, '');
}

interface CodeParser {
  parse(javaCode: String): Keyword[];
}

class JavaCodeParser implements CodeParser {
  private typeNames: string[] = [];

  /**
   * Constructor.
   *
   * @param typeSpecs array of type specifications
   * @param handleUnknownType whether to consider unknown types
   */
  constructor(
    private typeSpecs: TypeSpec[],
    private handleUnknownType?: boolean
  ) {
    if (!this.handleUnknownType) this.handleUnknownType = false;
    for (let typeSpec of typeSpecs) {
      this.typeNames.push(typeSpec.name);
    }
  }

  public parse(javaCode: string): Keyword[] {
    const kws: Keyword[] = [];
    const lines = trim(javaCode).split(';');

    for (let i = 0; i < lines.length; i++) {
      const words = trim(lines[i]).split(PATTERN_SPACE);
      const typeNameIdx = words.length > 2 ? words.length - 2 : 0;
      const idfIdx = typeNameIdx + 1;
      const name = words[idfIdx];
      let typeSpec = this.getTypeSpec(words[typeNameIdx]);

      if (
        !typeSpec &&
        this.handleUnknownType &&
        this.handleUnknownType === true &&
        name
      ) {
        typeSpec = { name: words[typeNameIdx], unknownType: true };
      }

      if (typeSpec) {
        const kw = { identifier: name, type: typeSpec };
        kws.push(kw);
      }
    }

    return kws;
  }

  private getTypeSpec(type: string): TypeSpec {
    for (let typeSpec of this.typeSpecs)
      if (typeSpec.name === type) return typeSpec;
    return null;
  }
}

class RsToObjectCodeGenerater {
  private columnNameGenerator: ColumnNameGenerator;

  constructor(private parser: JavaCodeParser, columnNameSpec: ColumnNameSpec) {
    this.columnNameGenerator = new ColumnNameGenerator(columnNameSpec);
  }

  generateCode(req: RsToObjRequest): string {
    const keywords: Keyword[] = this.parser.parse(req.fields);
    const strArr = [];

    for (let i = 0; i < keywords.length; i++) {
      const kw = keywords[i];
      if (kw.type.unknownType) {
        // add logic for object creation
        strArr.push('//' + kw.type.name + ' ' + kw.identifier + ';');
        strArr.push('\n');
        // set newly created object to parent object
        strArr.push(
          '//' +
            req.objIdf +
            '.' +
            this.generateObjSetter(kw) +
            '(' +
            kw.identifier +
            ');'
        );
      } else {
        let rsCode = req.rsIdf + '.' + this.generateRsGetter(kw);
        if (kw.type.converter) rsCode = kw.type.converter(rsCode);
        let objCode =
          req.objIdf + '.' + this.generateObjSetter(kw) + '(' + rsCode + ');';
        strArr.push(objCode);
      }
      strArr.push('\n');
    }
    return strArr.join('');
  }

  private generateRsGetter(keyword: Keyword): string {
    const kwd = keyword as RsKeyword;
    const columnName = this.getColumnName(keyword.identifier);
    if (kwd.type.rsGetterFn) return kwd.type.rsGetterFn(columnName);
    let suffix = kwd.type.name;
    if (kwd.type.rsGetterSuffix) suffix = kwd.type.rsGetterSuffix;
    const rsGetter =
      'get' + suffix.substr(0, 1).toUpperCase() + suffix.substr(1);
    return `${rsGetter}(${columnName})`;
  }

  private getColumnName(fieldName: string): string {
    return this.columnNameGenerator.generateColumnName(fieldName);
  }

  private generateObjSetter(keyword: Keyword): string {
    const kwd = keyword as RsKeyword;
    let suffix = keyword.identifier;
    if (kwd.type.objSetterSuffix) suffix = kwd.type.objSetterSuffix;
    return 'set' + suffix.substr(0, 1).toUpperCase() + suffix.substr(1);
  }
}

class ObjectToPsCodeGenerater {
  constructor(private parser: CodeParser) {}

  generateCode(req: ObjToPsRequest): string {
    const keywords: Keyword[] = this.parser.parse(req.fields);
    const strArr = [];
    if (req.counterIdf) strArr.push('int col = 1;\n');

    for (let i = 0; i < keywords.length; i++) {
      const kw = keywords[i];

      let objCode: string;
      let psCode: string;
      if (kw.type.unknownType) {
        objCode =
          '(' +
          req.objIdf +
          '.' +
          this.generateObjGetter(kw) +
          '() == null ? null : ' +
          req.objIdf +
          '.' +
          this.generateObjGetter(kw) +
          '().get_())';

        if (req.counterIdf)
          psCode =
            req.psIdf +
            '.setString(' +
            req.counterIdf +
            '++, ' +
            objCode +
            ');';
        else
          psCode = req.psIdf + '.setString(' + (i + 1) + ', ' + objCode + ');';
      } else {
        objCode = req.objIdf + '.' + this.generateObjGetter(kw) + '()';
        if (kw.type.converter) objCode = kw.type.converter(objCode);

        if (req.counterIdf)
          psCode =
            req.psIdf +
            '.' +
            this.generatePsSetter(kw) +
            '(' +
            req.counterIdf +
            '++, ' +
            objCode +
            ');';
        else
          psCode =
            req.psIdf +
            '.' +
            this.generatePsSetter(kw) +
            '(' +
            (i + 1) +
            ', ' +
            objCode +
            ');';
      }

      strArr.push(psCode);
      strArr.push('\n');
    }

    return strArr.join('');
  }

  private generateObjGetter(keyword: Keyword): string {
    const kwd = keyword as PsKeyword;
    const identifier = kwd.identifier;
    let prefix = 'get';

    if (kwd.type.objGetterPrefix) prefix = kwd.type.objGetterPrefix;
    return (
      prefix + identifier.substr(0, 1).toUpperCase() + identifier.substr(1)
    );
  }

  private generatePsSetter(keyword: Keyword): string {
    const kwd = keyword as PsKeyword;
    let suffix = kwd.type.psSetterSuffix;
    if (!suffix) suffix = kwd.type.name;

    return 'set' + suffix.substr(0, 1).toUpperCase() + suffix.substr(1);
  }
}

class ColumnNameGenerator {
  constructor(private cns: ColumnNameSpec) {}

  generateColumnName(fieldName: string): string {
    if (this.cns.generateColumnNames) {
      let columnName = fieldName;
      if (this.cns.useSeparator) {
        const words = this.getWords(fieldName);
        columnName = words.join(this.cns.separator);
      }
      columnName = `"${columnName}"`;
      if (this.cns.columnCase === ColumnCase.UPPERCASE) {
        return columnName.toUpperCase();
      } else if (this.cns.columnCase === ColumnCase.LOWERCASE) {
        return columnName.toLowerCase();
      } else {
        return columnName;
      }
    }
    return '""';
  }

  isUpperCase(ch: string): boolean {
    const codePoint = ch.codePointAt(0);
    return codePoint >= 65 && codePoint <= 90;
  }

  isUnderScore(ch: string): boolean {
    return ch === '_';
  }

  getWords(fieldName): string[] {
    const words = [];
    let word = [];
    let lastCharUpperCase = false;
    let chars = fieldName.split('');
    for (let i = 0; i < chars.length; i++) {
      if (this.isUnderScore(chars[i])) {
        if (word.length > 0) {
          words.push(word.join(''));
          word = [];
        }
        continue;
      }

      let currentCharUpperCase = this.isUpperCase(chars[i]);

      if (
        (currentCharUpperCase && lastCharUpperCase) ||
        (!currentCharUpperCase && !lastCharUpperCase)
      ) {
        word.push(chars[i]);
      } else if (currentCharUpperCase && !lastCharUpperCase) {
        // e.g. reached at 2 in string abCd
        // the string 'ab' is now a word and 'C' starts a new word
        if (word.length > 0) {
          words.push(word.join(''));
          word = [chars[i]];
        } else {
          word.push(chars[i]);
        }
      } else {
        if (word.length === 1) {
          word.push(chars[i]);
        } else {
          const lastChar = word.splice(word.length - 1)[0];
          words.push(word.join(''));
          word = [lastChar, chars[i]];
        }
      }
      lastCharUpperCase = currentCharUpperCase;
    }
    if (word.length > 0) {
      words.push(word.join(''));
    }
    return words;
  }
}

export enum ColumnCase {
  UPPERCASE = 'U',
  LOWERCASE = 'L',
  SAME_AS_FIELD = 'S',
}

export interface ColumnNameSpec {
  generateColumnNames: boolean;
  useSeparator: boolean;
  separator: string;
  columnCase: ColumnCase;
}

export const DEFAULT_COLUMN_SPEC: ColumnNameSpec = {
  generateColumnNames: false,
  useSeparator: false,
  separator: '',
  columnCase: ColumnCase.SAME_AS_FIELD,
};

interface RsToObjRequest {
  rsIdf: string;
  objIdf: string;
  fields: string;
}

interface ObjToPsRequest {
  psIdf: string;
  objIdf: string;
  fields: string;
  counterIdf?: string;
}

export function generateRsToObjCode(
  req: RsToObjRequest,
  columnNameSpec = DEFAULT_COLUMN_SPEC
): string {
  console.log(columnNameSpec);
  const generater = new RsToObjectCodeGenerater(
    new JavaCodeParser(RsTypes, true),
    columnNameSpec
  );
  return generater.generateCode(req);
}

export function generateObjToPsCode(req: ObjToPsRequest): string {
  const generater = new ObjectToPsCodeGenerater(
    new JavaCodeParser(PsTypes, true)
  );
  return generater.generateCode(req);
}
