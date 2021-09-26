import { AuthChecker } from "type-graphql";
import { Context } from "./resolvers/types/context.js";

export const customAuthChecker: AuthChecker<Context> = (
    { root, args, context, info },
    roles,
) => {

    const { user } = context.req;

    if (!user) {
        return false;
    }

    if (roles.length === 0) {
        return user !== undefined;
    }

    const { azp, resource_access } = user;
    const { roles: user_roles } = resource_access[azp];

    if (user_roles.some(role => roles.includes(role))) {
        return true;
    }

    return false;
};
