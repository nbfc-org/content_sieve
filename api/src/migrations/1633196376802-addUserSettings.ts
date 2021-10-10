import {MigrationInterface, QueryRunner} from "typeorm";

export class addUserSettings1633196376802 implements MigrationInterface {
    name = 'addUserSettings1633196376802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "settings" jsonb NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."user" DROP COLUMN "settings"`);
    }

}
