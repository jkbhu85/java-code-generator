const PATTERN_SPACE = /\s+/;

interface TypeSpec {
    name: string;
    converter?: (rsCode: string) => string;
    unknownType?: boolean;
}

interface RsTypeSpec extends TypeSpec {
    objSetterSuffix?: string;
    rsGetterSuffix?: string;
    rsGetter?: string;
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
        rsGetterSuffix: 'string'
    },
    {
        name: 'Boolean',
        converter: (rsCode) => `${rsCode} == null ? null : Boolean.parseBoolean(${rsCode})`,
        rsGetterSuffix: 'string'
    },
    {
        name: 'char',
        converter: (rsCode) => `${rsCode}.charAt(0)`,
        rsGetterSuffix: 'string'
    },
    {
        name: 'Character',
        converter: (rsCode) => `${rsCode}.charAt(0)`,
        rsGetterSuffix: 'string'
    },
    { name: 'byte' },
    {
        name: 'Byte',
        rsGetter: 'getObject("", Byte.class)'
    },
    { name: 'short' },
    {
        name: 'Short',
        rsGetter: 'getObject("", Short.class)'
    },
    { name: 'int' },
    {
        name: 'Integer',
        rsGetter: 'getObject("", Integer.class)'
    },
    { name: 'long'},
    {
        name: 'Long',
        rsGetter: 'getObject("", Long.class)'
    },
    { name: 'float'},
    {
        name: 'Float',
        rsGetter: 'getObject("", Float.class)'
    },
    { name: 'double' },
    {
        name: 'Double',
        rsGetter: 'getObject("", Double.class)'
    },
    { name: 'String' },
    { name: 'BigDecimal' },
    {
        name: 'Date',
        converter: (rsCode) => `(java.util.Date) ${rsCode}`
    },
    {
        name: 'LocalDate',
        converter: (rsCode) => `${rsCode}.toLocalDate()`,
        rsGetterSuffix: 'date'
    },
    {
        name: 'LocalTime',
        converter: (rsCode) => `${rsCode}.toLocalTime()`,
        rsGetterSuffix: 'time'
    },
    {
        name: 'LocalDateTime',
        converter: (rsCode) => `${rsCode}.toLocalDateTime()`,
        rsGetterSuffix: 'timestamp'
    },
    {
        name: 'StringBoolean',
        converter: (rsCode) => `StringBoolean.fromValue(${rsCode})`,
        rsGetterSuffix: 'string'
    }
];

const PsTypes: PsTypeSpec[] = [
    {
        name: 'boolean',
        converter: (objCode) => `Boolean.toString(${objCode})`,
        objGetterPrefix: 'is',
        psSetterSuffix: 'string'
    },
    {
        name: 'Boolean',
        converter: (objCode) => `${objCode} == null ? null : Boolean.toString(${objCode})`,
        objGetterPrefix: 'is',
        psSetterSuffix: 'string'
    },
    {
        name: 'char',
        converter: (objCode) => `Character.toString(${objCode})`,
        psSetterSuffix: 'string'
    },
    {
        name: 'Character',
        converter: (objCode) => `${objCode} == null ? null : Character.toString(${objCode})`,
        psSetterSuffix: 'string'
    },
    { name: 'byte' },
    {
        name: 'Byte',
        psSetterSuffix: 'object'
    },
    { name: 'short' },
    {
        name: 'Short',
        psSetterSuffix: 'object'
    },
    { name: 'int' },
    {
        name: 'Integer',
        psSetterSuffix: 'object'
    },
    { name: 'long'},
    {
        name: 'Long',
        psSetterSuffix: 'object'
    },
    { name: 'float' },
    {
        name: 'Float',
        psSetterSuffix: 'object'
    },
    { name: 'double' },
    {
        name: 'Double',
        psSetterSuffix: 'object'
    },
    { name: 'String' },
    { name: 'BigDecimal' },
    {
        name: 'Date',
        converter: (objCode) => `new java.sql.Date(${objCode}.getTime())`
    },
    {
        name: 'LocalDate',
        psSetterSuffix: 'object'
    },
    {
        name: 'LocalTime',
        psSetterSuffix: 'object'
    },
    {
        name: 'LocalDateTime',
        psSetterSuffix: 'object'
    },
    {
        name: 'StringBoolean',
        converter: (objCode) => `${objCode}.value()`,
        psSetterSuffix: 'string'
    }
];

function trim(x: string): string {
    return x.replace(/^\s+|\s+$/gm,'');
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
    constructor(private typeSpecs: TypeSpec[], private handleUnknownType?: boolean) {
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

            if (!typeSpec && this.handleUnknownType && this.handleUnknownType === true && name) {
                typeSpec = { name: words[typeNameIdx], unknownType: true};
            }

            if (typeSpec) {
                const kw = { identifier: name, type: typeSpec};
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
    generateCode(req: RsToObjRequest, parser: JavaCodeParser): string {
        const keywords: Keyword[] = parser.parse(req.fields);
        const strArr = [];

        for (let i = 0; i < keywords.length; i++) {
            const kw = keywords[i];
            if (kw.type.unknownType) {
                // add logic for object creation
                strArr.push('//' + kw.type.name + ' ' + kw.identifier + ';');
                strArr.push('\n');
                // set newly created object to parent object
                strArr.push('//' + req.objIdf + '.' + this.generateObjSetter(kw) + '(' + kw.identifier + ');');
            } else {
                let rsCode  = req.rsIdf + '.' + this.generateRsGetter(kw);
                if (kw.type.converter) rsCode = kw.type.converter(rsCode);
                let objCode = req.objIdf + '.' + this.generateObjSetter(kw) + '(' + rsCode + ');';
                strArr.push(objCode);
            }
            strArr.push('\n');
        }

        return strArr.join('');
    }

    private generateRsGetter(keyword: Keyword): string {
        const kwd = keyword as RsKeyword
        if (kwd.type.rsGetter) return kwd.type.rsGetter;
        let suffix = kwd.type.name;
        if (kwd.type.rsGetterSuffix) suffix = kwd.type.rsGetterSuffix;

        return 'get' + suffix.substr(0, 1).toUpperCase() + suffix.substr(1) + '("")';
    }

    private generateObjSetter(keyword: Keyword): string {
        const kwd = keyword as RsKeyword
        let suffix = keyword.identifier;
        if (kwd.type.objSetterSuffix) suffix = kwd.type.objSetterSuffix;
        return 'set' + suffix.substr(0, 1).toUpperCase() + suffix.substr(1);
    }
}

class ObjectToPsCodeGenerater {
    constructor() {
    }

    generateCode(req: ObjToPsRequest, parser: CodeParser): string {
        const keywords: Keyword[] = parser.parse(req.fields);
        const strArr = [];

        for (let i = 0; i < keywords.length; i++) {
            const kw = keywords[i];

            let objCode;
            let psCode;
            if (kw.type.unknownType) {
                objCode = '(' + req.objIdf + '.' + this.generateObjGetter(kw) + '() == null ? null : ' +
                    req.objIdf + '.' + this.generateObjGetter(kw) + '().get_())' ;

                if (req.counterIdf) psCode = req.psIdf + '.setString(' + req.counterIdf +'++, ' + objCode + ');';
                else psCode = req.psIdf + '.setString(' + (i+1) +', ' + objCode + ');';
            }
            else {
                objCode = req.objIdf + '.' + this.generateObjGetter(kw) + '()';
                if (kw.type.converter) objCode = kw.type.converter(objCode);

                if (req.counterIdf) psCode = req.psIdf + '.' + this.generatePsSetter(kw) + '(' +
                    req.counterIdf +'++, ' + objCode + ');';
                else psCode = req.psIdf + '.' + this.generatePsSetter(kw) + '(' + (i+1) +', ' + objCode + ');';
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
        return prefix + identifier.substr(0, 1).toUpperCase() + identifier.substr(1);
    }

    private generatePsSetter(keyword: Keyword): string {
        const kwd = keyword as PsKeyword;
        let suffix = kwd.type.psSetterSuffix;
        if (!suffix) suffix = kwd.type.name;

        return 'set' + suffix.substr(0, 1).toUpperCase() + suffix.substr(1);
    }
}

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

export function generateRsToObjCode(req: RsToObjRequest): string {
    const parser = new JavaCodeParser(RsTypes, true);
    const generater = new RsToObjectCodeGenerater();
    return generater.generateCode(req, parser);
}

export function generateObjToPsCode(req: ObjToPsRequest): string {
    const parser = new JavaCodeParser(PsTypes, true);
    const generater = new ObjectToPsCodeGenerater();
    return generater.generateCode(req, parser);
}
