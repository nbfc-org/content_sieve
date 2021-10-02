import { Resolver, Query, Authorized, Arg, Mutation, Ctx, ID } from "type-graphql";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository, getManager } from "typeorm";

import { User, findOrCreateUser } from "../entities/user.js";

@Service()
@Resolver(User)
export class UserResolver {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}
}
