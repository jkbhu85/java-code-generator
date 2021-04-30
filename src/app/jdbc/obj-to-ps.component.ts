import { Component, OnInit } from '@angular/core';
import { generateObjToPsCode } from './jdbc-code-generator'

@Component({
  selector: 'app-obj-to-ps',
  templateUrl: './obj-to-ps.component.html',
  styles: [
  ]
})
export class ObjToPsComponent implements OnInit {

  objToPs = {
    psIdfName: 'ps',
    objIdfName: 'obj',
    counterIdfName: '',
    classFields: '',
    psIdfErrMsg: '',
    objIdfErrMsg: '',
    classFieldsErrMsg: '',
    generatedCode: ''
  };

  constructor() { }

  ngOnInit(): void {
    this.objToPs.classFields = `$$
    private boolean valid;
    private long id;
    private String name;
    private double salary;
    private LocalDate startDate;
    private Double rate;`.replace('$$\n', '').replace(/  +/g, '');
    this.onObjToPsCode();
  }
  private isObjToPsValid() {
    let valid = true;

    this.objToPs.classFieldsErrMsg = '';
    this.objToPs.objIdfErrMsg = '';
    this.objToPs.psIdfErrMsg = '';

    if (!this.objToPs.classFields) {
      this.objToPs.classFieldsErrMsg = 'Class fields are required.';
      valid = false;
    }

    if (!this.objToPs.psIdfName) {
      this.objToPs.psIdfErrMsg = 'PreparedStatement identifier is required.';
      valid = false;
    }

    if (!this.objToPs.objIdfName) {
      this.objToPs.objIdfErrMsg = 'Object identifier is required.';
      valid = false;
    }
    return valid;
  }

  onObjToPsCode(): void {
    if (this.isObjToPsValid()) {
      this.objToPs.generatedCode = generateObjToPsCode({
        psIdf: this.objToPs.psIdfName,
        objIdf: this.objToPs.objIdfName,
        counterIdf: this.objToPs.counterIdfName,
        fields: this.objToPs.classFields
      });
    } else {
      console.warn("Form is invalid.")
    }
  }
}
