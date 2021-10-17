import {MigrationInterface, QueryRunner} from "typeorm";

export class voteId1633913987851 implements MigrationInterface {
    name = 'voteId1633913987851'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ADD "voteId" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ADD CONSTRAINT "UQ_0aaefed839441c28239dc0e51d3" UNIQUE ("type", "userId", "metaId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."vote" DROP CONSTRAINT "UQ_0aaefed839441c28239dc0e51d3"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" DROP COLUMN "voteId"`);
    }

}
