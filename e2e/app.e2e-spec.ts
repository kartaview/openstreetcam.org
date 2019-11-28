import { OpenStreetCamPage } from './app.po';

describe('open-street-cam App', () => {
  let page: OpenStreetCamPage;

  beforeEach(() => {
    page = new OpenStreetCamPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
