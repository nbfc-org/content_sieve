import {MigrationInterface, QueryRunner} from "typeorm";

export class scoreViews1632004406299 implements MigrationInterface {
    name = 'scoreViews1632004406299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "typeorm_metadata" ("type" character varying, "schema" character varying, "name" character varying, "value" character varying)`);

        await queryRunner.query(`CREATE VIEW "top_level_scores" AS
select "postId" as "id", score, score/pow((extract(epoch from now()) - created_epoch)/3600+2,1.8) as hn_gravity, log(greatest(abs(score), 1)) + (case when score < 0 then -1 when score > 0 then 1 else 0 end) * (created_epoch - 1630000000) / 45000 as reddit_hot from (select vote."postId", sum(case when type='down' then -1 when type='up' then 1 else 0 end) as score, extract(epoch from max(post."createdAt")) as created_epoch from vote join post on vote."postId"=post.id and post."parentId" is null group by vote."postId") as foo
`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`, ["VIEW","public","top_level_scores","select \"postId\" as \"id\", score, score/pow((extract(epoch from now()) - created_epoch)/3600+2,1.8) as hn_gravity, log(greatest(abs(score), 1)) + (case when score < 0 then -1 when score > 0 then 1 else 0 end) * (created_epoch - 1630000000) / 45000 as reddit_hot from (select vote.\"postId\", sum(case when type='down' then -1 when type='up' then 1 else 0 end) as score, extract(epoch from max(post.\"createdAt\")) as created_epoch from vote join post on vote.\"postId\"=post.id and post.\"parentId\" is null group by vote.\"postId\") as foo"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3`, ["VIEW","public","top_level_scores"]);
        await queryRunner.query(`DROP VIEW "top_level_scores"`);
        await queryRunner.query(`DROP TABLE "typeorm_metadata"`);
    }

}
