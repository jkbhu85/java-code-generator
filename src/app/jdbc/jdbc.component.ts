import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-jdbc',
  templateUrl: './jdbc.component.html',
  styles: [],
})
export class JdbcComponent implements OnInit {
  displayRsToObj = true;

  constructor() {}

  ngOnInit(): void {}

  showRsToObj(): void {
    this.displayRsToObj = true;
  }

  showObjToPs(): void {
    this.displayRsToObj = false;
  }
}
