import { Field, ID, ObjectType } from "type-graphql";
import { PrimaryGeneratedColumn, Column, Entity, Unique, OneToMany } from "typeorm";

import { Post } from "./post.js";
import { Lazy } from "../helpers.js";

@ObjectType()
@Entity()
@Unique(["username", "email"])
export class User {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Field()
  @Column()
  username: string;

  @Field()
  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(type => Post, post => post.author, { lazy: true })
  @Field(type => [Post])
  posts: Lazy<Post[]>;
}
