import {MigrationInterface, QueryRunner} from "typeorm";

export class metaVote1633877244871 implements MigrationInterface {
    name = 'metaVote1633877244871'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."vote" ADD "metaId" integer`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ADD CONSTRAINT "FK_c0ef6a4ff7eef9c7d396b24f1fb" FOREIGN KEY ("metaId") REFERENCES "vote"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."vote" DROP CONSTRAINT "FK_c0ef6a4ff7eef9c7d396b24f1fb"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" DROP COLUMN "metaId"`);
    }

}
