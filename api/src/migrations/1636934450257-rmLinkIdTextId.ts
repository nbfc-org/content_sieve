import {MigrationInterface, QueryRunner} from "typeorm";

export class rmLinkIdTextId1636934450257 implements MigrationInterface {
    name = 'rmLinkIdTextId1636934450257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_a8039833a37e9c1aad63e097b98"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_96fb64a95bae29c422c5fd4959e"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "REL_a8039833a37e9c1aad63e097b9"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "linkId"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "REL_96fb64a95bae29c422c5fd4959"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "textId"`);
        await queryRunner.query(`ALTER TABLE "post_type" ALTER COLUMN "contentId" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_type" ALTER COLUMN "contentId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ADD "textId" integer`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "REL_96fb64a95bae29c422c5fd4959" UNIQUE ("textId")`);
        await queryRunner.query(`ALTER TABLE "post" ADD "linkId" integer`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "REL_a8039833a37e9c1aad63e097b9" UNIQUE ("linkId")`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_96fb64a95bae29c422c5fd4959e" FOREIGN KEY ("textId") REFERENCES "text"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_a8039833a37e9c1aad63e097b98" FOREIGN KEY ("linkId") REFERENCES "link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
