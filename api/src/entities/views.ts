import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
    // materialized: true,
    // type-graphql-lazy=# create unique index on top_level_scores (id);
    // type-graphql-lazy=# refresh materialized view CONCURRENTLY top_level_scores ;
    expression: `
select "postId" as "id", score, score/pow((extract(epoch from now()) - created_epoch)/3600+2,1.8) as hn_gravity, log(greatest(abs(score), 1)) + (case when score < 0 then -1 when score > 0 then 1 else 0 end) * (created_epoch - 1630000000) / 45000 as reddit_hot from (select vote."postId", sum(case when type='down' then -1 when type='up' then 1 else 0 end) as score, extract(epoch from max(post."createdAt")) as created_epoch from vote join post on vote."postId"=post.id and post."parentId" is null group by vote."postId") as foo
`
})
export class TopLevelScores {
    @ViewColumn()
    id: number;

    @ViewColumn()
    score: number;

    @ViewColumn()
    hn_gravity: number;

    @ViewColumn()
    reddit_hot: number;
}

@ViewEntity({
    // materialized: true,
    // type-graphql-lazy=# create unique index on comment_scores (id);
    // type-graphql-lazy=# refresh materialized view CONCURRENTLY comment_scores ;
    // wilson confidence interval: https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9
    expression: `
select baz."postId" as "id", (l - r)/under as wilson from (select bar."postId", p + 1.0 / (2.0*n) * z * z as l, z*sqrt(p*(1.0-p)/n + z*z/(4*n*n)) as r, 1.0+1.0/n*z*z as under from (select foo."postId", ups + downs as n, 1.281551565545 as z, ups / (ups + downs) as p from (select vote."postId", sum(case when type='up' then 1 else 0 end) as ups, sum(case when type='down' then 1 else 0 end) as downs from vote join post on vote."postId"=post.id and post."parentId" is not null and vote.type in ('up', 'down') group by vote."postId") as foo) as bar) as baz
`
})
export class CommentScores {
    @ViewColumn()
    id: number;

    @ViewColumn()
    wilson: number;
}
