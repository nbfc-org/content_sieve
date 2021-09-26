import {MigrationInterface, QueryRunner} from "typeorm";

export class removeEmailPass1632632914486 implements MigrationInterface {
    name = 'removeEmailPass1632632914486'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"`);
        await queryRunner.query(`ALTER TABLE "public"."user" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "public"."user" DROP COLUMN "password"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "password" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."user" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`);
    }

}
