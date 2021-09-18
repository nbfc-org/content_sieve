import {MigrationInterface, QueryRunner} from "typeorm";

export class firstMigration1631631769009 implements MigrationInterface {
    name = 'firstMigration1631631769009'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "text" ("id" SERIAL NOT NULL, "body" character varying NOT NULL, "rendered" character varying NOT NULL, CONSTRAINT "PK_ef734161ea7c326fedf699309f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "vote_type_enum" AS ENUM('up', 'down', 'flag', 'save', 'hide')`);
        await queryRunner.query(`CREATE TABLE "vote" ("id" SERIAL NOT NULL, "type" "vote_type_enum" NOT NULL, "date" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "postId" integer, CONSTRAINT "UQ_0df63207c35c4284c9623f28fa9" UNIQUE ("type", "userId", "postId"), CONSTRAINT "PK_2d5932d46afe39c8176f9d4be72" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tag" ("id" SERIAL NOT NULL, "canonicalId" integer, CONSTRAINT "REL_89c0efb7bccd4af4e42fdeb01f" UNIQUE ("canonicalId"), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tag_text" ("id" SERIAL NOT NULL, "slug" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tagId" integer, CONSTRAINT "UQ_e73443f117eceb2f00e748925a9" UNIQUE ("slug"), CONSTRAINT "PK_e2905422666ef672b772347dee2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "postId" uuid NOT NULL, "linkId" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "textId" integer, "authorId" integer, "parentId" integer, CONSTRAINT "REL_a8039833a37e9c1aad63e097b9" UNIQUE ("linkId"), CONSTRAINT "REL_96fb64a95bae29c422c5fd4959" UNIQUE ("textId"), CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "link" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "title" character varying NOT NULL, CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_tags_tag" ("postId" integer NOT NULL, "tagId" integer NOT NULL, CONSTRAINT "PK_e9b7b8e6a07bdccb6a954171676" PRIMARY KEY ("postId", "tagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b651178cc41334544a7a9601c4" ON "post_tags_tag" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_41e7626b9cc03c5c65812ae55e" ON "post_tags_tag" ("tagId") `);
        await queryRunner.query(`CREATE TABLE "post_closure" ("id_ancestor" integer NOT NULL, "id_descendant" integer NOT NULL, CONSTRAINT "PK_2cc55db5a0550a220aaff54a5d4" PRIMARY KEY ("id_ancestor", "id_descendant"))`);
        await queryRunner.query(`CREATE INDEX "IDX_36c7dffeba87284690503fc702" ON "post_closure" ("id_ancestor") `);
        await queryRunner.query(`CREATE INDEX "IDX_c29a3c5d4b36c73b2902200ecc" ON "post_closure" ("id_descendant") `);
        await queryRunner.query(`ALTER TABLE "vote" ADD CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vote" ADD CONSTRAINT "FK_43cc1af57676ac1b7ec774bd10f" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tag" ADD CONSTRAINT "FK_89c0efb7bccd4af4e42fdeb01fa" FOREIGN KEY ("canonicalId") REFERENCES "tag_text"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tag_text" ADD CONSTRAINT "FK_937657f94d5f2d2777d17da263b" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_a8039833a37e9c1aad63e097b98" FOREIGN KEY ("linkId") REFERENCES "link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_96fb64a95bae29c422c5fd4959e" FOREIGN KEY ("textId") REFERENCES "text"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_985731f28966e0d45a7bd9078a6" FOREIGN KEY ("parentId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_tags_tag" ADD CONSTRAINT "FK_b651178cc41334544a7a9601c45" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_tags_tag" ADD CONSTRAINT "FK_41e7626b9cc03c5c65812ae55e8" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_closure" ADD CONSTRAINT "FK_36c7dffeba87284690503fc7020" FOREIGN KEY ("id_ancestor") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_closure" ADD CONSTRAINT "FK_c29a3c5d4b36c73b2902200eccd" FOREIGN KEY ("id_descendant") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_closure" DROP CONSTRAINT "FK_c29a3c5d4b36c73b2902200eccd"`);
        await queryRunner.query(`ALTER TABLE "post_closure" DROP CONSTRAINT "FK_36c7dffeba87284690503fc7020"`);
        await queryRunner.query(`ALTER TABLE "post_tags_tag" DROP CONSTRAINT "FK_41e7626b9cc03c5c65812ae55e8"`);
        await queryRunner.query(`ALTER TABLE "post_tags_tag" DROP CONSTRAINT "FK_b651178cc41334544a7a9601c45"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_985731f28966e0d45a7bd9078a6"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_96fb64a95bae29c422c5fd4959e"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_a8039833a37e9c1aad63e097b98"`);
        await queryRunner.query(`ALTER TABLE "tag_text" DROP CONSTRAINT "FK_937657f94d5f2d2777d17da263b"`);
        await queryRunner.query(`ALTER TABLE "tag" DROP CONSTRAINT "FK_89c0efb7bccd4af4e42fdeb01fa"`);
        await queryRunner.query(`ALTER TABLE "vote" DROP CONSTRAINT "FK_43cc1af57676ac1b7ec774bd10f"`);
        await queryRunner.query(`ALTER TABLE "vote" DROP CONSTRAINT "FK_f5de237a438d298031d11a57c3b"`);
        await queryRunner.query(`DROP INDEX "IDX_c29a3c5d4b36c73b2902200ecc"`);
        await queryRunner.query(`DROP INDEX "IDX_36c7dffeba87284690503fc702"`);
        await queryRunner.query(`DROP TABLE "post_closure"`);
        await queryRunner.query(`DROP INDEX "IDX_41e7626b9cc03c5c65812ae55e"`);
        await queryRunner.query(`DROP INDEX "IDX_b651178cc41334544a7a9601c4"`);
        await queryRunner.query(`DROP TABLE "post_tags_tag"`);
        await queryRunner.query(`DROP TABLE "link"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "tag_text"`);
        await queryRunner.query(`DROP TABLE "tag"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`DROP TYPE "vote_type_enum"`);
        await queryRunner.query(`DROP TABLE "text"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
