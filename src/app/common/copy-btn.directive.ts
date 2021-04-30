import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appCopyBtn]'
})
export class CopyBtnDirective implements OnInit {

  @Input("appCopyBtn") target: string;

  constructor(private eleRef: ElementRef) {
  }

  ngOnInit() {
    const elem = this.eleRef.nativeElement;
    if (elem.tagName !== 'IMG') {
      throw `'appCopyBtn' can only be applied to an 'img' element. Actual element: ${elem.tagName}`;
    }
    elem.classList.add(...['icon', 'btn-copy']);
    elem.setAttribute('src', '');
    elem.setAttribute('alt', 'COPY');
    elem.setAttribute('title', 'Copy to clipboard');
    elem.parentElement.style.position = 'relative';
  }

}
