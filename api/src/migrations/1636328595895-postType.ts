import {MigrationInterface, QueryRunner} from "typeorm";

export class postType1636328595895 implements MigrationInterface {
    name = 'postType1636328595895'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "post_type_posttype_enum" AS ENUM('text', 'link', 'metafilter', 'hackernews')`);
        await queryRunner.query(`CREATE TABLE "post_type" ("id" SERIAL NOT NULL, "postType" "post_type_posttype_enum" NOT NULL, "contentId" integer, CONSTRAINT "REL_6be8200e0dcd36cd508e603be2" UNIQUE ("postType", "contentId"), CONSTRAINT "PK_fbd367b0f90f065f0e54f858a6a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."post" ADD "typeId" integer`);
        await queryRunner.query(`ALTER TABLE "public"."post" ADD CONSTRAINT "UQ_593707a0d30fe8797406a244637" UNIQUE ("typeId")`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ALTER COLUMN "voteId" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ALTER COLUMN "voteId" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "public"."post" ADD CONSTRAINT "FK_593707a0d30fe8797406a244637" FOREIGN KEY ("typeId") REFERENCES "post_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`insert into post_type ("postType", "contentId") select 'link', "linkId" from post where "linkId" is not null`);
        await queryRunner.query(`update post set "typeId"=ptl.id from post_type ptl where post."linkId"=ptl."contentId" and ptl."postType"='link'`);

        await queryRunner.query(`insert into post_type ("postType", "contentId") select 'text', "textId" from post where "textId" is not null`);
        await queryRunner.query(`update post set "typeId"=ptl.id from post_type ptl where post."textId"=ptl."contentId" and ptl."postType"='text'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."post" DROP CONSTRAINT "FK_593707a0d30fe8797406a244637"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ALTER COLUMN "voteId" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "public"."post" DROP CONSTRAINT "UQ_593707a0d30fe8797406a244637"`);
        await queryRunner.query(`ALTER TABLE "public"."post" DROP COLUMN "typeId"`);
        await queryRunner.query(`DROP TABLE "post_type"`);
        await queryRunner.query(`DROP TYPE "post_type_posttype_enum"`);
    }

}
