import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import {
  generateRsToObjCode,
  ColumnNameSpec,
  DEFAULT_COLUMN_SPEC,
} from './jdbc-code-generator';

@Component({
  selector: 'app-rs-to-obj',
  templateUrl: './rs-to-obj.component.html',
  styles: [],
})
export class RsToObjComponent implements OnInit {
  rsToObj = {
    generatedCode: '',
  };

  form: FormGroup;

  constructor(fb: FormBuilder) {
    this.form = fb.group(
      {
        rsIdfName: ['rs', Validators.required],
        objIdfName: ['obj', Validators.required],
        classFields: ['', Validators.required],
        generateColName: [true],
        colNameAsField: ['N'],
        separator: ['_'],
        colNameCase: ['U', Validators.required],
      },
      {
        validators: [
          FormValidators.separatorValidator('colNameAsField', 'separator'),
        ],
      }
    );
  }

  get rsIdfName(): AbstractControl {
    return this.form.get('rsIdfName');
  }

  get objIdfName(): AbstractControl {
    return this.form.get('objIdfName');
  }

  get classFields(): AbstractControl {
    return this.form.get('classFields');
  }

  get generateColName(): AbstractControl {
    return this.form.get('generateColName');
  }

  get colNameAsField(): AbstractControl {
    return this.form.get('colNameAsField');
  }

  get colNameCase(): AbstractControl {
    return this.form.get('colNameCase');
  }

  get separator(): AbstractControl {
    return this.form.get('separator');
  }

  ngOnInit(): void {
    this.classFields.setValue(
      `$$
    private boolean valid;
    private long id;
    private String name;
    private double salary;
    private LocalDate startDate;
    private Double rate;`
        .replace('$$\n', '')
        .replace(/  +/g, '')
    );
    this.onRsToObjCode();
  }

  private getColumnNameSpec(): ColumnNameSpec {
    const spec = Object.assign({}, DEFAULT_COLUMN_SPEC);
    spec.generateColumnNames = this.generateColName.value;
    if (this.generateColName.value) {
      spec.useSeparator = this.colNameAsField.value === 'N';

      if (this.colNameAsField.value === 'N') {
        spec.separator = this.separator.value;
      }
      spec.columnCase = this.colNameCase.value;
    }
    return spec;
  }

  onRsToObjCode(): void {
    if (this.form.valid) {
      this.rsToObj.generatedCode = generateRsToObjCode(
        {
          objIdf: this.objIdfName.value,
          rsIdf: this.rsIdfName.value,
          fields: this.classFields.value,
        },
        this.getColumnNameSpec()
      );
    }
  }
}

const FormValidators = {
  separatorValidator: function _confirmPasswordValidator(
    sameAsFieldCtrlName: string,
    separatorCtrlName: string
  ): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {
      const sameAsFieldCtrl = formGroup.get(sameAsFieldCtrlName);
      const separatorCtrl = formGroup.get(separatorCtrlName);

      if (!sameAsFieldCtrl || !separatorCtrl) {
        return null;
      }

      if (sameAsFieldCtrl.value === 'N' && !separatorCtrl.value) {
        if (!separatorCtrl.invalid) {
          separatorCtrl.setErrors({ required: true });
        }
        return { required: true };
      }
      return null;
    };
  },
};
