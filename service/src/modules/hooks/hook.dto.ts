export class Repository{
    name:string;
    description:string;
    homepage:string;
    git_http_url:string;
    git_ssh_url:string;
    url:string;
    visibility_level:string;
}

export class Author{
    name:string;
    email:string;
}

export class Commit{
    id:string;
    message:string;
    timestamp:string;
    url:string;
    author:Author;
    added:Array<any>;
    modified:Array<string>;
    removed:Array<string>;
}
export class GitNotifyData{
    object_kind:"push"|"tag_push"|"issue"|"merge_request"|"note";
    operation_kind:string;
    action_kind:string;
    before:string;
    after:string;
    ref:string;
    checkout_sha:string;
    user_name:string;
    user_id:number;
    user_email:string;
    project_id:number;
    repository:Repository;
    commits:Array<Commit>;
    total_commits_count:number;
}
