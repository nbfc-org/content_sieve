import {MigrationInterface, QueryRunner} from "typeorm";

export class commentScoreView1632013175109 implements MigrationInterface {
    name = 'commentScoreView1632013175109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE VIEW "comment_scores" AS 
select baz."postId" as "id", (l - r)/under as wilson from (select bar."postId", p + 1.0 / (2.0*n) * z * z as l, z*sqrt(p*(1.0-p)/n + z*z/(4*n*n)) as r, 1.0+1.0/n*z*z as under from (select foo."postId", ups + downs as n, 1.281551565545 as z, ups / (ups + downs) as p from (select vote."postId", sum(case when type='up' then 1 else 0 end) as ups, sum(case when type='down' then 1 else 0 end) as downs from vote join post on vote."postId"=post.id and post."parentId" is not null group by vote."postId") as foo) as bar) as baz
`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`, ["VIEW","public","comment_scores","select baz.\"postId\" as \"id\", (l - r)/under as wilson from (select bar.\"postId\", p + 1.0 / (2.0*n) * z * z as l, z*sqrt(p*(1.0-p)/n + z*z/(4*n*n)) as r, 1.0+1.0/n*z*z as under from (select foo.\"postId\", ups + downs as n, 1.281551565545 as z, ups / (ups + downs) as p from (select vote.\"postId\", sum(case when type='up' then 1 else 0 end) as ups, sum(case when type='down' then 1 else 0 end) as downs from vote join post on vote.\"postId\"=post.id and post.\"parentId\" is not null group by vote.\"postId\") as foo) as bar) as baz"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3`, ["VIEW","public","comment_scores"]);
        await queryRunner.query(`DROP VIEW "comment_scores"`);
    }

}
