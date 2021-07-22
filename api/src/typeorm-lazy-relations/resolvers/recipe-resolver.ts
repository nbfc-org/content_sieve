import { Resolver, Query, Arg, Mutation, Ctx, Int } from "type-graphql";
import { Repository } from "typeorm";
import { getManager } from "typeorm";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Recipe } from "../entities/recipe.js";
import { Rate } from "../entities/rate.js";
import { Post } from "../entities/post.js";
import { Text } from "../entities/text.js";
import { RecipeInput } from "./types/recipe-input.js";
import { PostInput } from "./types/post-input.js";
import { RateInput } from "./types/rate-input.js";
import { Context } from "./types/context.js";

import base36 from 'base36';
import uuid62 from 'uuid62';

@Service()
@Resolver(Recipe)
export class RecipeResolver {
  constructor(
    @InjectRepository(Recipe) private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(Rate) private readonly ratingsRepository: Repository<Rate>,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(Text) private readonly textRepository: Repository<Text>,
  ) {}

  @Query(returns => Recipe, { nullable: true })
  recipe(@Arg("recipeId", type => Int) recipeId: number) {
    return this.recipeRepository.findOne(recipeId);
  }

  @Query(returns => [Recipe])
  recipes(): Promise<Recipe[]> {
    return this.recipeRepository.find();
  }

    _dfs(nodes, pathmap, depth, parent=null) {
      let i = 0;
      for (const node of nodes) {
          const newdepth = [...depth, i];
          pathmap[node.id] = {
              index: newdepth.map(j => base36.base36encode(j).padStart(2, "0")).join(':'),
              parent,
          };
          this._dfs(node.children, pathmap, newdepth, node);
          i = i + 1;
      }
  }

  @Query(returns => [Post])
  async postsByUser(): Promise<Post[]> {
      const manager = getManager();
      const posts = await this.postRepository.find();
      const nodes = await manager.getTreeRepository(Post).findTrees();
      const pathmap = {};
      this._dfs(nodes, pathmap, []);
      for (const post of posts) {
          post.index = pathmap[post.id].index;
          post.parent = pathmap[post.id].parent;
      }
      posts.sort((a, b) => {
          return a.index.localeCompare(b.index); // || a.createdAt - b.createdAt;
      });
      return posts;
  }

  @Mutation(returns => Post)
  async addPost(@Arg("post") postInput: PostInput, @Ctx() { user }: Context): Promise<Post> {
      const texts = this.textRepository.create([
          { body: postInput.body },
      ]);
      const post = this.postRepository.create({
          postId: uuid62.decode(postInput.postId),
          text: texts[0],
          author: user,
      });
      await this.postRepository.save(post);
      post.parent = await this.postRepository.findOne({ postId: uuid62.decode(postInput.parentId) });
      const saved = await this.postRepository.save(post);
      saved.index = `${postInput.index}:00`;
      return saved;
    }

  @Mutation(returns => Recipe)
  addRecipe(@Arg("recipe") recipeInput: RecipeInput, @Ctx() { user }: Context): Promise<Recipe> {
    const recipe = this.recipeRepository.create({
      ...recipeInput,
      author: user,
    });
    return this.recipeRepository.save(recipe);
  }

  @Mutation(returns => Recipe)
  async rate(@Ctx() { user }: Context, @Arg("rate") rateInput: RateInput): Promise<Recipe> {
    // find the recipe
    const recipe = await this.recipeRepository.findOne(rateInput.recipeId, {
      relations: ["ratings"], // preload the relation as we will modify it
    });
    if (!recipe) {
      throw new Error("Invalid recipe ID");
    }

    // add the new recipe rate
    (await recipe.ratings).push(
      this.ratingsRepository.create({
        recipe,
        user,
        value: rateInput.value,
      }),
    );

    // return updated recipe
    return await this.recipeRepository.save(recipe);
  }
}
