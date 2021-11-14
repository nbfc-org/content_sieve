import {MigrationInterface, QueryRunner} from "typeorm";

export class hnTable1636866587070 implements MigrationInterface {
    name = 'hnTable1636866587070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "hacker_news" ("id" SERIAL NOT NULL, "xid" integer NOT NULL, "links" jsonb NOT NULL DEFAULT '[]', "rendered" character varying NOT NULL, CONSTRAINT "PK_0dea45aab69adbd31f0eafc981c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "hacker_news"`);
    }

}
