import {MigrationInterface, QueryRunner} from "typeorm";

export class mefiTable1636825662377 implements MigrationInterface {
    name = 'mefiTable1636825662377'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mefi" ("id" SERIAL NOT NULL, "xid" integer NOT NULL, "url" character varying NOT NULL, "links" jsonb NOT NULL DEFAULT '[]', "rendered" character varying NOT NULL, CONSTRAINT "PK_6dbc0b3492b648ed42f4f805689" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "mefi"`);
    }

}
