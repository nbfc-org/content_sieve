import { Resolver, Query, Authorized, Arg, Mutation, Ctx, ID } from "type-graphql";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository, getManager } from "typeorm";

import { User, findOrCreateUser } from "../entities/user.js";
import { UserSettingsInput } from "./types/user-input.js";
import { Context } from "./types/context.js";

@Service()
@Resolver(User)
export class UserResolver {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}

    @Authorized()
    @Query(returns => User)
    async getOwnUser(@Ctx() { req }: Context): Promise<User> {
        const user = await findOrCreateUser(req.user);
        // console.log(user.settings);
        return user;
    }

    @Authorized()
    @Mutation(returns => User)
    async saveSettings(@Arg("settings") settings: UserSettingsInput, @Ctx() { req }: Context): Promise<User> {
        const user = await findOrCreateUser(req.user);

        user.settings = settings;
        await this.userRepository.save(user);

        return user;
    }
}
