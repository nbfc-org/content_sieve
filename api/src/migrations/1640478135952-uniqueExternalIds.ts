import {MigrationInterface, QueryRunner} from "typeorm";

export class uniqueExternalIds1640478135952 implements MigrationInterface {
    name = 'uniqueExternalIds1640478135952'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "UQ_6be8eaaa0dcd36cd508e603be2e" UNIQUE ("postId")`);
        await queryRunner.query(`ALTER TABLE "vote" ADD CONSTRAINT "UQ_982f9bafaaa7813766a878fa6e9" UNIQUE ("voteId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" DROP CONSTRAINT "UQ_982f9bafaaa7813766a878fa6e9"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "UQ_6be8eaaa0dcd36cd508e603be2e"`);
    }

}
