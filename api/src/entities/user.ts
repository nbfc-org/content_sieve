import { Field, ID, ObjectType } from "type-graphql";
import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from "typeorm";

import { Post } from "./post.js";
import { Lazy } from "../helpers.js";

@ObjectType()
@Entity()
export class User {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Field()
  @Column({ unique: true})
  username: string;

  @Field()
  @Column({ unique: true})
  email: string;

  @Column()
  password: string;

  @OneToMany(type => Post, post => post.author, { lazy: true })
  @Field(type => [Post])
  posts: Lazy<Post[]>;
}
