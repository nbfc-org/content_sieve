import {MigrationInterface, QueryRunner} from "typeorm";

export class hnMefiUniq1636869827002 implements MigrationInterface {
    name = 'hnMefiUniq1636869827002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mefi" ADD CONSTRAINT "UQ_3160bd6fd77db1e8ab6e6838dff" UNIQUE ("xid")`);
        await queryRunner.query(`ALTER TABLE "hacker_news" ADD CONSTRAINT "UQ_c88a7020f26a6b831992e1bfabd" UNIQUE ("xid")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hacker_news" DROP CONSTRAINT "UQ_c88a7020f26a6b831992e1bfabd"`);
        await queryRunner.query(`ALTER TABLE "mefi" DROP CONSTRAINT "UQ_3160bd6fd77db1e8ab6e6838dff"`);
    }

}
