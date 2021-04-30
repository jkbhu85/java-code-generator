import { Component, OnInit } from '@angular/core';

import { generateRsToObjCode } from './jdbc-code-generator';

@Component({
  selector: 'app-rs-to-obj',
  templateUrl: './rs-to-obj.component.html',
  styles: [],
})
export class RsToObjComponent implements OnInit {
  rsToObj = {
    rsIdfName: 'rs',
    objIdfName: 'obj',
    classFields: '',
    rsIdfErrMsg: '',
    objIdfErrMsg: '',
    classFieldsErrMsg: '',
    generatedCode: '',
  };

  constructor() {}

  ngOnInit(): void {
    this.rsToObj.classFields = `$$
    private boolean valid;
    private long id;
    private String name;
    private double salary;
    private LocalDate startDate;
    private Double rate;`
      .replace('$$\n', '')
      .replace(/  +/g, '');
      this.onRsToObjCode();
  }
  private isRsToObjValid(): boolean {
    let valid = true;
    this.rsToObj.classFieldsErrMsg = '';
    this.rsToObj.objIdfErrMsg = '';
    this.rsToObj.rsIdfErrMsg = '';

    if (!this.rsToObj.rsIdfName) {
      this.rsToObj.rsIdfErrMsg = 'ResultSet identifier is required.';
      valid = false;
    }
    if (!this.rsToObj.objIdfName) {
      this.rsToObj.objIdfErrMsg = 'Object identifier is required.';
      valid = false;
    }
    if (!this.rsToObj.classFields) {
      this.rsToObj.classFieldsErrMsg = 'Class fields are required.';
      valid = false;
    }
    return valid;
  }

  onRsToObjCode(): void {
    if (this.isRsToObjValid()) {
      this.rsToObj.generatedCode = generateRsToObjCode({
        objIdf: this.rsToObj.objIdfName,
        rsIdf: this.rsToObj.rsIdfName,
        fields: this.rsToObj.classFields,
      });
    }
  }
}
