import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

/**
 * This class represents the navigation bar component.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-searchbox',
  templateUrl: 'searchbox.component.html',
  styleUrls: ['searchbox.component.css'],
})
export class SearchBoxComponent {

  public resultSelection = 0;

  _searchString = '';
  @Input()
  set searchString(text: string) {
    this._searchString = text;
    this._results = [];
  }
  get searchString() {
    return this._searchString;
  }

  public _results = [];
  @Input()
  set results(results) {
    this._results = results;
    this.resultSelection = 0;
  }
  get results() {
    return this._results;
  };
  @Input() resultsErrorType = 0;
  @Input() isLoading = false;
  @Output() onSubmit = new EventEmitter();
  @Output() onResultSelected = new EventEmitter();
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event) {
    if (this._results.length >= 2) {
      if (event.keyCode === 38) {
        event.preventDefault();
        this.resultSelection--;
        if (this.resultSelection < 0) {
          this.resultSelection = this._results.length - 1;
        } else if (this.resultSelection >= this._results.length) {
          this.resultSelection = 0;
        }
      } else if (event.keyCode === 40) {
        event.preventDefault();
        this.resultSelection++;
        if (this.resultSelection < 0) {
          this.resultSelection = this._results.length - 1;
        } else if (this.resultSelection >= this._results.length) {
          this.resultSelection = 0;
        }
      }
    }
    if (this._results.length > 0) {
      if (event.keyCode === 13) {
        event.preventDefault();
        if (this._results[this.resultSelection]) {
          this.selectResult(this._results[this.resultSelection].data);
        }
      }
    }
  }

  constructor() {
  }

  textBoxKeyPress(event) {
    if (event.keyCode === 13) {
      this.submitSearch();
    }
  }

  selectResult(resultItem) {
    this.onResultSelected.emit(resultItem);
    this.searchString = '';
  }

  submitSearch() {
    this.onSubmit.emit({ searchString: this.searchString });
  }

  clearSearchText() {
    this.searchString = '';
    this._results = [];
  }
}
