import { User } from "../../entities/user";

export interface Context {
  user?: User;
  req: any;
}
