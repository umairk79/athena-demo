import { AthenasOwlUiPage } from './app.po';

describe('athenas-owl-ui App', () => {
  let page: AthenasOwlUiPage;

  beforeEach(() => {
    page = new AthenasOwlUiPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
