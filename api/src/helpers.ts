import { getRepository } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

import { Recipe } from "./entities/recipe.js";
import { Rate } from "./entities/rate.js";
import { User } from "./entities/user.js";
import { Post } from "./entities/post.js";
import { Text } from "./entities/text.js";
import { Link } from "./entities/link.js";

export async function seedDatabase() {
  const recipeRepository = getRepository(Recipe);
  const ratingsRepository = getRepository(Rate);
  const userRepository = getRepository(User);

  const defaultUser = userRepository.create({
    email: "test@github.com",
    nickname: "MichalLytek",
    password: "s3cr3tp4ssw0rd",
  });
  await userRepository.save(defaultUser);

  const [recipe1, recipe2] = recipeRepository.create([
    {
      title: "Recipe 1",
      description: "Desc 1",
      author: defaultUser,
    },
    {
      title: "Recipe 2",
      author: defaultUser,
    },
  ]);
  await recipeRepository.save([recipe1, recipe2]);

  const ratings = ratingsRepository.create([
    { value: 2, user: defaultUser, recipe: recipe1 },
    { value: 4, user: defaultUser, recipe: recipe1 },
    { value: 5, user: defaultUser, recipe: recipe1 },
    { value: 3, user: defaultUser, recipe: recipe1 },
    { value: 4, user: defaultUser, recipe: recipe1 },

    { value: 2, user: defaultUser, recipe: recipe2 },
    { value: 4, user: defaultUser, recipe: recipe2 },
  ]);
  await ratingsRepository.save(ratings);

  const postRepository = getRepository(Post);
  const textRepository = getRepository(Text);
  const linkRepository = getRepository(Link);

  for (const i of [...Array(100).keys()]) {
      const texts = textRepository.create([
          { body: 'wat' },
      ]);
      await textRepository.save(texts);

      const links = linkRepository.create([
          { url: 'http://google.com', title: 'Google' },
      ]);
      await linkRepository.save(links);

      const posts = postRepository.create([
          ...texts.map(t => { return { text: t, postId: uuidv4() }; }),
          ...links.map(l => { return { link: l, postId: uuidv4() }; }),
      ]);
      await postRepository.save(posts);

      posts[1].parent = posts[0];
      await postRepository.save(posts[1]);
  }

  return {
    defaultUser,
  };
}

export type Lazy<T extends object> = Promise<T> | T;
