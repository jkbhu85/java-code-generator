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
    elem.setAttribute('src', '/assets/copy.png');
    elem.setAttribute('alt', 'COPY');
    elem.setAttribute('title', 'Copy to clipboard');
    elem.addEventListener('click', () => this.copyToClipboard())
    elem.parentElement.style.position = 'relative';
  }

  private copyToClipboard() {
    const elem = document.querySelector(this.target || "");
    if (elem) {
      navigator.clipboard.writeText(elem.textContent)
      .then(() => {
        console.log("Text copied to clipboard");
      }).catch(() => {
        console.warn("Error occurred while copying to clipboard.");
      });
    } else {
      console.warn("No element with the selector found. Selector: " + this.target);
    }
  }

}
