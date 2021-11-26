import {MigrationInterface, QueryRunner} from "typeorm";

export class restrictPostVotes1637952312101 implements MigrationInterface {
    name = 'restrictPostVotes1637952312101'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" DROP CONSTRAINT "UQ_0aaefed839441c28239dc0e51d3"`);
        await queryRunner.query(`ALTER TABLE "vote" DROP CONSTRAINT "UQ_0df63207c35c4284c9623f28fa9"`);
        await queryRunner.query(`ALTER TABLE "vote" ADD CONSTRAINT "UQ_982f9bafc547813766a878fa6e9" UNIQUE ("userId", "metaId")`);
        await queryRunner.query(`ALTER TABLE "vote" ADD CONSTRAINT "UQ_16e301aa5efdd994626b2635186" UNIQUE ("userId", "postId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" DROP CONSTRAINT "UQ_16e301aa5efdd994626b2635186"`);
        await queryRunner.query(`ALTER TABLE "vote" DROP CONSTRAINT "UQ_982f9bafc547813766a878fa6e9"`);
        await queryRunner.query(`ALTER TABLE "vote" ADD CONSTRAINT "UQ_0df63207c35c4284c9623f28fa9" UNIQUE ("type", "userId", "postId")`);
        await queryRunner.query(`ALTER TABLE "vote" ADD CONSTRAINT "UQ_0aaefed839441c28239dc0e51d3" UNIQUE ("type", "userId", "metaId")`);
    }

}
