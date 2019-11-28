import { browser, element, by } from 'protractor';

export class OpenStreetCamPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('osc-root h1')).getText();
  }
}
