import {MigrationInterface, QueryRunner} from "typeorm";

export class addJWT1632634667023 implements MigrationInterface {
    name = 'addJWT1632634667023'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "jwt" ("sub" uuid NOT NULL, "iss" character varying NOT NULL, "azp" character varying NOT NULL, "username" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_2ba1e4c5f5683a33ec5417cef92" PRIMARY KEY ("sub"))`);
        await queryRunner.query(`ALTER TABLE "jwt" ADD CONSTRAINT "FK_690dc6b83bb053b2ccd4342a17f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jwt" DROP CONSTRAINT "FK_690dc6b83bb053b2ccd4342a17f"`);
        await queryRunner.query(`DROP TABLE "jwt"`);
    }

}
