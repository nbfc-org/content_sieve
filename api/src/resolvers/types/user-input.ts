import { MaxLength } from "class-validator";
import { InputType, Field, ID } from "type-graphql";

import { UserSettings } from "../../entities/user.js";

@InputType()
export class UserSettingsInput extends UserSettings {
}
