import {MigrationInterface, QueryRunner} from "typeorm";

export class metaVote1633837392783 implements MigrationInterface {
    name = 'metaVote1633837392783'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW "top_level_scores"`);
        await queryRunner.query(`DROP VIEW "comment_scores"`);

        await queryRunner.query(`ALTER TABLE "public"."vote" ADD "metaId" integer`);
        await queryRunner.query(`ALTER TABLE "public"."vote" DROP CONSTRAINT "UQ_0df63207c35c4284c9623f28fa9"`);
        await queryRunner.query(`ALTER TYPE "public"."vote_type_enum" RENAME TO "vote_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."vote_type_enum" AS ENUM('up', 'down', 'flag', 'save', 'hide', 'meta')`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ALTER COLUMN "type" TYPE "public"."vote_type_enum" USING "type"::"text"::"public"."vote_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."vote_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ADD CONSTRAINT "UQ_0df63207c35c4284c9623f28fa9" UNIQUE ("type", "userId", "postId")`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ADD CONSTRAINT "FK_c0ef6a4ff7eef9c7d396b24f1fb" FOREIGN KEY ("metaId") REFERENCES "vote"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`CREATE VIEW "comment_scores" AS 
select baz."postId" as "id", (l - r)/under as wilson from (select bar."postId", p + 1.0 / (2.0*n) * z * z as l, z*sqrt(p*(1.0-p)/n + z*z/(4*n*n)) as r, 1.0+1.0/n*z*z as under from (select foo."postId", ups + downs as n, 1.281551565545 as z, ups / (ups + downs) as p from (select vote."postId", sum(case when type='up' then 1 else 0 end) as ups, sum(case when type='down' then 1 else 0 end) as downs from vote join post on vote."postId"=post.id and post."parentId" is not null group by vote."postId") as foo) as bar) as baz
`);
        await queryRunner.query(`CREATE VIEW "top_level_scores" AS
select "postId" as "id", score, score/pow((extract(epoch from now()) - created_epoch)/3600+2,1.8) as hn_gravity, log(greatest(abs(score), 1)) + (case when score < 0 then -1 when score > 0 then 1 else 0 end) * (created_epoch - 1630000000) / 45000 as reddit_hot from (select vote."postId", sum(case when type='down' then -1 when type='up' then 1 else 0 end) as score, extract(epoch from max(post."createdAt")) as created_epoch from vote join post on vote."postId"=post.id and post."parentId" is null group by vote."postId") as foo
`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW "top_level_scores"`);
        await queryRunner.query(`DROP VIEW "comment_scores"`);

        await queryRunner.query(`ALTER TABLE "public"."vote" DROP CONSTRAINT "FK_c0ef6a4ff7eef9c7d396b24f1fb"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" DROP CONSTRAINT "UQ_0df63207c35c4284c9623f28fa9"`);
        await queryRunner.query(`CREATE TYPE "public"."vote_type_enum_old" AS ENUM('up', 'down', 'flag', 'save', 'hide')`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ALTER COLUMN "type" TYPE "public"."vote_type_enum_old" USING "type"::"text"::"public"."vote_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."vote_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."vote_type_enum_old" RENAME TO "vote_type_enum"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ADD CONSTRAINT "UQ_0df63207c35c4284c9623f28fa9" UNIQUE ("type", "userId", "postId")`);
        await queryRunner.query(`ALTER TABLE "public"."vote" DROP COLUMN "metaId"`);

        await queryRunner.query(`CREATE VIEW "comment_scores" AS 
select baz."postId" as "id", (l - r)/under as wilson from (select bar."postId", p + 1.0 / (2.0*n) * z * z as l, z*sqrt(p*(1.0-p)/n + z*z/(4*n*n)) as r, 1.0+1.0/n*z*z as under from (select foo."postId", ups + downs as n, 1.281551565545 as z, ups / (ups + downs) as p from (select vote."postId", sum(case when type='up' then 1 else 0 end) as ups, sum(case when type='down' then 1 else 0 end) as downs from vote join post on vote."postId"=post.id and post."parentId" is not null group by vote."postId") as foo) as bar) as baz
`);
        await queryRunner.query(`CREATE VIEW "top_level_scores" AS
select "postId" as "id", score, score/pow((extract(epoch from now()) - created_epoch)/3600+2,1.8) as hn_gravity, log(greatest(abs(score), 1)) + (case when score < 0 then -1 when score > 0 then 1 else 0 end) * (created_epoch - 1630000000) / 45000 as reddit_hot from (select vote."postId", sum(case when type='down' then -1 when type='up' then 1 else 0 end) as score, extract(epoch from max(post."createdAt")) as created_epoch from vote join post on vote."postId"=post.id and post."parentId" is null group by vote."postId") as foo
`);
    }

}
