export interface IAuthProvider {
  getVersion(): string;
  getName(): string;
  getApolloName(): string;
  login();
  logout();
}
